const EntradaModel = require('../models/entradaModel');
const crypto = require('crypto');

exports.comprarEntradas = async (req, res) => {
    try {
        const { id_cliente, cantidad, sectorId, publicoId } = req.body;

        if (!id_cliente || !cantidad || !publicoId) {
            return res.status(400).json({ success: false, message: 'Datos incompletos para la compra.' });
        }

        const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const codigosGenerados = [];

        for (let i = 0; i < cantidad; i++) {
            // Generar código de barras único
            const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
            const codigoBarra = `FEST-2026-${hash}`;

            // Mock de IDs para el prototipo (usualmente vendrían del frontend seleccionados uno a uno)
            const id_precio = 1; 
            const id_punto = 1; 
            const id_butaca = Math.floor(Math.random() * 30) + 1; // Asumiendo 30 butacas creadas en el DUMP

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

        res.json({
            success: true,
            message: 'Compra finalizada exitosamente.',
            codigos: codigosGenerados
        });

    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ success: false, message: 'Error interno al procesar la compra.' });
    }
};
