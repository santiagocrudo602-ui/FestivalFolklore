const ClienteModel = require('../models/clienteModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const verificationCodes = new Map();
let transporter;

nodemailer.createTestAccount().then(account => {
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
}).catch(console.error);

exports.registrarCliente = async (req, res) => {
    try {
        const { nombre, apellido, dni, direccion, email, contrasena } = req.body;
        
        if (!nombre || !apellido || !dni || !email || !contrasena) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
        }

        // Validación de DNI: Solo números y exactamente 8 dígitos
        const dniRegex = /^\d{8}$/;
        if (!dniRegex.test(dni)) {
            return res.status(400).json({ success: false, message: 'El DNI debe contener exactamente 8 números.' });
        }

        // Validación de fortaleza de contraseña: al menos 8 caracteres, 1 letra y 1 número
        const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!pwdRegex.test(contrasena)) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.' });
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
        if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('dni')) {
            return res.status(400).json({ success: false, message: 'El DNI ingresado ya se encuentra registrado.' });
        }
        res.status(500).json({ success: false, message: 'Ocurrió un error al registrar en la base de datos.' });
    }
};

exports.iniciarSesion = async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const usuario = await ClienteModel.login(email, contrasena);
        
        if (usuario) {
            delete usuario.contrasena;
            const code = crypto.randomInt(100000, 999999).toString();
            
            verificationCodes.set(email, {
                code,
                user: usuario
            });
            
            setTimeout(() => {
                verificationCodes.delete(email);
            }, 5 * 60 * 1000);
            
            if (transporter) {
                const info = await transporter.sendMail({
                    from: '"Festival" <noreply@festival.com>',
                    to: email,
                    subject: "Código de Verificación",
                    text: `Tu código es: ${code}`
                });
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            }
            
            res.json({ success: true, require2FA: true, email: usuario.email });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor al intentar iniciar sesión.' });
    }
};

exports.verificarLogin = async (req, res) => {
    try {
        const { email, codigo } = req.body;
        const entry = verificationCodes.get(email);
        
        if (!entry || entry.code !== codigo) {
            return res.status(401).json({ success: false, message: 'Código inválido o expirado.' });
        }
        
        const { user } = entry;
        const token = jwt.sign(
            { id_cliente: user.id_cliente, email: user.email, rol: user.rol },
            process.env.JWT_SECRET || 'supersecreto',
            { expiresIn: '2h' }
        );
        
        verificationCodes.delete(email);
        res.json({ success: true, message: 'Login exitoso', data: user, token });
    } catch (error) {
        console.error("Error en verificación:", error);
        res.status(500).json({ success: false, message: 'Error al verificar el código.' });
    }
};

exports.getMisEntradas = async (req, res) => {
    try {
        const { id } = req.params;
        const entradas = await ClienteModel.getEntradas(id);
        res.json({ success: true, data: entradas });
    } catch (error) {
        console.error("Error obteniendo entradas:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
};
