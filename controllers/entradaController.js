const db = require('../config/database');
const EntradaModel = require('../models/entradaModel');
const crypto = require('crypto');

// Mutex simple para evitar Race Conditions en Javascript
let purchaseMutex = false;

exports.comprarEntradas = async (req, res) => {
    try {
        const { id_cliente, nocheId, cantidad, sectorId, publicoId, butacasIds } = req.body;

        if (!id_cliente || !nocheId || !cantidad || !publicoId || !butacasIds || butacasIds.length !== cantidad) {
            return res.status(400).json({ success: false, message: 'Datos incompletos o inconsistentes para la compra.' });
        }

        // Esperar a que el Mutex se libere (Queue)
        while (purchaseMutex) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        purchaseMutex = true; // Bloqueamos el recurso para este usuario

        const sqliteDb = await db.getDb();
        await sqliteDb.run('BEGIN EXCLUSIVE TRANSACTION');

        try {
            // Obtener id_precio basado en la noche seleccionada
            const [precios] = await db.query('SELECT id_precio FROM PRECIO WHERE id_noche = ? LIMIT 1', [nocheId]);
            let id_precio = 1; // Fallback default
            if (precios.length > 0) {
                id_precio = precios[0].id_precio;
            }

            // Verificar si alguna de las butacas ya fue vendida para ese precio/noche
            for (let i = 0; i < cantidad; i++) {
                const id_butaca = butacasIds[i];
                const [vendida] = await db.query('SELECT id_entrada FROM ENTRADA WHERE id_precio = ? AND id_butaca = ?', [id_precio, id_butaca]);
                if (vendida.length > 0) {
                    await sqliteDb.run('ROLLBACK');
                    return res.status(409).json({ success: false, message: `La butaca seleccionada ya fue vendida a otro usuario.` });
                }
            }

            const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const codigosGenerados = [];

            for (let i = 0; i < cantidad; i++) {
                // Generar código de barras único
                const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
                const codigoBarra = `FEST-2026-${hash}`;

                const id_punto = 1; 
                const id_butaca = butacasIds[i]; // Asignado por la selección en UI

                await EntradaModel.create({
                    fecha_venta: hoy,
                    codigoBarra,
                    id_precio,
                    id_tipo: publicoId,
                    id_punto,
                    id_cliente,
                    id_butaca
                });

                codigosGenerados.push(codigoBarra);
            }

            await sqliteDb.run('COMMIT');

            res.json({
                success: true,
                message: 'Compra finalizada exitosamente.',
                codigos: codigosGenerados
            });
        } catch (txnError) {
            await sqliteDb.run('ROLLBACK');
            throw txnError;
        } finally {
            purchaseMutex = false; // ¡IMPORTANTE! Liberar el candado
        }

    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ success: false, message: 'Error interno al procesar la compra.' });
    }
};
