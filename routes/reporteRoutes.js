const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.post('/reporteViajes', reporteController.generarReporteViajes);

module.exports = router;