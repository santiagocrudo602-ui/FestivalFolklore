const initSqlJs = require('sql.js');
const fs = require('fs');

async function test() {
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync('database/festival.db');
    const db = new SQL.Database(buffer);

    try {
        const hoy = new Date().toISOString().split('T')[0];
        const codigoBarra = 'FEST-2026-A1B2C3';
        const id_precio = 1;
        const publicoId = '1';
        const id_punto = 1;
        const id_cliente = 1;
        const id_butaca = 15;

        db.run(`
            INSERT INTO ENTRADA (fecha_venta, codigoBarra, id_precio, id_tipo, id_punto, id_cliente, id_butaca)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [hoy, codigoBarra, id_precio, publicoId, id_punto, id_cliente, id_butaca]);

        console.log("Insert successful");
    } catch (err) {
        console.error("Error SQL:", err.message);
    }
}
test();
