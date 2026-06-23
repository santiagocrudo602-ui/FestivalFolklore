const ClienteModel = require('../models/clienteModel');

exports.registrarCliente = async (req, res) => {
    try {
        const { nombre, apellido, dni, direccion, email, contrasena } = req.body;
        
        if (!nombre || !apellido || !dni || !email || !contrasena) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
        }

        // Verificar si el email ya existe
        const existingUser = await ClienteModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
        }

        // Crear cliente
        const insertId = await ClienteModel.create({
            nombre,
            apellido,
            dni,
            direccion,
            email,
            contrasena
        });

        res.json({ success: true, message: 'Registro completado con éxito.', id: insertId });
    } catch (error) {
        console.error("Error registrando cliente:", error);
        res.status(500).json({ success: false, message: 'Ocurrió un error al registrar en la base de datos.' });
    }
};

exports.iniciarSesion = async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const usuario = await ClienteModel.login(email, contrasena);
        
        if (usuario) {
            // Ocultamos la contraseña antes de devolver los datos al cliente
            delete usuario.contrasena;
            res.json({ success: true, message: 'Login exitoso', data: usuario });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor al intentar iniciar sesión.' });
    }
};
