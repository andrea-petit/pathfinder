const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');


router.post('/paquetes/entregados', estadisticasController.getPaquetesEntregadosByPeriodo);

module.exports = router;