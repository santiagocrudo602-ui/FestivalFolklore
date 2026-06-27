console.log('Frontend script loaded successfully');

// Protección de rutas global
const currentPath = window.location.pathname;
const usuarioLogueado = localStorage.getItem('usuario');

if (!usuarioLogueado && currentPath.includes('butacas.html')) {
    window.location.href = 'login.html';
}

function generarIdUnico() {
    return Math.floor(Math.random() * 1000000);
}

document.addEventListener('db_ready', () => {
    console.log("DB Ready Event Fired - Inicializando UI");
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

    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.addEventListener('submit', verificarCodigo);
    }

    // 4. Lógica para el Detalle de Noche
    if (window.location.pathname.includes('noche_detalle')) {
        cargarDetalleNoche();
    }
});

function actualizarNavbar() {
    const navbarMsAuto = document.querySelector('.navbar-nav.ms-auto');
    if (navbarMsAuto && usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        const depth = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'views/' : '';
        navbarMsAuto.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle fw-bold text-info" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    👤 Mi Perfil
                </a>
                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="navbarDropdown">
                    <li><h6 class="dropdown-header">${usuario.nombre} ${usuario.apellido}</h6></li>
                    <li><a class="dropdown-item" href="${depth}mis_entradas.html">Mis Entradas</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="cerrarSesion()">Cerrar sesión</a></li>
                </ul>
            </li>
        `;
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    const depth = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'views/' : '';
    window.location.href = depth + 'login.html';
}

let tempUsuario = null;

async function iniciarSesion(event) {
    event.preventDefault();
    
    const email = document.getElementById('login_email').value;
    const contrasena = document.getElementById('login_password').value;

    try {
        const rows = window.queryDB('SELECT * FROM CLIENTE WHERE email = ? AND contrasena = ?', [email, contrasena]);
        
        if (rows.length > 0) {
            tempUsuario = rows[0];
            delete tempUsuario.contrasena;
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('verifyForm').style.display = 'block';
        } else {
            alert('Error: Credenciales inválidas.');
        }
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        alert('Error local ejecutando consulta.');
    }
}

function verificarCodigo(event) {
    event.preventDefault();
    const codigo = document.getElementById('verify_code').value;
    if (codigo.length === 6) {
        localStorage.setItem('usuario', JSON.stringify(tempUsuario));
        const depth = window.location.pathname.includes('views') ? '../' : '';
        window.location.href = depth + 'index.html';
    } else {
        alert('Ingresa un código de 6 dígitos válido.');
    }
}

async function cargarNoches(container) {
    try {
        const rows = window.queryDB('SELECT * FROM NOCHE ORDER BY fecha ASC');
        if (rows.length > 0) {
            container.innerHTML = '';
            rows.forEach(noche => {
                const fechaStr = noche.fecha ? noche.fecha.toString() : '';
                const fecha = new Date(fechaStr).toLocaleDateString('es-ES');
                
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
            container.innerHTML = '<p class="text-warning">No hay noches cargadas en la BD estática.</p>';
        }
    } catch (error) {
        console.error('Error fetching noches:', error);
        container.innerHTML = '<p class="text-danger">Error consultando SQLite local.</p>';
    }
}

function verDetalleNoche(id_noche, numero, fecha) {
    localStorage.setItem('nocheActual', JSON.stringify({ id_noche, numero, fecha }));
    const depth = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'views/' : '';
    window.location.href = depth + 'noche_detalle.html';
}

async function cargarDetalleNoche() {
    const nocheInfo = JSON.parse(localStorage.getItem('nocheActual'));
    if (nocheInfo) {
        document.getElementById('noche-titulo').textContent = `Noche ${nocheInfo.numero}`;
        document.getElementById('noche-fecha').textContent = nocheInfo.fecha;

        try {
            const query = `
                SELECT g.id_grupo, g.nombre, g.horario 
                FROM GRUPO g
                JOIN NOCHE_GRUPO ng ON g.id_grupo = ng.id_grupo
                WHERE ng.id_noche = ?
                ORDER BY g.horario ASC
            `;
            const grupos = window.queryDB(query, [nocheInfo.id_noche]);
            
            const descContainer = document.getElementById('noche-descripcion');
            if (grupos.length > 0) {
                let html = '<ul class="list-unstyled mt-3">';
                grupos.forEach(grupo => {
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
}

async function registrarCliente(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = [
        formData.get('nombre'), formData.get('apellido'), formData.get('dni'),
        formData.get('direccion'), formData.get('email'), formData.get('contrasena')
    ];

    try {
        const query = `
            INSERT INTO CLIENTE (nombre, apellido, dni, direccion, email, contrasena)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        window.queryDB(query, data);
        alert('¡Registro exitoso! (Aviso: como estás en GitHub Pages, los datos se borrarán al recargar)');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrarse. DNI o Email pueden estar duplicados.');
    }
}

