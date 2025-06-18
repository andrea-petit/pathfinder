const express = require('express');
const router = express.Router();
const paquetesController = require('../controllers/paquetesController');

router.get('/getPaquetes', paquetesController.getPaquetes);
router.get('/getPaquete/:id_paquete', paquetesController.getPaqueteById);
router.post('/generarViaje', paquetesController.generarViaje);
router.post('/guardarViajeDetalles', paquetesController.guardarViajeDetalles);

module.exports = router;