# Reporte de Pruebas: Sistema Festival Folklore

**Fecha de ejecución:** 29 de Junio de 2026
**Entorno de pruebas:** Localhost (Node.js + Express + SQLite)

A continuación se presentan los resultados de las pruebas manuales e integrales sobre la API y la lógica transaccional del sistema.

---

### Tabla de Resultados

| Funcionalidad | Caso de Prueba | Resultado | Observaciones / Comportamiento Esperado |
| :--- | :--- | :--- | :--- |
| **1. Registro de usuario** | Registrarse con datos válidos | ✅ Aprobado | Se crea el registro correctamente (Status 200) y devuelve el `id` del cliente. |
| | Registrarse con email ya existente | ✅ Aprobado | Devuelve correctamente código `400` mostrando el error: "El correo electrónico ya está registrado." |
| | Registrarse con campos vacíos | ✅ Aprobado | Devuelve correctamente código `400` indicando: "Faltan campos obligatorios." |
| | Registrarse con contraseña débil | ❌ Fallido | El sistema carece de reglas de fortaleza en el backend. Admite contraseñas cortas o débiles (ej: "123"). |
| **2. Login y 2FA** | Login con credenciales válidas | ✅ Aprobado | Retorna `require2FA: true` y envía exitosamente el código vía Nodemailer Ethereal (imprime URL en consola). |
| | Código correcto dentro de 5 minutos | ✅ Aprobado | Valida el mapa en memoria y devuelve el `token` JWT con 2h de expiración. |
| | Código incorrecto | ✅ Aprobado | Deniega el acceso con status `401` ("Código inválido o expirado"). |
| | Código expirado (> 5 mins) | ✅ Aprobado | El `setTimeout` del backend elimina la entrada; retorna `401` tras superar el límite. |
| | Login con contraseña incorrecta | ✅ Aprobado | Rechazado con status `401` ("Credenciales inválidas."). |
| | Login con usuario inexistente | ✅ Aprobado | Rechazado con status `401` ("Credenciales inválidas."). |
| **3. Protección de rutas**| Acceder sin token JWT | ✅ Aprobado | El middleware atrapa el request y arroja `401` ("Acceso denegado. No se proporcionó token"). |
| | Acceder con token expirado | ✅ Aprobado | El middleware atrapa el `TokenExpiredError` y deniega con `401`. |
| | Acceder con token manipulado | ✅ Aprobado | JWT rechaza la firma modificada y deniega el paso con `401`. |
| **4. Visualización noches**| Listado de noches y artistas | ✅ Aprobado | El endpoint público devuelve la lista de noches, precios y grilla sin requerir token (Status 200). |
| **5. Compra de entradas** | Flujo completo de compra exitoso | ✅ Aprobado | Inserta con éxito; la API devuelve el nuevo código de barras (`FEST-2026-X`) y factura (`FAC-0001-X`). |
| | Comprar butaca ya ocupada | ✅ Aprobado | Detecta el doble intento, hace `ROLLBACK` y arroja `409` ("La butaca seleccionada ya fue vendida a otro usuario"). |
| | Faltan datos en la confirmación | ✅ Aprobado | Frena la ejecución rápido (ej: sin `nocheId` o `sectorId`) con `400` ("Datos incompletos"). |
| **6. Concurrencia** | Simulación de colisión simultánea | ✅ Aprobado | Excelente implementación de `purchaseMutex` (Queue en Javascript) sumado a un candado SQL de `BEGIN EXCLUSIVE TRANSACTION`. Solo pasa 1 compra, el otro recibe el `409` de ocupado. |
| **7. Mis Entradas** | Usuario con historial de entradas | ✅ Aprobado | Retorna array 200 con todo el historial, con la lógica de JOIN aplicada por el `ClienteModel`. |
| | Usuario sin entradas | ✅ Aprobado | Devuelve un arreglo vacío `[]` de manera controlada. |
| | Acceso anónimo no autenticado | ✅ Aprobado | Rechazado en el acto por la validación `authMiddleware`. |
| **8. Panel administrativo**| Acceder con usuario administrador | ❌ Fallido | La interfaz real integrada al servidor no existe. Las métricas que ves en `dashboard2.html` están mockeadas, no leen de la base de datos dinámica de SQLite. |
| | Proteger rutas admin contra clientes | ❌ Fallido | CRÍTICO: Los endpoints de gestión del administrador (`/api/admin/noches`) no tienen inyectado el `authMiddleware` ni chequean roles, ¡Están públicos a cualquier usuario que haga un POST o DELETE directo! (Además, fallan con error 500 porque se referenció la columna `titulo` que no existe en SQLite). |

---

### Conclusiones y Diagnóstico:
La arquitectura base (MVC, JWT, Base de Datos, Controladores) para los clientes es sumamente **robusta**. Funciona impecable frente al estrés y gestiona maravillosamente la concurrencia que suele ser un gran problema en la venta de asientos.

**Los puntos críticos de falla a resolver antes de subir a producción son:**
1. Validar la fuerza de la contraseña de los clientes al registrarse.
2. Intervenir urgentemente las rutas del administrador para protegerlas de accesos públicos y arreglar los nombres de columnas en base de datos.
3. Conectar finalmente el dashboard administrativo (las métricas Chart.js) a las verdaderas APIs del backend.
