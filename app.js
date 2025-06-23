const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const db = require('./database/db'); 
const auth = require('./middleware/auth');
const empleadoRoutes = require('./routes/empleadoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paquetesRoutes = require('./routes/paquetesRoutes'); 
const openrRoutes = require('./routes/openrRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes'); 


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use('/api/empleados', empleadoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/paquetes', paquetesRoutes);
app.use('/api/openr', openrRoutes);
app.use('/api/reporte', reporteRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/recuperar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'recuperarContraseña.html'));
}); 

app.get('/home', auth, (req, res) => {        
    res.sendFile(path.join(__dirname, 'views', 'userIndex.html'));
});

app.get('/admin', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminIndex.html'));
});


app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});