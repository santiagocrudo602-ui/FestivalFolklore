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
