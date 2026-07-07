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
        const CURRENT_DB_VERSION = '2.3';
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

        // --- INTERCEPTOR DE FETCH PARA GITHUB PAGES (MOCK API) ---
        const originalFetch = window.fetch;
        window.fetch = async function(resource, config) {
            if (typeof resource === 'string' && resource.startsWith('/api/')) {
                console.log('Mock fetch a:', resource);
                
                await new Promise(r => setTimeout(r, 200));

                if (resource === '/api/noches') {
                    const result = window.queryDB('SELECT * FROM NOCHE ORDER BY numero_noche ASC');
                    return new Response(JSON.stringify({ success: true, data: result }));
                }
                
                const matchGrupos = resource.match(/^\/api\/noches\/(\d+)\/grupos$/);
                if (matchGrupos) {
                    const id_noche = matchGrupos[1];
                    const result = window.queryDB('SELECT g.id_grupo, g.nombre, g.horario FROM GRUPO g JOIN NOCHE_GRUPO ng ON g.id_grupo = ng.id_grupo WHERE ng.id_noche = ? ORDER BY g.horario ASC', [id_noche]);
                    return new Response(JSON.stringify({ success: true, data: result || [] }));
                }
                
                const matchEntradas = resource.match(/^\/api\/clientes\/(\d+)\/entradas$/);
                if (matchEntradas) {
                    const id_cliente = matchEntradas[1];
                    const result = window.queryDB(`
                        SELECT e.id_entrada, e.fecha_venta, e.codigoBarra, e.id_transaccion AS idTransaccion, e.id_butaca as butaca,
                               p.monto as precio_base, n.numero_noche as noche, d.porcentaje as descuento
                        FROM ENTRADA e
                        LEFT JOIN PRECIO p ON e.id_precio = p.id_precio
                        LEFT JOIN NOCHE n ON p.id_noche = n.id_noche
                        LEFT JOIN DESCUENTO d ON e.id_descuento = d.id_descuento
                        WHERE e.id_cliente = ?
                    `, [id_cliente]);
                    return new Response(JSON.stringify({ success: true, data: result || [] }));
                }

                if (resource.startsWith('/api/precio')) {
                    const url = new URL(resource, window.location.origin);
                    const result = window.queryDB(
                        'SELECT monto FROM PRECIO WHERE id_noche = ? AND id_sector = ? AND id_tipo = ? LIMIT 1', 
                        [url.searchParams.get('nocheId'), url.searchParams.get('sectorId'), url.searchParams.get('publicoId')]
                    );
                    if (result && result.length > 0) return new Response(JSON.stringify({ success: true, precio: result[0].monto }));
                    return new Response(JSON.stringify({ success: false, message: 'Precio no encontrado' }));
                }
                
                if (resource.startsWith('/api/entradas/ocupadas')) {
                    const url = new URL(resource, window.location.origin);
                    const result = window.queryDB(
                        'SELECT e.id_butaca FROM ENTRADA e JOIN PRECIO p ON e.id_precio = p.id_precio WHERE p.id_noche = ? AND p.id_sector = ?',
                        [url.searchParams.get('nocheId'), url.searchParams.get('sectorId')]
                    );
                    return new Response(JSON.stringify({ success: true, ocupadas: result ? result.map(r => r.id_butaca) : [] }));
                }
                
                if (resource === '/api/entradas/comprar' && config && config.method === 'POST') {
                    try {
                        const body = JSON.parse(config.body);
                        const hoy = new Date().toISOString().split('T')[0];
                        let id_descuento = null;
                        const resultDesc = window.queryDB('SELECT id_descuento FROM DESCUENTO WHERE fecha_limite >= ? ORDER BY porcentaje DESC LIMIT 1', [hoy]);
                        if (resultDesc && resultDesc.length > 0) id_descuento = resultDesc[0].id_descuento;
                        
                        const codigosGenerados = [];
                        let butacaIndex = 0;
                        for (const item of body.cartItems) {
                            let id_precio = 1;
                            const resPrecio = window.queryDB('SELECT id_precio FROM PRECIO WHERE id_noche = ? AND id_tipo = ? AND id_sector = ? LIMIT 1', [item.nocheId, item.publicoId, item.sectorId]);
                            if (resPrecio && resPrecio.length > 0) id_precio = resPrecio[0].id_precio;
                            
                            for (let i = 0; i < item.cantidad; i++) {
                                const codigoBarra = `FEST-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                                const idTransaccion = `TRX-0001-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                                window.queryDB(`INSERT INTO ENTRADA (fecha_venta, codigoBarra, id_precio, id_descuento, id_tipo, id_punto, id_cliente, id_butaca, id_transaccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                    [hoy, codigoBarra, id_precio, id_descuento, item.publicoId, 1, body.id_cliente, body.butacasIds[butacaIndex++], idTransaccion]);
                                codigosGenerados.push({ codigoBarra, idTransaccion });
                            }
                        }
                        return new Response(JSON.stringify({ success: true, codigos: codigosGenerados }));
                    } catch (error) {
                        return new Response(JSON.stringify({ success: false, message: error.message }));
                    }
                }

                if (resource === '/api/login' && config && config.method === 'POST') {
                    const body = JSON.parse(config.body);
                    const result = window.queryDB('SELECT * FROM CLIENTE WHERE email = ? AND contrasena = ?', [body.email, body.contrasena]);
                    if (result && result.length > 0) {
                        alert("Mock 2FA (Github Pages): Tu código de verificación es 123456");
                        return new Response(JSON.stringify({ success: true, require2FA: true, email: result[0].email }));
                    }
                    return new Response(JSON.stringify({ success: false, message: 'Credenciales inválidas' }));
                }

                if (resource === '/api/login/verificar' && config && config.method === 'POST') {
                    const body = JSON.parse(config.body);
                    if (body.codigo === "123456") {
                        const result = window.queryDB('SELECT * FROM CLIENTE WHERE email = ?', [body.email]);
                        if (result && result.length > 0) {
                            return new Response(JSON.stringify({ success: true, token: 'mock-token', data: result[0] }));
                        }
                    }
                    return new Response(JSON.stringify({ success: false, message: 'Código de verificación incorrecto' }));
                }
                
                if (resource === '/api/clientes/registro' && config && config.method === 'POST') {
                    const body = JSON.parse(config.body);
                    try {
                        window.queryDB('INSERT INTO CLIENTE (nombre, apellido, dni, direccion, email, contrasena) VALUES (?, ?, ?, ?, ?, ?)', 
                            [body.nombre, body.apellido, body.dni, body.direccion, body.email, body.contrasena]);
                        return new Response(JSON.stringify({ success: true }));
                    } catch (error) {
                        return new Response(JSON.stringify({ success: false, message: 'El DNI o Email ya se encuentra registrado.' }));
                    }
                }
            }
            return originalFetch.apply(this, arguments);
        };
        // -----------------------------------------------------------

        // Disparar evento para avisar al resto de la app (main.js) que ya puede consultar
        document.dispatchEvent(new Event('db_ready'));

        return window.appDB;
    } catch(err) {
        console.error("Error cargando la base de datos estática:", err);
    }
});
