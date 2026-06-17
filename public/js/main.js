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

    // 4. Lógica para Administradores (Organizadores)
    const adminControls = document.getElementById('admin-controls');
    if (adminControls && usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        // Simulamos que cualquier correo que empiece con "admin" es organizador
        if (usuario.email.toLowerCase().startsWith('admin')) {
            adminControls.style.display = 'block';
        }
    }

    const formAdminNoche = document.getElementById('formAdminNoche');
    if (formAdminNoche) {
        formAdminNoche.addEventListener('submit', crearNocheAdmin);
    }

    const formEditarNoche = document.getElementById('formEditarNoche');
    if (formEditarNoche) {
        formEditarNoche.addEventListener('submit', guardarEdicionNoche);
    }
});

// Función para abrir modal y cargar datos actuales
function abrirModalEditarNoche(id_noche, fechaOriginal, hora_inicio, titulo) {
    document.getElementById('edit_id_noche').value = id_noche;
    document.getElementById('edit_titulo').value = titulo;
    // La fecha en el input tipo date requiere formato YYYY-MM-DD
    // Asumimos que viene formateada o usamos el value directamente de la BD
    document.getElementById('edit_fecha').value = fechaOriginal.split('T')[0]; 
    document.getElementById('edit_hora').value = hora_inicio;
    
    const modalElement = document.getElementById('modalEditarNoche');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Función para manejar el envío del formulario de edición
async function guardarEdicionNoche(event) {
    event.preventDefault();
    
    const id_noche = document.getElementById('edit_id_noche').value;
    const data = {
        titulo: document.getElementById('edit_titulo').value,
        fecha: document.getElementById('edit_fecha').value,
        hora_inicio: document.getElementById('edit_hora').value
    };

    try {
        const response = await fetch('/api/admin/noches/' + id_noche, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('¡Noche actualizada exitosamente!');
            
            const modalElement = document.getElementById('modalEditarNoche');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Recargar noches
            const nochesContainer = document.getElementById('noches-container');
            if (nochesContainer) {
                cargarNoches(nochesContainer);
            }
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error editando noche:', error);
        alert('Error de conexión.');
    }
}

// Función para manejar el borrado de una Noche
async function borrarNocheAdmin(id_noche) {
    if (!confirm('¿Estás seguro de que deseas borrar esta noche de forma permanente? Se borrarán también los artistas asociados a la misma.')) {
        return;
    }

    try {
        const response = await fetch('/api/admin/noches/' + id_noche, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Noche borrada correctamente.');
            // Recargar noches
            const nochesContainer = document.getElementById('noches-container');
            if (nochesContainer) {
                cargarNoches(nochesContainer);
            }
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error borrando noche:', error);
        alert('Error de conexión al intentar borrar.');
    }
}

// Función para manejar el envío del formulario de nueva Noche
async function crearNocheAdmin(event) {
    event.preventDefault();
    
    const data = {
        titulo: document.getElementById('admin_titulo').value,
        fecha: document.getElementById('admin_fecha').value,
        hora_inicio: document.getElementById('admin_hora').value
    };

    try {
        const response = await fetch('/api/admin/noches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('¡Noche creada exitosamente!');
            
            // Cerrar el modal de Bootstrap
            const modalElement = document.getElementById('modalAdminNoche');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
            
            // Limpiar formulario
            document.getElementById('formAdminNoche').reset();

            // Recargar noches
            const nochesContainer = document.getElementById('noches-container');
            if (nochesContainer) {
                cargarNoches(nochesContainer);
            }
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error creando noche:', error);
        alert('Error de conexión.');
    }
}

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
            const usuarioLogged = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')) : null;
            const esAdmin = usuarioLogged && usuarioLogged.email.toLowerCase().startsWith('admin');

            container.innerHTML = ''; // Limpiar estático
            result.data.forEach(noche => {
                // Formatear fecha (ej: YYYY-MM-DD -> DD/MM/YYYY)
                const fecha = new Date(noche.fecha).toLocaleDateString('es-ES');
                
                let btnEditar = '';
                let btnBorrar = '';
                if (esAdmin) {
                    btnEditar = `<button class="btn btn-link p-0 position-absolute text-warning" style="top: 15px; right: 45px; font-size: 1.2rem; text-decoration: none;" onclick="abrirModalEditarNoche(${noche.id_noche}, '${noche.fecha}', '${noche.hora_inicio}', '${noche.titulo}')" title="Editar Noche">✏️</button>`;
                    btnBorrar = `<button class="btn btn-link p-0 position-absolute text-danger" style="top: 15px; right: 15px; font-size: 1.2rem; text-decoration: none;" onclick="borrarNocheAdmin(${noche.id_noche})" title="Borrar Noche">🗑️</button>`;
                }

                const col = document.createElement('div');
                col.className = 'col-md-4 mb-4';
                col.innerHTML = `
                    <div class="card-custom position-relative">
                        <h3>${noche.titulo}</h3>
                        <p>${fecha}</p>
                        <p class="text-secondary small">Inicio: ${noche.hora_inicio}</p>
                        <button class="btn-custom-solid mt-4" onclick="verDetalleNoche(${noche.id_noche}, '${noche.titulo}', '${fecha}')">Saber más</button>
                        ${btnEditar}
                        ${btnBorrar}
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
function verDetalleNoche(id_noche, titulo, fecha) {
    localStorage.setItem('nocheActual', JSON.stringify({ id_noche, titulo, fecha }));
    window.location.href = '/noche_detalle';
}

// 3. Lógica para la vista de Detalle de Noche
// Si estamos en noche_detalle.html, cargar información de localStorage
if (window.location.pathname.includes('noche_detalle')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const nocheInfo = JSON.parse(localStorage.getItem('nocheActual'));
        if (nocheInfo) {
            document.getElementById('noche-titulo').textContent = nocheInfo.titulo;
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
    
    // Obtener valores del formulario
    const data = {
        nombre_apellido: document.getElementById('nombre_apellido').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        contrasena: document.getElementById('contrasena').value,
        ciudad: document.getElementById('ciudad').value,
        localidad: document.getElementById('localidad').value,
        codigo_postal: document.getElementById('codigo_postal').value
    };

    try {
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('¡Registro exitoso! Ya puedes ingresar.');
            window.location.href = '/';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error registrando:', error);
        alert('Error de conexión al intentar registrarse.');
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
