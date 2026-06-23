const db = require('../config/database');

const EntradaModel = {
    create: async (entradaData) => {
        const { fecha_venta, codigoBarra, id_precio, id_tipo, id_punto, id_cliente, id_butaca } = entradaData;
        const query = `
            INSERT INTO ENTRADA (fecha_venta, codigoBarra, id_precio, id_tipo, id_punto, id_cliente, id_butaca)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            fecha_venta, codigoBarra, id_precio, id_tipo, id_punto, id_cliente, id_butaca
        ]);
        return result.insertId;
    }
};

module.exports = EntradaModel;
