-- ============================================================
--  Festival de Folklore – Esquema de Base de Datos
--  Motor: SQLite 3
--  Generado desde: database/initDB.js
-- ============================================================

-- FESTIVAL
CREATE TABLE IF NOT EXISTS FESTIVAL (
    id_festival  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre       VARCHAR(100) NOT NULL,
    fecha        DATE
);

-- NOCHE
CREATE TABLE IF NOT EXISTS NOCHE (
    id_noche     INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_noche INT  NOT NULL,
    fecha        DATE NOT NULL,
    hora_inicio  TIME NOT NULL,
    id_festival  INT  NOT NULL,
    FOREIGN KEY (id_festival) REFERENCES FESTIVAL (id_festival) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- GRUPO
CREATE TABLE IF NOT EXISTS GRUPO (
    id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   VARCHAR(100) NOT NULL,
    horario  VARCHAR(50)
);

-- NOCHE_GRUPO
CREATE TABLE IF NOT EXISTS NOCHE_GRUPO (
    id_noche INT NOT NULL,
    id_grupo INT NOT NULL,
    PRIMARY KEY (id_noche, id_grupo),
    FOREIGN KEY (id_noche) REFERENCES NOCHE (id_noche) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_grupo) REFERENCES GRUPO (id_grupo) ON DELETE CASCADE ON UPDATE CASCADE
);

-- SECTOR
CREATE TABLE IF NOT EXISTS SECTOR (
    id_sector INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    VARCHAR(100) NOT NULL
);

-- TIPO_ENTRADA
CREATE TABLE IF NOT EXISTS TIPO_ENTRADA (
    id_tipo     INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion VARCHAR(100) NOT NULL
);

-- PRECIO
CREATE TABLE IF NOT EXISTS PRECIO (
    id_precio INTEGER PRIMARY KEY AUTOINCREMENT,
    monto     DECIMAL(10,2) NOT NULL,
    id_noche  INT NOT NULL,
    id_tipo   INT NOT NULL,
    id_sector INT NOT NULL,
    FOREIGN KEY (id_noche)  REFERENCES NOCHE       (id_noche)  ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_tipo)   REFERENCES TIPO_ENTRADA (id_tipo)  ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_sector) REFERENCES SECTOR       (id_sector) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- FILA
CREATE TABLE IF NOT EXISTS FILA (
    id_fila   INTEGER PRIMARY KEY AUTOINCREMENT,
    numero    INT NOT NULL,
    id_sector INT NOT NULL,
    FOREIGN KEY (id_sector) REFERENCES SECTOR (id_sector) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- BUTACA
CREATE TABLE IF NOT EXISTS BUTACA (
    id_butaca INTEGER PRIMARY KEY AUTOINCREMENT,
    numero    INT NOT NULL,
    id_fila   INT NOT NULL,
    FOREIGN KEY (id_fila) REFERENCES FILA (id_fila) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- PUNTO_VENTA
CREATE TABLE IF NOT EXISTS PUNTO_VENTA (
    id_punto  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200)
);

-- CLIENTE
CREATE TABLE IF NOT EXISTS CLIENTE (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    dni        VARCHAR(20)  NOT NULL UNIQUE,
    direccion  VARCHAR(200),
    email      VARCHAR(150),
    contrasena VARCHAR(255) NOT NULL,
    rol        VARCHAR(20) DEFAULT 'user'
);

-- DESCUENTO
CREATE TABLE IF NOT EXISTS DESCUENTO (
    id_descuento INTEGER PRIMARY KEY AUTOINCREMENT,
    porcentaje   DECIMAL(5,2) NOT NULL,
    fecha_limite DATE         NOT NULL
);

-- CLIENTE_DESCUENTO
CREATE TABLE IF NOT EXISTS CLIENTE_DESCUENTO (
    id_cliente   INT NOT NULL,
    id_descuento INT NOT NULL,
    PRIMARY KEY (id_cliente, id_descuento),
    FOREIGN KEY (id_cliente)   REFERENCES CLIENTE   (id_cliente)   ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_descuento) REFERENCES DESCUENTO (id_descuento) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ENTRADA
CREATE TABLE IF NOT EXISTS ENTRADA (
    id_entrada     INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_venta    DATE        NOT NULL,
    codigoBarra    VARCHAR(50) NOT NULL UNIQUE,
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    id_precio      INT NOT NULL,
    id_tipo        INT NOT NULL,
    id_punto       INT NOT NULL,
    id_cliente     INT NOT NULL,
    id_butaca      INT NOT NULL,
    id_descuento   INT,
    FOREIGN KEY (id_precio)    REFERENCES PRECIO      (id_precio)    ON DELETE RESTRICT  ON UPDATE CASCADE,
    FOREIGN KEY (id_tipo)      REFERENCES TIPO_ENTRADA (id_tipo)     ON DELETE RESTRICT  ON UPDATE CASCADE,
    FOREIGN KEY (id_punto)     REFERENCES PUNTO_VENTA  (id_punto)    ON DELETE RESTRICT  ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente)   REFERENCES CLIENTE      (id_cliente)  ON DELETE RESTRICT  ON UPDATE CASCADE,
    FOREIGN KEY (id_butaca)    REFERENCES BUTACA       (id_butaca)   ON DELETE RESTRICT  ON UPDATE CASCADE,
    FOREIGN KEY (id_descuento) REFERENCES DESCUENTO    (id_descuento) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_noche_festival  ON NOCHE   (id_festival);
CREATE INDEX IF NOT EXISTS idx_precio_noche    ON PRECIO  (id_noche);
CREATE INDEX IF NOT EXISTS idx_fila_sector     ON FILA    (id_sector);
CREATE INDEX IF NOT EXISTS idx_butaca_fila     ON BUTACA  (id_fila);
CREATE INDEX IF NOT EXISTS idx_entrada_cliente ON ENTRADA (id_cliente);
CREATE INDEX IF NOT EXISTS idx_cliente_dni     ON CLIENTE (dni);
