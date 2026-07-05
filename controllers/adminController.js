const AdminModel = require('../models/adminModel');

exports.crearNoche = async (req, res) => {
    try {
        const { fecha, hora_inicio } = req.body;
        
        if (!fecha || !hora_inicio) {
            return res.status(400).json({ success: false, message: 'La fecha y la hora son obligatorias.' });
        }

        const data = await AdminModel.crearNoche({ fecha, hora_inicio });

        res.json({ 
            success: true, 
            message: 'Noche agregada con éxito.', 
            noche: {
                id_noche: data.insertId,
                numero_noche: data.numero_noche,
                fecha: fecha,
                hora_inicio: hora_inicio
            }
        });
    } catch (error) {
        console.error("Error creando noche:", error);
        res.status(500).json({ success: false, message: 'Ocurrió un error al guardar la Noche en la base de datos.' });
    }
};

exports.editarNoche = async (req, res) => {
    try {
        const id_noche = req.params.id;
        const { fecha, hora_inicio } = req.body;

        if (!fecha || !hora_inicio) {
            return res.status(400).json({ success: false, message: 'La fecha y la hora son obligatorias.' });
        }

        const success = await AdminModel.editarNoche(id_noche, { fecha, hora_inicio });

        if (success) {
            res.json({ success: true, message: 'Noche actualizada con éxito.' });
        } else {
            res.status(404).json({ success: false, message: 'No se encontró la Noche para actualizar.' });
        }
    } catch (error) {
        console.error("Error editando noche:", error);
        res.status(500).json({ success: false, message: 'Ocurrió un error al actualizar la Noche en la base de datos.' });
    }
};

exports.borrarNoche = async (req, res) => {
    try {
        const id_noche = req.params.id;

        const success = await AdminModel.borrarNoche(id_noche);

        if (success) {
            res.json({ success: true, message: 'Noche borrada con éxito.' });
        } else {
            res.status(404).json({ success: false, message: 'No se encontró la Noche para borrar.' });
        }
    } catch (error) {
        console.error("Error borrando noche:", error);
        res.status(500).json({ success: false, message: 'Ocurrió un error al borrar la Noche en la base de datos.' });
    }
};
