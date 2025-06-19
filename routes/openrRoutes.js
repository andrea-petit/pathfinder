const openRouteController = require('../controllers/openRouteController');
const express = require('express');
const router = express.Router();


router.post('/ors-matrix', openRouteController.getDistanceMatrix);
router.post('/ors-directions', openRouteController.getDirections);

module.exports = router;