function toggleButaca(element) {
    element.classList.toggle('selected');
    actualizarCantidad();
}

function actualizarCantidad() {
    const seleccionadas = document.querySelectorAll('.butaca.selected').length;
    const countEl = document.getElementById('cantidadDisplay');
    const configStr = localStorage.getItem('configCompra');
    let max = 0;
    if (configStr) {
        max = JSON.parse(configStr).cantidad;
    }
    if(countEl) countEl.textContent = `${seleccionadas} / ${max}`;

    if (seleccionadas > max) {
        alert(`Has alcanzado el límite de ${max} butaca(s) seleccionadas.`);
        document.querySelectorAll('.butaca.selected')[seleccionadas - 1].classList.remove('selected');
        countEl.textContent = `${max} / ${max}`;
    }
}

function modificarCantidad(delta) {
    const input = document.getElementById('compra_cantidad');
    if (!input) return;
    
    let value = parseInt(input.value) || 1;
    value += delta;
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    input.value = value;
}

function irAButacas() {
    const cantidad = document.getElementById('compra_cantidad').value;
    const sector = document.getElementById('compra_sector').value;
    const publico = document.getElementById('compra_publico').value;
    
    localStorage.setItem('configCompra', JSON.stringify({
        cantidad: parseInt(cantidad),
        sectorId: sector,
        publicoId: publico
    }));
    
    const depth = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'views/' : '';
    window.location.href = depth + 'butacas.html';
}

async function finalizarCompra() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
        alert('Debes iniciar sesión para comprar entradas.');
        window.location.href = 'login.html';
        return;
    }
    const usuario = JSON.parse(usuarioStr);
    const config = JSON.parse(localStorage.getItem('configCompra'));
    if (!config) {
        alert('No hay una configuración de compra activa.');
        window.location.href = '../index.html';
        return;
    }

    const seleccionadas = document.querySelectorAll('.butaca.selected').length;
    if (seleccionadas !== config.cantidad) {
        alert(`Debes seleccionar exactamente ${config.cantidad} butaca(s) antes de finalizar.`);
        return;
    }

    try {
        const hoy = new Date().toISOString().split('T')[0];
        const codigosGenerados = [];

        for (let i = 0; i < config.cantidad; i++) {
            const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
            const codigoBarra = `FEST-2026-${hash}`;
            
            const hashFactura = Math.random().toString(36).substring(2, 8).toUpperCase();
            const numero_factura = `FAC-0001-${hashFactura}`;

            const id_precio = 1;
            const id_punto = 1;
            const id_butaca = Math.floor(Math.random() * 30) + 1;
            // No hacemos el INSERT en la DB simulada para este campo nuevo para no romper sql.js antiguo, solo visual.
            codigosGenerados.push({ codigoBarra, numero_factura });
        }

        const codigosStr = codigosGenerados.map(c => 
            `Entrada: ${c.codigoBarra} (Factura: ${c.numero_factura})`
        ).join('\n');
        
        alert(`¡Entradas reservadas con éxito!\n\nCódigos Generados:\n${codigosStr}\n\n(Nota: La reserva es temporal debido al modo estático en GitHub Pages).`);
        
        localStorage.removeItem('configCompra');
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error al comprar:', error);
        alert('Ocurrió un error al intentar finalizar la compra: ' + error.message);
    }
}
