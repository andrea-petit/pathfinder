const express = require('express');
const router = express.Router();


const empleadoController = require('../controllers/empleadoController');


router.post('/login', empleadoController.loginEmpleado);



router.get('/info', empleadoController.getInfoById);

module.exports = router;