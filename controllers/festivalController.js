const FestivalModel = require('../models/festivalModel');

exports.getNoches = async (req, res) => {
    try {
        const noches = await FestivalModel.getAllNoches();
        res.json({ success: true, data: noches });
    } catch (error) {
        console.error("Error obteniendo noches:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

exports.getDetalleNoche = async (req, res) => {
    try {
        const { id } = req.params;
        const grupos = await FestivalModel.getGruposByNoche(id);
        res.json({ success: true, data: grupos });
    } catch (error) {
        console.error("Error obteniendo grupos:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

exports.getPrecio = async (req, res) => {
    try {
        const nocheId = req.query.nocheId;
        const sectorId = req.query.sectorId;
        const publicoId = req.query.publicoId;

        if (!nocheId || !sectorId || !publicoId) {
            return res.status(400).json({ success: false, message: 'Faltan parámetros' });
        }

        const monto = await FestivalModel.getPrecioUnitario(nocheId, sectorId, publicoId);
        
        if (monto !== null) {
            res.json({ success: true, precio: monto });
        } else {
            res.status(404).json({ success: false, message: 'Precio no encontrado para esta combinación' });
        }
    } catch (error) {
        console.error("Error obteniendo precio:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
