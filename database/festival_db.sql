DROP DATABASE IF EXISTS festival_db;
CREATE DATABASE IF NOT EXISTS festival_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
 
USE festival_db;
 
CREATE TABLE FESTIVAL (
    id_festival  INT          NOT NULL AUTO_INCREMENT,
    nombre       VARCHAR(100) NOT NULL,
    fecha        DATE,
    PRIMARY KEY (id_festival)
) ENGINE=InnoDB;
 
CREATE TABLE NOCHE (
    id_noche     INT  NOT NULL AUTO_INCREMENT,
    numero_noche INT  NOT NULL,
    fecha        DATE NOT NULL,
    hora_inicio  TIME NOT NULL,
    id_festival  INT  NOT NULL,
    PRIMARY KEY (id_noche),
    CONSTRAINT fk_noche_festival
        FOREIGN KEY (id_festival) REFERENCES FESTIVAL (id_festival)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE TABLE GRUPO (
    id_grupo INT          NOT NULL AUTO_INCREMENT,
    nombre   VARCHAR(100) NOT NULL,
    horario  VARCHAR(50),
    PRIMARY KEY (id_grupo)
) ENGINE=InnoDB;
 
CREATE TABLE NOCHE_GRUPO (
    id_noche INT NOT NULL,
    id_grupo INT NOT NULL,
    PRIMARY KEY (id_noche, id_grupo),
    CONSTRAINT fk_ng_noche
        FOREIGN KEY (id_noche) REFERENCES NOCHE (id_noche)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ng_grupo
        FOREIGN KEY (id_grupo) REFERENCES GRUPO (id_grupo)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE TABLE PRECIO (
    id_precio INT            NOT NULL AUTO_INCREMENT,
    monto     DECIMAL(10,2)  NOT NULL,
    id_noche  INT            NOT NULL,
    PRIMARY KEY (id_precio),
    CONSTRAINT fk_precio_noche
        FOREIGN KEY (id_noche) REFERENCES NOCHE (id_noche)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE TABLE SECTOR (
    id_sector INT          NOT NULL AUTO_INCREMENT,
    nombre    VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_sector)
) ENGINE=InnoDB;
 
CREATE TABLE FILA (
    id_fila   INT NOT NULL AUTO_INCREMENT,
    numero    INT NOT NULL,
    id_sector INT NOT NULL,
    PRIMARY KEY (id_fila),
    CONSTRAINT fk_fila_sector
        FOREIGN KEY (id_sector) REFERENCES SECTOR (id_sector)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE TABLE BUTACA (
    id_butaca INT NOT NULL AUTO_INCREMENT,
    numero    INT NOT NULL,
    id_fila   INT NOT NULL,
    PRIMARY KEY (id_butaca),
    CONSTRAINT fk_butaca_fila
        FOREIGN KEY (id_fila) REFERENCES FILA (id_fila)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE TABLE TIPO_ENTRADA (
    id_tipo     INT          NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_tipo)
) ENGINE=InnoDB;
 
CREATE TABLE PUNTO_VENTA (
    id_punto  INT          NOT NULL AUTO_INCREMENT,
    nombre    VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200),
    PRIMARY KEY (id_punto)
) ENGINE=InnoDB;
 
CREATE TABLE CLIENTE (
    id_cliente INT          NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    dni        VARCHAR(20)  NOT NULL UNIQUE,
    direccion  VARCHAR(200),
    email      VARCHAR(150),
    contrasena VARCHAR(255) NOT NULL, -- Agregado para soportar Login
    PRIMARY KEY (id_cliente)
) ENGINE=InnoDB;
 
CREATE TABLE DESCUENTO (
    id_descuento INT           NOT NULL AUTO_INCREMENT,
    porcentaje   DECIMAL(5,2)  NOT NULL,
    fecha_limite DATE          NOT NULL,
    PRIMARY KEY (id_descuento)
) ENGINE=InnoDB;
 
CREATE TABLE CLIENTE_DESCUENTO (
    id_cliente   INT NOT NULL,
    id_descuento INT NOT NULL,
    PRIMARY KEY (id_cliente, id_descuento),
    CONSTRAINT fk_cd_cliente
        FOREIGN KEY (id_cliente) REFERENCES CLIENTE (id_cliente)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cd_descuento
        FOREIGN KEY (id_descuento) REFERENCES DESCUENTO (id_descuento)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE TABLE ENTRADA (
    id_entrada   INT          NOT NULL AUTO_INCREMENT,
    fecha_venta  DATE         NOT NULL,
    codigoBarra  VARCHAR(50)  NOT NULL UNIQUE,
    id_precio    INT          NOT NULL,
    id_tipo      INT          NOT NULL,
    id_punto     INT          NOT NULL,
    id_cliente   INT          NOT NULL,
    id_butaca    INT          NOT NULL,
    id_descuento INT,
    PRIMARY KEY (id_entrada),
    CONSTRAINT fk_entrada_precio
        FOREIGN KEY (id_precio)    REFERENCES PRECIO      (id_precio)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_tipo
        FOREIGN KEY (id_tipo)      REFERENCES TIPO_ENTRADA (id_tipo)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_punto
        FOREIGN KEY (id_punto)     REFERENCES PUNTO_VENTA  (id_punto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_cliente
        FOREIGN KEY (id_cliente)   REFERENCES CLIENTE      (id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_butaca
        FOREIGN KEY (id_butaca)    REFERENCES BUTACA       (id_butaca)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_descuento
        FOREIGN KEY (id_descuento) REFERENCES DESCUENTO    (id_descuento)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
 
CREATE INDEX idx_noche_festival  ON NOCHE   (id_festival);
CREATE INDEX idx_precio_noche    ON PRECIO  (id_noche);
CREATE INDEX idx_fila_sector     ON FILA    (id_sector);
CREATE INDEX idx_butaca_fila     ON BUTACA  (id_fila);
CREATE INDEX idx_entrada_cliente ON ENTRADA (id_cliente);
CREATE INDEX idx_entrada_fecha   ON ENTRADA (fecha_venta);
CREATE INDEX idx_cliente_dni     ON CLIENTE (dni);
