const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/views', express.static(path.join(__dirname, 'views')));

// Importar Controladores / Rutas
const festivalController = require('./controllers/festivalController');
const clienteController = require('./controllers/clienteController');
const adminController = require('./controllers/adminController');
const entradaController = require('./controllers/entradaController');

app.get('/api/noches', festivalController.getNoches);
app.get('/api/noches/:id/grupos', festivalController.getDetalleNoche);
app.post('/api/clientes/registro', clienteController.registrarCliente);
app.post('/api/login', clienteController.iniciarSesion);
app.post('/api/entradas/comprar', entradaController.comprarEntradas);
app.post('/api/admin/noches', adminController.crearNoche);
app.put('/api/admin/noches/:id', adminController.editarNoche);
app.delete('/api/admin/noches/:id', adminController.borrarNoche);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/noches', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'noches.html'));
});

app.get('/noche_detalle', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'noche_detalle.html'));
});

app.get('/butacas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'butacas.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado: http://localhost:${PORT}`);
});
