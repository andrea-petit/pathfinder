const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.post('/reporteViajes', reporteController.generarReporteViajes);
router.post('/reporteIndividual', reporteController.generarReporteIndividual);

module.exports = router;