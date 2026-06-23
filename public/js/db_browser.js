// Configurar la ruta de sql-wasm.wasm
const config = {
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}`
};

window.dbPromise = initSqlJs(config).then(async function(SQL) {
    console.log("SQL.js inicializado. Descargando base de datos...");
    
    // Determinar la ruta relativa a la base de datos
    const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.split('/').pop() === '';
    const dbPath = isRoot ? 'database/festival.db' : '../database/festival.db';

    try {
        const response = await fetch(dbPath);
        if (!response.ok) {
            throw new Error(`Error HTTP descargando DB: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        window.appDB = new SQL.Database(new Uint8Array(buffer));
        console.log("Base de datos montada en memoria exitosamente.");
        
        // Helper para emular cómo mysql2 devolvía arreglos de objetos
        window.queryDB = function(sql, params = []) {
            try {
                if (!sql.trim().toUpperCase().startsWith('SELECT')) {
                    window.appDB.run(sql, params);
                    return { success: true }; 
                }

                const stmt = window.appDB.prepare(sql);
                stmt.bind(params);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            } catch(e) {
                console.error("Error SQL:", e, "Query:", sql);
                throw e;
            }
        };

        // Disparar evento para avisar al resto de la app (main.js) que ya puede consultar
        document.dispatchEvent(new Event('db_ready'));

        return window.appDB;
    } catch(err) {
        console.error("Error cargando la base de datos estática:", err);
    }
});
