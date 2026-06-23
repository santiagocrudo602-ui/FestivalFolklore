const db = require('../config/database');

const AdminModel = {
    crearNoche: async (nocheData) => {
        // En una inserción real deberíamos calcular el id_festival, aquí lo ponemos fijo a 1 (Festival Nacional de Folklore)
        const id_festival = 1; 
        
        // Calculamos el número de noche automáticamente (último + 1)
        const [rows] = await db.query('SELECT MAX(numero_noche) as max_noche FROM NOCHE WHERE id_festival = ?', [id_festival]);
        const nextNumeroNoche = (rows[0].max_noche || 0) + 1;

        const { fecha, hora_inicio, titulo } = nocheData;
        const query = `
            INSERT INTO NOCHE (numero_noche, fecha, hora_inicio, id_festival, titulo)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nextNumeroNoche, fecha, hora_inicio, id_festival, titulo || `Noche ${nextNumeroNoche}`]);
        
        return { insertId: result.insertId, numero_noche: nextNumeroNoche, titulo: titulo || `Noche ${nextNumeroNoche}` };
    },
    editarNoche: async (id_noche, nocheData) => {
        const { fecha, hora_inicio, titulo } = nocheData;
        const query = `
            UPDATE NOCHE 
            SET fecha = ?, hora_inicio = ?, titulo = ? 
            WHERE id_noche = ?
        `;
        const [result] = await db.query(query, [fecha, hora_inicio, titulo, id_noche]);
        return result.affectedRows > 0;
    },
    borrarNoche: async (id_noche) => {
        // Primero borramos las dependencias en NOCHE_GRUPO si las hay para evitar error de foreign key
        await db.query('DELETE FROM NOCHE_GRUPO WHERE id_noche = ?', [id_noche]);
        
        const query = 'DELETE FROM NOCHE WHERE id_noche = ?';
        const [result] = await db.query(query, [id_noche]);
        return result.affectedRows > 0;
    }
};

module.exports = AdminModel;
