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
            ORDER BY 
                CASE 
                    WHEN g.horario LIKE '00:%' OR g.horario LIKE '01:%' OR g.horario LIKE '02:%' THEN 1 
                    ELSE 0 
                END ASC, 
                g.horario ASC
        `;
        const [rows] = await db.query(query, [id_noche]);
        return rows;
    },
    getPrecioUnitario: async (id_noche, id_sector, id_tipo) => {
        const query = 'SELECT monto FROM PRECIO WHERE id_noche = ? AND id_sector = ? AND id_tipo = ? LIMIT 1';
        const [rows] = await db.query(query, [id_noche, id_sector, id_tipo]);
        return rows.length > 0 ? rows[0].monto : null;
    }
};

module.exports = FestivalModel;
