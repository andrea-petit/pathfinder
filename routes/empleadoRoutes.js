const express = require('express');
const router = express.Router();


const empleadoController = require('../controllers/empleadoController');


router.post('/login', empleadoController.loginEmpleado);
router.post('/register', empleadoController.registerUser);
router.get('/preguntasSeguridad', empleadoController.getPreguntasSeguridad);
router.post('/savePreguntaRespuesta', empleadoController.savePreguntaRespuesta);
router.get('/vehiculo', empleadoController.getVehiculo);
router.post('/updateInfo', empleadoController.updateInfo);
router.post('/cambiarPassword', empleadoController.cambiarContraseña);
router.post('/getPreguntaSeguridad', empleadoController.getPreguntaSeguridad);
router.post('/verificarRespuesta', empleadoController.verificarRespuesta);


router.get('/info', empleadoController.getInfoById);

module.exports = router;