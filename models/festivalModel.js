const db = require('../config/database');

const FestivalModel = {
    getAllNoches: async () => {
        // Traer las noches ordenadas por fecha
        const [rows] = await db.query('SELECT * FROM NOCHE ORDER BY fecha ASC');
        return rows;
    },
    getGruposByNoche: async (id_noche) => {
        const query = `
            SELECT g.id_grupo, g.nombre, g.horario 
            FROM GRUPO g
            JOIN NOCHE_GRUPO ng ON g.id_grupo = ng.id_grupo
            WHERE ng.id_noche = ?
            ORDER BY g.horario ASC
        `;
        const [rows] = await db.query(query, [id_noche]);
        return rows;
    }
};

module.exports = FestivalModel;
