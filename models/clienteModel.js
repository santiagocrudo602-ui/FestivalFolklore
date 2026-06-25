const db = require('../config/database');
const bcrypt = require('bcrypt');

const ClienteModel = {
    create: async (clienteData) => {
        const { nombre, apellido, dni, direccion, email, contrasena } = clienteData;
        const hashedPass = await bcrypt.hash(contrasena, 10);
        const query = `
            INSERT INTO CLIENTE (nombre, apellido, dni, direccion, email, contrasena)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            nombre, apellido, dni, direccion, email, hashedPass
        ]);
        return result.insertId;
    },
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM CLIENTE WHERE email = ?', [email]);
        return rows[0];
    },
    login: async (email, password) => {
        const [rows] = await db.query('SELECT * FROM CLIENTE WHERE email = ?', [email]);
        const user = rows[0];
        if (user && await bcrypt.compare(password, user.contrasena)) {
            return user;
        }
        return null;
    },
    getEntradas: async (id_cliente) => {
        const query = `
            SELECT 
                e.codigoBarra, 
                e.fecha_venta, 
                n.numero_noche as noche, 
                b.numero as butaca 
            FROM ENTRADA e
            JOIN PRECIO p ON e.id_precio = p.id_precio
            JOIN NOCHE n ON p.id_noche = n.id_noche
            JOIN BUTACA b ON e.id_butaca = b.id_butaca
            WHERE e.id_cliente = ?
            ORDER BY e.id_entrada DESC
        `;
        const [rows] = await db.query(query, [id_cliente]);
        return rows;
    }
};

module.exports = ClienteModel;
