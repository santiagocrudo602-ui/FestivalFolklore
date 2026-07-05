const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: path.join(__dirname, '../database/festival.db'),
            driver: sqlite3.Database
        });
        
        // Habilitar foreign keys en SQLite
        await dbInstance.run('PRAGMA foreign_keys = ON');
    }
    return dbInstance;
}

// Wrapper para simular la interfaz de mysql2/promise
module.exports = {
    query: async (sql, params = []) => {
        const db = await getDb();
        const statement = sql.trim().toUpperCase();
        
        if (statement.startsWith('SELECT')) {
            const rows = await db.all(sql, params);
            return [rows]; // mysql2 devuelve [rows, fields]
        } else {
            const result = await db.run(sql, params);
            return [{ insertId: result.lastID, affectedRows: result.changes }]; // mysql2 devuelve [result, fields]
        }
    },
    getDb // Exponemos getDb por si necesitamos ejecutar un script crudo
};
