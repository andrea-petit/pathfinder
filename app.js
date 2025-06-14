const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const db = require('./database/db'); 
const auth = require('./middleware/auth');
const empleadoRoutes = require('./routes/empleadoRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use('/api/empleados', empleadoRoutes);
app.use('/api/admin', adminRoutes);

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
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminIndex.html'));
});


app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});