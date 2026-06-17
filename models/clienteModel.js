const db = require('../config/database');

const ClienteModel = {
    create: async (clienteData) => {
        const { nombre, apellido, dni, direccion, email, contrasena } = clienteData;
        const query = `
            INSERT INTO CLIENTE (nombre, apellido, dni, direccion, email, contrasena)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            nombre, apellido, dni, direccion, email, contrasena
        ]);
        return result.insertId;
    },
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM CLIENTE WHERE email = ?', [email]);
        return rows[0];
    },
    login: async (email, password) => {
        // En un entorno real se usaría bcrypt.compare, aquí comparamos en texto plano para el prototipo
        const [rows] = await db.query('SELECT * FROM CLIENTE WHERE email = ? AND contrasena = ?', [email, password]);
        return rows[0];
    }
};

module.exports = ClienteModel;
