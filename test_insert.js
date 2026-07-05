const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/festival.db');
db.run("INSERT INTO ENTRADA (fecha_venta, codigoBarra, id_precio, id_tipo, id_punto, id_cliente, id_butaca) VALUES ('2026-06-23', 'TEST-1', 1, 1, 1, 1, 1)", [], function(err) {
    if (err) console.error('Error:', err.message);
    else console.log('Success, ID:', this.lastID);
});
