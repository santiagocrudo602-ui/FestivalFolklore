const db = require('../config/database');

const EntradaModel = {
    create: async (entradaData) => {
        const { fecha_venta, codigoBarra, numero_factura, id_precio, id_tipo, id_punto, id_cliente, id_butaca, id_descuento } = entradaData;
        const query = `
            INSERT INTO ENTRADA (fecha_venta, codigoBarra, numero_factura, id_precio, id_tipo, id_punto, id_cliente, id_butaca, id_descuento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            fecha_venta, codigoBarra, numero_factura, id_precio, id_tipo, id_punto, id_cliente, id_butaca, id_descuento || null
        ]);
        return result.insertId;
    }
};

module.exports = EntradaModel;
