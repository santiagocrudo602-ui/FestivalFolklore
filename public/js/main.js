console.log('Frontend script loaded successfully');

// Protección de rutas global
const currentPath = window.location.pathname;
const usuarioLogueado = localStorage.getItem('usuario');

if (!usuarioLogueado && currentPath !== '/login' && currentPath !== '/registro') {
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarNavbar();

    // 1. Lógica para la vista de Noches
    const nochesContainer = document.getElementById('noches-container');
    if (nochesContainer) {
        cargarNoches(nochesContainer);
    }

    // 2. Lógica para el Registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', registrarCliente);
    }

    // 3. Lógica para el Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', iniciarSesion);
    }
});

function actualizarNavbar() {
    const navbarMsAuto = document.querySelector('.navbar-nav.ms-auto');
    if (navbarMsAuto && usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        navbarMsAuto.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle fw-bold text-info" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    👤 Mi Perfil
                </a>
                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="navbarDropdown">
                    <li><h6 class="dropdown-header">${usuario.nombre_apellido}</h6></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="cerrarSesion()">Cerrar sesión</a></li>
                </ul>
            </li>
        `;
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
}

async function iniciarSesion(event) {
    event.preventDefault();
    
    const data = {
        email: document.getElementById('login_email').value,
        contrasena: document.getElementById('login_password').value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('usuario', JSON.stringify(result.data));
            window.location.href = '/';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        alert('Error de conexión.');
    }
}

// Función para cargar noches desde la Base de Datos
async function cargarNoches(container) {
    try {
        const response = await fetch('/api/noches');
        const result = await response.json();

        if (result.success) {
            container.innerHTML = ''; // Limpiar estático
            result.data.forEach(noche => {
                // Formatear fecha (ej: YYYY-MM-DD -> DD/MM/YYYY)
                const fecha = new Date(noche.fecha).toLocaleDateString('es-ES');
                
                const col = document.createElement('div');
                col.className = 'col-md-4 mb-4';
                col.innerHTML = `
                    <div class="card-custom">
                        <h3>Noche ${noche.numero_noche}</h3>
                        <p>${fecha}</p>
                        <p class="text-secondary small">Inicio: ${noche.hora_inicio}</p>
                        <button class="btn-custom-solid mt-4" onclick="verDetalleNoche(${noche.id_noche}, ${noche.numero_noche}, '${fecha}')">Saber más</button>
                    </div>
                `;
                container.appendChild(col);
            });
        } else {
            container.innerHTML = '<p class="text-danger">Error al cargar las noches.</p>';
        }
    } catch (error) {
        console.error('Error fetching noches:', error);
        container.innerHTML = '<p class="text-danger">Error de conexión con el servidor.</p>';
    }
}

// Función para redirigir al detalle de la noche guardando info en localStorage
function verDetalleNoche(id_noche, numero, fecha) {
    localStorage.setItem('nocheActual', JSON.stringify({ id_noche, numero, fecha }));
    window.location.href = '/noche_detalle';
}

// 3. Lógica para la vista de Detalle de Noche
// Si estamos en noche_detalle.html, cargar información de localStorage
if (window.location.pathname.includes('noche_detalle')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const nocheInfo = JSON.parse(localStorage.getItem('nocheActual'));
        if (nocheInfo) {
            document.getElementById('noche-titulo').textContent = `Noche ${nocheInfo.numero}`;
            document.getElementById('noche-fecha').textContent = nocheInfo.fecha;

            // Fetch a la BD para traer artistas
            try {
                const res = await fetch(`/api/noches/${nocheInfo.id_noche}/grupos`);
                const result = await res.json();
                
                const descContainer = document.getElementById('noche-descripcion');
                if (result.success && result.data.length > 0) {
                    let html = '<ul class="list-unstyled mt-3">';
                    result.data.forEach(grupo => {
                        html += `<li><strong class="text-info">${grupo.horario} hs</strong> - ${grupo.nombre}</li>`;
                    });
                    html += '</ul>';
                    descContainer.innerHTML = html;
                } else {
                    descContainer.innerHTML = '<p>No hay artistas confirmados para esta noche aún.</p>';
                }
            } catch (error) {
                console.error("Error al traer grupos:", error);
            }
        }
    });
}

// Función para manejar el registro de cliente
async function registrarCliente(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        dni: formData.get('dni'),
        direccion: formData.get('direccion'),
        email: formData.get('email'),
        contrasena: formData.get('contrasena')
    };

    try {
        const response = await fetch('/api/clientes/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            window.location.href = '/login';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al registrarse.');
    }
}

// Función para seleccionar butacas (ya usada en butacas.html)
function toggleButaca(element) {
    element.classList.toggle('selected');
    actualizarCantidad();
}

function actualizarCantidad() {
    const seleccionadas = document.querySelectorAll('.butaca.selected').length;
    const countEl = document.getElementById('cantidadDisplay');
    if(countEl) countEl.textContent = seleccionadas;
}

// Modificar cantidad en el modal de compra
function modificarCantidad(delta) {
    const input = document.getElementById('compra_cantidad');
    if (!input) return;
    
    let value = parseInt(input.value) || 1;
    value += delta;
    if (value < 1) value = 1;
    if (value > 10) value = 10; // Limite arbitrario de 10 entradas
    input.value = value;
}

// Guardar intencion de compra y redirigir
function irAButacas() {
    const cantidad = document.getElementById('compra_cantidad').value;
    const sector = document.getElementById('compra_sector').value;
    const publico = document.getElementById('compra_publico').value;
    
    // Guardamos la configuración en localStorage
    localStorage.setItem('configCompra', JSON.stringify({
        cantidad: parseInt(cantidad),
        sectorId: sector,
        publicoId: publico
    }));
    
    // Redirigir a butacas
    window.location.href = '/butacas';
}

// Finalizar la compra y pedir codigos de barra al backend
async function finalizarCompra() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
        alert('Debes iniciar sesión para comprar entradas.');
        window.location.href = '/login';
        return;
    }
    const usuario = JSON.parse(usuarioStr);

    const config = JSON.parse(localStorage.getItem('configCompra'));
    if (!config) {
        alert('No hay una configuración de compra activa.');
        window.location.href = '/';
        return;
    }

    const seleccionadas = document.querySelectorAll('.butaca.selected').length;
    if (seleccionadas !== config.cantidad) {
        alert(`Debes seleccionar exactamente ${config.cantidad} butaca(s) antes de finalizar.`);
        return;
    }

    // id_cliente puede llamarse id o id_cliente dependiendo de cómo devuelve el login (asumimos id o id_cliente)
    const data = {
        id_cliente: usuario.id_cliente || usuario.id, 
        cantidad: config.cantidad,
        sectorId: config.sectorId,
        publicoId: config.publicoId
    };

    try {
        const response = await fetch('/api/entradas/comprar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            const codigosStr = result.codigos.join('\n');
            alert(`¡Entradas reservadas con éxito!\n\nCódigos de Barra Generados:\n${codigosStr}\n\nSerás redirigido a la plataforma de pago de terceros...`);
            
            // Limpiar config y volver al inicio (simulando que fuimos al tercero)
            localStorage.removeItem('configCompra');
            window.location.href = '/';
        } else {
            alert('Error en la compra: ' + result.message);
        }
    } catch (error) {
        console.error('Error al comprar:', error);
        alert('Ocurrió un error al intentar finalizar la compra.');
    }
}
