const { getDb } = require('../config/database');

const schema = `
CREATE TABLE IF NOT EXISTS FESTIVAL (
    id_festival  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre       VARCHAR(100) NOT NULL,
    fecha        DATE
);
 
CREATE TABLE IF NOT EXISTS NOCHE (
    id_noche     INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_noche INT  NOT NULL,
    fecha        DATE NOT NULL,
    hora_inicio  TIME NOT NULL,
    id_festival  INT  NOT NULL,
    FOREIGN KEY (id_festival) REFERENCES FESTIVAL (id_festival) ON DELETE RESTRICT ON UPDATE CASCADE
);
 
CREATE TABLE IF NOT EXISTS GRUPO (
    id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   VARCHAR(100) NOT NULL,
    horario  VARCHAR(50)
);
 
CREATE TABLE IF NOT EXISTS NOCHE_GRUPO (
    id_noche INT NOT NULL,
    id_grupo INT NOT NULL,
    PRIMARY KEY (id_noche, id_grupo),
    FOREIGN KEY (id_noche) REFERENCES NOCHE (id_noche) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_grupo) REFERENCES GRUPO (id_grupo) ON DELETE CASCADE ON UPDATE CASCADE
);
 
CREATE TABLE IF NOT EXISTS PRECIO (
    id_precio INTEGER PRIMARY KEY AUTOINCREMENT,
    monto     DECIMAL(10,2)  NOT NULL,
    id_noche  INT            NOT NULL,
    FOREIGN KEY (id_noche) REFERENCES NOCHE (id_noche) ON DELETE RESTRICT ON UPDATE CASCADE
);
 
CREATE TABLE IF NOT EXISTS SECTOR (
    id_sector INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    VARCHAR(100) NOT NULL
);
 
CREATE TABLE IF NOT EXISTS FILA (
    id_fila   INTEGER PRIMARY KEY AUTOINCREMENT,
    numero    INT NOT NULL,
    id_sector INT NOT NULL,
    FOREIGN KEY (id_sector) REFERENCES SECTOR (id_sector) ON DELETE RESTRICT ON UPDATE CASCADE
);
 
CREATE TABLE IF NOT EXISTS BUTACA (
    id_butaca INTEGER PRIMARY KEY AUTOINCREMENT,
    numero    INT NOT NULL,
    id_fila   INT NOT NULL,
    FOREIGN KEY (id_fila) REFERENCES FILA (id_fila) ON DELETE RESTRICT ON UPDATE CASCADE
);
 
CREATE TABLE IF NOT EXISTS TIPO_ENTRADA (
    id_tipo     INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion VARCHAR(100) NOT NULL
);
 
CREATE TABLE IF NOT EXISTS PUNTO_VENTA (
    id_punto  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200)
);
 
CREATE TABLE IF NOT EXISTS CLIENTE (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    dni        VARCHAR(20)  NOT NULL UNIQUE,
    direccion  VARCHAR(200),
    email      VARCHAR(150),
    contrasena VARCHAR(255) NOT NULL
);
 
CREATE TABLE IF NOT EXISTS DESCUENTO (
    id_descuento INTEGER PRIMARY KEY AUTOINCREMENT,
    porcentaje   DECIMAL(5,2)  NOT NULL,
    fecha_limite DATE          NOT NULL
);
 
CREATE TABLE IF NOT EXISTS CLIENTE_DESCUENTO (
    id_cliente   INT NOT NULL,
    id_descuento INT NOT NULL,
    PRIMARY KEY (id_cliente, id_descuento),
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_descuento) REFERENCES DESCUENTO (id_descuento) ON DELETE CASCADE ON UPDATE CASCADE
);
 
CREATE TABLE IF NOT EXISTS ENTRADA (
    id_entrada   INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_venta  DATE         NOT NULL,
    codigoBarra  VARCHAR(50)  NOT NULL UNIQUE,
    id_precio    INT          NOT NULL,
    id_tipo      INT          NOT NULL,
    id_punto     INT          NOT NULL,
    id_cliente   INT          NOT NULL,
    id_butaca    INT          NOT NULL,
    id_descuento INT,
    FOREIGN KEY (id_precio)    REFERENCES PRECIO      (id_precio) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_tipo)      REFERENCES TIPO_ENTRADA (id_tipo) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_punto)     REFERENCES PUNTO_VENTA  (id_punto) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente)   REFERENCES CLIENTE      (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_butaca)    REFERENCES BUTACA       (id_butaca) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_descuento) REFERENCES DESCUENTO    (id_descuento) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_noche_festival  ON NOCHE   (id_festival);
CREATE INDEX IF NOT EXISTS idx_precio_noche    ON PRECIO  (id_noche);
CREATE INDEX IF NOT EXISTS idx_fila_sector     ON FILA    (id_sector);
CREATE INDEX IF NOT EXISTS idx_butaca_fila     ON BUTACA  (id_fila);
CREATE INDEX IF NOT EXISTS idx_entrada_cliente ON ENTRADA (id_cliente);
CREATE INDEX IF NOT EXISTS idx_cliente_dni     ON CLIENTE (dni);
`;

