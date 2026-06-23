# Checklist de Testing – Festival Folklore (Versión Node.js – Producto Final)

---

## Configuración y arranque

- [ ] Correr `npm install` y verificar que no hay errores
- [ ] Levantar el servidor con `npm start` y confirmar que aparece `Servidor iniciado: http://localhost:3000`
- [ ] Confirmar que el archivo `database/festival.db` tiene los datos del seed (noches, grupos, clientes de prueba)

---

## Login y Registro

- [ ] Registrar un cliente nuevo con todos los campos completos — debe redirigir a `/login`
- [ ] Intentar registrar con un email ya existente — debe mostrar mensaje de error claro
- [ ] Intentar registrar sin completar campos obligatorios — debe mostrar error
- [ ] Iniciar sesión con credenciales correctas (`juan@mail.com` / `123456`) — debe redirigir a `/`
- [ ] Iniciar sesión con credenciales incorrectas — debe mostrar "Credenciales inválidas"
- [ ] Verificar que al hacer login, el navbar cambia y muestra "Mi Perfil"
- [ ] Cerrar sesión y confirmar que redirige a `/login`

---

## Protección de rutas

- [ ] **BUG A REVISAR**: la protección actual bloquea `/` si no hay sesión — verificar si el home debe ser público o no
- [ ] Sin sesión iniciada, intentar entrar a `/butacas` directamente — debe redirigir a `/login`
- [ ] Sin sesión iniciada, intentar entrar a `/noche_detalle` directamente — verificar comportamiento

---

## Ver noches del festival

- [ ] Entrar a `/noches` y verificar que se cargan las 5 noches desde la BD (no datos hardcodeados)
- [ ] Hacer click en "Saber más" de cada noche y verificar que muestra los artistas correctos
- [ ] Verificar que los artistas aparecen ordenados por horario
- [ ] Entrar directo a `/noche_detalle` sin pasar por la lista de noches — verificar qué pasa si no hay `nocheActual` en localStorage

---

## Compra de entradas

- [ ] Abrir el modal de compra desde el navbar ("Entradas") — verificar que el modal existe y abre correctamente
- [ ] Seleccionar cantidad, sector y tipo de público, y hacer click en "Ir a butacas" — debe redirigir a `/butacas`
- [ ] En `/butacas`, verificar que el subtítulo muestra la cantidad correcta elegida
- [ ] Seleccionar más butacas que la cantidad permitida — debe mostrar alerta y bloquear la selección
- [ ] Finalizar la compra con la cantidad exacta de butacas seleccionadas — debe mostrar los códigos generados (`FEST-2026-XXXXXXXX`)
- [ ] Verificar en la BD que las entradas quedaron registradas en la tabla `ENTRADA`
- [ ] **BUG A REVISAR**: la `id_butaca` guardada en la BD es aleatoria, no la seleccionada en pantalla
- [ ] **BUG A REVISAR**: el `id_precio` siempre se guarda como `1` sin importar la noche
- [ ] **A VERIFICAR**: que `id_cliente` llega correctamente al backend (el campo puede llamarse `id` o `id_cliente` según el login)
- [ ] Intentar finalizar la compra sin haber seleccionado suficientes butacas — debe mostrar alerta

---

## Base de datos

- [ ] Confirmar que la BD usa SQLite (no MySQL) — el `.env` dice MySQL pero el código usa `festival.db`
- [ ] Aclararlo en el README para que el profe no se confunda al querer levantar el proyecto
- [ ] Verificar que las foreign keys están activas (`PRAGMA foreign_keys = ON` está en `database.js`)

---

## Para la demo en video

- [ ] Mostrar el flujo completo: Registro → Login → Ver noches → Ver detalle de noche → Comprar entradas → Código generado
- [ ] Tener el usuario de prueba listo: `juan@mail.com` / `123456`
- [ ] Asegurarse de que el servidor esté corriendo antes de grabar
- [ ] Mostrar brevemente la tabla `ENTRADA` en la BD después de la compra para demostrar que los datos persisten
