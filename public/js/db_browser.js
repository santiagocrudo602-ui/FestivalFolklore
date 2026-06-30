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
        const CURRENT_DB_VERSION = '2.1';
        const storedVersion = localStorage.getItem('festival_db_version');
        
        let savedDB = null;
        if (storedVersion && parseFloat(storedVersion) >= parseFloat(CURRENT_DB_VERSION)) {
            savedDB = localStorage.getItem('festival_db_data');
        } else {
            console.log("Nueva estructura de DB detectada. Limpiando BD antigua...");
            localStorage.removeItem('festival_db_data');
            localStorage.setItem('festival_db_version', CURRENT_DB_VERSION);
            // También limpiamos el usuario para forzar re-login con la nueva DB
            localStorage.removeItem('usuario');
        }

        let buffer;

        if (savedDB) {
            console.log("Cargando DB desde LocalStorage (Persistente)...");
            const binaryString = atob(savedDB);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            buffer = bytes.buffer;
        } else {
            console.log("Cargando DB original estática desde el servidor...");
            const response = await fetch(dbPath + '?v=2.1');
            if (!response.ok) {
                throw new Error(`Error HTTP descargando DB: ${response.status}`);
            }
            buffer = await response.arrayBuffer();
        }

        window.appDB = new SQL.Database(new Uint8Array(buffer));
        console.log("Base de datos montada en memoria exitosamente.");

        // Función para guardar cambios en LocalStorage
        window.saveDBToLocal = function() {
            try {
                const data = window.appDB.export();
                let binary = '';
                // Chunking to avoid RangeError in String.fromCharCode.apply for large arrays
                const chunkSize = 8192;
                for (let i = 0; i < data.length; i += chunkSize) {
                    binary += String.fromCharCode.apply(null, data.subarray(i, i + chunkSize));
                }
                localStorage.setItem('festival_db_data', btoa(binary));
                console.log("Cambios guardados en LocalStorage.");
            } catch(e) {
                console.warn("No se pudo guardar la DB en LocalStorage (puede que exceda la cuota).", e);
            }
        };
        
        // Helper para emular cómo mysql2 devolvía arreglos de objetos
        window.queryDB = function(sql, params = []) {
            try {
                if (!sql.trim().toUpperCase().startsWith('SELECT')) {
                    window.appDB.run(sql, params);
                    window.saveDBToLocal(); // Guardar automáticamente si es INSERT/UPDATE/DELETE
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
