-- ==========================================
-- DUMP DATA: FESTIVAL DE FOLKLORE
-- Basado en el enunciado original
-- ==========================================
USE festival_db;

-- 1. FESTIVAL
INSERT INTO FESTIVAL (nombre, fecha) VALUES ('Festival Nacional de Folklore 2026', '2026-02-10');

-- 2. NOCHES (5 noches, de 21:00 a aprox 02:00)
-- Según el enunciado: el festival tiene una duración de generalmente cinco noches.
INSERT INTO NOCHE (numero_noche, fecha, hora_inicio, id_festival) VALUES 
(1, '2026-02-10', '21:00:00', 1),
(2, '2026-02-11', '21:00:00', 1),
(3, '2026-02-12', '21:00:00', 1),
(4, '2026-02-13', '21:00:00', 1),
(5, '2026-02-14', '21:00:00', 1);

-- 3. GRUPOS FOLKLÓRICOS (con reconocimiento regional/provincial/nacional)
INSERT INTO GRUPO (nombre, horario) VALUES 
('Los Nocheros', '21:00 - 22:30'),
('Soledad Pastorutti', '22:30 - 00:00'),
('Chaqueño Palavecino', '00:00 - 01:30'),
('Jorge Rojas', '21:00 - 22:30'),
('Abel Pintos', '22:30 - 00:00'),
('Los Tekis', '00:00 - 01:30'),
('Luciano Pereyra', '21:00 - 22:30'),
('Raly Barrionuevo', '22:30 - 00:00'),
('Dúo Coplanacu', '00:00 - 01:30'),
('Los Huayra', '21:00 - 22:30'),
('Horacio Guarany (Homenaje)', '22:30 - 00:00'),
('Sergio Galleguillo', '00:00 - 01:30'),
('Ahyre', '21:00 - 22:30'),
('Destino San Javier', '22:30 - 00:00'),
('Los Manseros Santiagueños', '00:00 - 01:30');

-- 4. NOCHE_GRUPO (Asignación sin superposiciones ni espacios en blanco)
-- Noche 1
INSERT INTO NOCHE_GRUPO (id_noche, id_grupo) VALUES (1, 1), (1, 2), (1, 3);
-- Noche 2
INSERT INTO NOCHE_GRUPO (id_noche, id_grupo) VALUES (2, 4), (2, 5), (2, 6);
-- Noche 3
INSERT INTO NOCHE_GRUPO (id_noche, id_grupo) VALUES (3, 7), (3, 8), (3, 9);
-- Noche 4
INSERT INTO NOCHE_GRUPO (id_noche, id_grupo) VALUES (4, 10), (4, 11), (4, 12);
-- Noche 5
INSERT INTO NOCHE_GRUPO (id_noche, id_grupo) VALUES (5, 13), (5, 14), (5, 15);

-- 5. SECTORES (Identificados con colores)
INSERT INTO SECTOR (nombre) VALUES 
('Sector A - Rojo (VIP)'),
('Sector B - Azul (Platea)'),
('Sector C - Verde (Popular)');

-- 6. FILAS
INSERT INTO FILA (numero, id_sector) VALUES 
(1, 1), (2, 1), -- Filas del Sector A
(1, 2), (2, 2), -- Filas del Sector B
(1, 3), (2, 3); -- Filas del Sector C

-- 7. BUTACAS (5 por fila para probar)
INSERT INTO BUTACA (numero, id_fila) VALUES 
(1,1), (2,1), (3,1), (4,1), (5,1),
(1,2), (2,2), (3,2), (4,2), (5,2),
(1,3), (2,3), (3,3), (4,3), (5,3),
(1,4), (2,4), (3,4), (4,4), (5,4),
(1,5), (2,5), (3,5), (4,5), (5,5),
(1,6), (2,6), (3,6), (4,6), (5,6);

-- 8. PUNTOS DE VENTA (5 en total según enunciado)
INSERT INTO PUNTO_VENTA (nombre, ubicacion) VALUES 
('Boletería Estadio', 'Estadio Municipal'),
('Centro Comercial Capital 1', 'Patio Olmos'),
('Centro Comercial Capital 2', 'Nuevocentro Shopping'),
('Centro Comercial Capital 3', 'Paseo del Jockey'),
('Centro Comercial Local', 'Plaza Principal Localidad');

-- 9. TIPOS DE ENTRADA
INSERT INTO TIPO_ENTRADA (descripcion) VALUES 
('Mayores'),
('Menores'),
('Jubilados');

-- 10. PRECIOS BÁSICOS POR NOCHE 
-- (El esquema V1 asocia PRECIO a NOCHE directamente. El cálculo final en un caso real usaría combinaciones)
INSERT INTO PRECIO (monto, id_noche) VALUES 
(15000.00, 1),
(18000.00, 2),
(20000.00, 3),
(15000.00, 4),
(25000.00, 5); -- Noche de cierre más cara

-- 11. DESCUENTOS (Venta anticipada)
INSERT INTO DESCUENTO (porcentaje, fecha_limite) VALUES 
(10.00, '2026-01-10'); -- 10% hasta un mes antes

-- 12. CLIENTES DE PRUEBA (con contraseñas básicas para poder hacer login)
INSERT INTO CLIENTE (nombre, apellido, dni, direccion, email, contrasena) VALUES 
('Admin', 'Organizador', '11111111', 'Muni 123', 'admin@folklore.com', 'admin123'),
('Juan', 'Pérez', '22222222', 'Calle Falsa 123', 'juan@mail.com', '123456');
