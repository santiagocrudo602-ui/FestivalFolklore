# Festival Folklore - Backend (Node.js & SQLite)

Este es el Producto Final del sistema de gestión y venta de entradas para el **Festival Musical**, desarrollado en **Node.js, Express y SQLite**.

## 🚀 Mejoras Implementadas Recientemente

A lo largo de las últimas iteraciones se ha evolucionado el sistema base para incluir estándares de seguridad modernos y una mejor experiencia de usuario:

### 1. Seguridad de Contraseñas (Bcrypt)
- Las contraseñas ya no se guardan en texto plano. Se implementó `bcrypt` para hashear las contraseñas al momento de registrarse.
- Durante el inicio de sesión, se utiliza `bcrypt.compare` para validar las credenciales contra la base de datos de forma segura.

### 2. Autenticación con JWT (JSON Web Tokens)
- El acceso al sistema ahora se gestiona mediante tokens JWT con expiración de 2 horas.
- Al iniciar sesión correctamente, el backend emite un Token firmado que el frontend almacena en `localStorage`.
- Se implementó un middleware (`middleware/auth.js`) que intercepta y protege las rutas sensibles (como la compra de entradas y visualización del perfil), exigiendo el envío del token en el header `Authorization: Bearer <token>`.

### 3. Autenticación de Dos Factores (2FA) por Email
- Se añadió una capa de seguridad extra en el proceso de Login.
- Al validar usuario y contraseña, el servidor genera un código de 6 dígitos mediante `crypto.randomInt` y lo envía por correo utilizando **Nodemailer** y **Ethereal Email** (entorno de pruebas).
- El código se almacena temporalmente en la memoria del servidor (`Map`) con un *Time To Live* (TTL) de 5 minutos antes de expirar automáticamente.
- El usuario debe introducir el código recibido en un segundo paso para obtener finalmente su Token JWT.

### 4. Flexibilidad en la Compra (id_punto)
- El controlador de ventas se refactorizó para dejar de usar valores hardcodeados (`id_punto = 1`).
- Ahora el backend desestructura el `id_punto` dinámicamente desde el cuerpo de la petición (`req.body`), soportando múltiples puntos de venta físicos o virtuales, pero manteniendo un fallback a `1` para retrocompatibilidad.
- Se ha mejorado el control de errores capturando fallos de SQLite como la restricción UNIQUE de DNI duplicado, informando debidamente al usuario con un `400 Bad Request`.

### 5. Panel "Mis Entradas"
- Se creó el endpoint protegido `GET /api/clientes/:id/entradas` que cruza tablas (`ENTRADA`, `PRECIO`, `NOCHE`, `BUTACA`) para obtener todo el historial de compras de un usuario específico.
- Se construyó una nueva vista frontend dinámica (`views/mis_entradas.html`) implementada con Bootstrap, que consume la API usando Fetch y el JWT.
- Se integró la navegación directamente en el menú de "Mi Perfil" en la barra de navegación para un fácil acceso.

## 📦 Tecnologías Usadas
* **Backend:** Node.js, Express.js
* **Base de Datos:** SQLite (`sqlite3`)
* **Seguridad:** `bcrypt`, `jsonwebtoken`, `crypto`
* **Mailing:** `nodemailer` (Ethereal)
* **Frontend:** HTML5, Vanilla JavaScript, CSS, Bootstrap 5

## 🔧 Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Inicializar la base de datos (Ejecutar solo la primera vez o para resetear):
   ```bash
   node database/initDB.js
   ```

3. Levantar el servidor:
   ```bash
   npm start
   ```

El servidor estará corriendo en `http://localhost:3000`.
