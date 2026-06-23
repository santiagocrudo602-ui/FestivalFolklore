const URL = 'http://localhost:3000/api/entradas/comprar';

// Simulamos los datos que envía el frontend para comprar
// la Butaca N° 5 de la Noche N° 1.
const compraDatos = {
    id_cliente: 2, // ID de Juan
    nocheId: 1,    // Noche 1
    cantidad: 1,
    sectorId: 1,
    publicoId: 1,
    butacasIds: [10] // Probamos con butaca 10
};

async function dispararCompra(usuarioNombre) {
    console.log(`[${usuarioNombre}] Enviando petición de compra...`);
    try {
        const start = Date.now();
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(compraDatos)
        });
        
        const data = await response.json();
        const end = Date.now();
        const latencia = end - start;

        if (data.success) {
            console.log(`✅ [${usuarioNombre}] ÉXITO: Logró comprar la butaca 5. (Demoró ${latencia}ms) | Código: ${data.codigos[0]}`);
        } else {
            console.log(`❌ [${usuarioNombre}] FALLO: ${data.message} (Demoró ${latencia}ms)`);
        }
    } catch (error) {
        console.log(`⚠️ [${usuarioNombre}] ERROR DE RED: ${error.message}`);
    }
}

async function testConcurrencia() {
    console.log("=========================================");
    console.log("INICIANDO PRUEBA DE CONCURRENCIA (RACE CONDITION)");
    console.log("Dos usuarios (Usuario A y Usuario B) intentarán comprar la misma butaca al MISMO milisegundo.");
    console.log("=========================================\n");

    // Promise.all las dispara en paralelo
    await Promise.all([
        dispararCompra("Usuario A"),
        dispararCompra("Usuario B")
    ]);
    
    console.log("\n=========================================");
    console.log("PRUEBA FINALIZADA.");
    console.log("Si ambos dicen ÉXITO, la base de datos es vulnerable a ventas duplicadas.");
    console.log("=========================================");
}

testConcurrencia();
