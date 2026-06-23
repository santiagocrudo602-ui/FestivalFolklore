# Festival Folklore - Plataforma Web

Un sistema integral Full-Stack diseñado para la gestión y visualización de un Festival Nacional de Folklore. Esta plataforma permite a los usuarios explorar las noches del festival, registrarse, y a los organizadores administrar el contenido dinámicamente.

## Tecnologías Utilizadas
- **Frontend:** HTML5, Vanilla CSS, Bootstrap 5, JavaScript Vanilla (Fetch API).
- **Backend:** Node.js, Express.js (Arquitectura MVC - Modelo, Vista, Controlador).
- **Base de Datos:** SQLite (mediante la librería `sqlite3`).
- **Seguridad y Estado:** LocalStorage para manejo de sesiones y estados en frontend.

## Funcionalidades Principales

### Para Usuarios (Clientes)
- **Catálogo de Noches:** Visualización dinámica de todas las noches del festival extraídas directamente de la base de datos.
- **Detalle de Artistas:** Al hacer clic en "Saber más" en una noche, se cargan los artistas y horarios correspondientes.
- **Autenticación:** Sistema de Registro y Login funcional. El sistema protege las rutas de compra solo para usuarios logueados.

### Para Organizadores (Administradores)
Al iniciar sesión con una cuenta de administrador (ej. correos que inician con `admin`), la interfaz se adapta dinámicamente inyectando controles exclusivos:
- **Gestión de Noches (CRUD Completo):**
  - **Crear Noche:** Modal interactivo para añadir una nueva noche a la base de datos.
  - **Títulos Personalizados:** Posibilidad de asignar nombres únicos a cada noche (ej: "Apertura de Gala").
  - **Edición (Lápiz ✏️):** Modificar la fecha, hora o título de una noche existente (Peticiones `PUT` en tiempo real).
  - **Borrado (Basurero 🗑️):** Eliminar noches y sus dependencias de forma segura (Peticiones `DELETE`).

## Arquitectura (MVC)
El proyecto está estructurado profesionalmente:
- `/config`: Conexión a SQLite.
- `/controllers`: Lógica de negocio (`festivalController`, `clienteController`, `adminController`).
- `/models`: Consultas SQL encapsuladas (`festivalModel`, `clienteModel`, `adminModel`).
- `/public`: Archivos estáticos (`css/`, `js/`, `img/`).
- `/views`: Vistas HTML.

## Instalación y Uso Local
1. Clonar el repositorio.
2. Ejecutar `npm install` para instalar dependencias (Express, SQLite3, dotenv).
3. La base de datos viene empaquetada en el archivo `database/festival.db`.
4. Ejecutar `npm start` (o `node server.js`) y abrir `http://localhost:3000` en el navegador.

*Proyecto desarrollado para la materia de UI/Programación.*
