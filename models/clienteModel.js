const db = require('../config/database');

const ClienteModel = {
    create: async (clienteData) => {
        const { nombre_apellido, email, telefono, contrasena, ciudad, localidad, codigo_postal } = clienteData;
        const query = `
            INSERT INTO CLIENTE (nombre_apellido, email, telefono, contrasena, ciudad, localidad, codigo_postal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            nombre_apellido, email, telefono, contrasena, ciudad, localidad, codigo_postal
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
