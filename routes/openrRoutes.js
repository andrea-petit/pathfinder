const openRouteController = require('../controllers/openRouteController');
const express = require('express');
const router = express.Router();


router.post('/ors-matrix', openRouteController.getDistanceMatrix);

module.exports = router;