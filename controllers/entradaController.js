const db = require('../config/database');
const EntradaModel = require('../models/entradaModel');
const crypto = require('crypto');

// Mutex simple para evitar Race Conditions en Javascript
let purchaseMutex = false;

exports.comprarEntradas = async (req, res) => {
    try {
        const { id_cliente, cartItems, butacasIds, id_punto: reqPunto } = req.body;

        if (!id_cliente || !cartItems || !butacasIds || !Array.isArray(cartItems)) {
            return res.status(400).json({ success: false, message: 'Datos incompletos o inconsistentes para la compra.' });
        }

        const totalCantidad = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
        if (butacasIds.length !== totalCantidad) {
            return res.status(400).json({ success: false, message: 'La cantidad de butacas no coincide con el total del carrito.' });
        }

        // Esperar a que el Mutex se libere (Queue)
        while (purchaseMutex) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        purchaseMutex = true; // Bloqueamos el recurso para este usuario

        const sqliteDb = await db.getDb();
        await sqliteDb.run('BEGIN EXCLUSIVE TRANSACTION');

        try {
            // Obtener el mejor descuento vigente
            const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const [descuentos] = await db.query('SELECT id_descuento FROM DESCUENTO WHERE fecha_limite >= ? ORDER BY porcentaje DESC LIMIT 1', [hoy]);
            const id_descuento = descuentos.length > 0 ? descuentos[0].id_descuento : null;

            const codigosGenerados = [];
            let butacaIndex = 0;

            for (const item of cartItems) {
                // Obtener id_precio basado en la noche, tipo y sector del item
                const [precios] = await db.query('SELECT id_precio FROM PRECIO WHERE id_noche = ? AND id_tipo = ? AND id_sector = ? LIMIT 1', [item.nocheId, item.publicoId, item.sectorId]);
                if (precios.length === 0) {
                    await sqliteDb.run('ROLLBACK');
                    return res.status(400).json({ success: false, message: `No hay precio configurado para la combinación Noche ${item.nocheId}, Sector ${item.sectorId}.` });
                }
                const id_precio = precios[0].id_precio;

                // Verificar butacas vendidas
                for (let i = 0; i < item.cantidad; i++) {
                    const id_butaca = butacasIds[butacaIndex + i];
                    const [vendida] = await db.query(`
                        SELECT e.id_entrada FROM ENTRADA e 
                        JOIN PRECIO p ON e.id_precio = p.id_precio 
                        WHERE p.id_noche = ? AND e.id_butaca = ?
                    `, [item.nocheId, id_butaca]);

                    if (vendida.length > 0) {
                        await sqliteDb.run('ROLLBACK');
                        return res.status(409).json({ success: false, message: `Una de las butacas seleccionadas ya fue vendida.` });
                    }
                }

                // Generar entradas
                for (let i = 0; i < item.cantidad; i++) {
                    const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
                    const codigoBarra = `FEST-2026-${hash}`;
                    
                    const hashFactura = crypto.randomBytes(4).toString('hex').toUpperCase();
                    const numero_factura = `FAC-0001-${hashFactura}`;

                    const id_punto = reqPunto || 1; 
                    const id_butaca = butacasIds[butacaIndex]; 
                    butacaIndex++;

                    const entradaData = {
                        fecha_venta: hoy,
                        codigoBarra,
                        numero_factura,
                        id_precio: parseInt(id_precio),
                        id_tipo: parseInt(item.publicoId),
                        id_punto: parseInt(id_punto),
                        id_cliente: parseInt(id_cliente),
                        id_butaca: parseInt(id_butaca),
                        id_descuento: id_descuento ? parseInt(id_descuento) : null
                    };
                    await EntradaModel.create(entradaData);
                    codigosGenerados.push({ codigoBarra, numero_factura });
                }
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

exports.getOcupadas = async (req, res) => {
    try {
        const { nocheId, sectorId } = req.query;
        if (!nocheId || !sectorId) {
            return res.status(400).json({ success: false, message: 'nocheId y sectorId requeridos' });
        }

        const [vendidas] = await db.query(`
            SELECT e.id_butaca FROM ENTRADA e 
            JOIN PRECIO p ON e.id_precio = p.id_precio 
            WHERE p.id_noche = ? AND p.id_sector = ?
        `, [nocheId, sectorId]);

        const ocupadas = vendidas.map(v => v.id_butaca);
        res.json({ success: true, ocupadas });
    } catch (error) {
        console.error('Error obteniendo butacas ocupadas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};