const seedData = `
-- 1. FESTIVAL
INSERT INTO FESTIVAL (nombre, fecha) VALUES ('Festival Nacional de Folklore 2026', '2026-02-10');

-- 2. NOCHES
INSERT INTO NOCHE (numero_noche, fecha, hora_inicio, id_festival) VALUES 
(1, '2026-02-10', '21:00:00', 1),
(2, '2026-02-11', '21:00:00', 1),
(3, '2026-02-12', '21:00:00', 1),
(4, '2026-02-13', '21:00:00', 1),
(5, '2026-02-14', '21:00:00', 1);

-- 3. GRUPOS FOLKLÓRICOS
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

-- 4. NOCHE_GRUPO
INSERT INTO NOCHE_GRUPO (id_noche, id_grupo) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8), (3, 9),
(4, 10), (4, 11), (4, 12),
(5, 13), (5, 14), (5, 15);

-- 5. SECTORES
INSERT INTO SECTOR (nombre) VALUES 
('Sector A - Rojo (VIP)'),
('Sector B - Azul (Platea)'),
('Sector C - Verde (Popular)');

-- 6. FILAS
INSERT INTO FILA (numero, id_sector) VALUES 
(1, 1), (2, 1),
(1, 2), (2, 2),
(1, 3), (2, 3);

-- 7. BUTACAS
INSERT INTO BUTACA (numero, id_fila) VALUES 
(1,1), (2,1), (3,1), (4,1), (5,1),
(1,2), (2,2), (3,2), (4,2), (5,2),
(1,3), (2,3), (3,3), (4,3), (5,3),
(1,4), (2,4), (3,4), (4,4), (5,4),
(1,5), (2,5), (3,5), (4,5), (5,5),
(1,6), (2,6), (3,6), (4,6), (5,6);

-- 8. PUNTOS DE VENTA
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
INSERT INTO PRECIO (monto, id_noche) VALUES 
(15000.00, 1),
(18000.00, 2),
(20000.00, 3),
(15000.00, 4),
(25000.00, 5);

-- 11. DESCUENTOS
INSERT INTO DESCUENTO (porcentaje, fecha_limite) VALUES 
(10.00, '2026-01-10');

-- 12. CLIENTES DE PRUEBA
INSERT INTO CLIENTE (nombre, apellido, dni, direccion, email, contrasena) VALUES 
('Admin', 'Organizador', '11111111', 'Muni 123', 'admin@folklore.com', '$2b$10$RddgVs2pnU0t.hHt5pU81.kPRS3xQwDx8hJ9AUkqZ8EEa33mv8qES'),
('Juan', 'Pérez', '22222222', 'Calle Falsa 123', 'juan@mail.com', '$2b$10$z7OHTfb7akAkhedNW6mr4uoYZanOjmdXEidcJW1RQl.BLWPOqG7qS');
`;

async function init() {
    try {
        console.log("Conectando a SQLite...");
        const db = await getDb();
        
        console.log("Creando tablas...");
        await db.exec(schema);
        
        // Verificar si ya hay datos
        const count = await db.get('SELECT COUNT(*) as count FROM FESTIVAL');
        if (count.count === 0) {
            console.log("Insertando datos semilla (seed data)...");
            await db.exec(seedData);
            console.log("Datos semilla insertados correctamente.");
        } else {
            console.log("La base de datos ya contiene datos. Saltando seed.");
        }
        
        console.log("Base de datos lista para usar.");
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
    }
}

init();
