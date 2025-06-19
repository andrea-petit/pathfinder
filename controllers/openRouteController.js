const { get } = require('http');
const openRouteModel = require('../models/openRouteModel');

const openRouteController = {
    getDistanceMatrix: async (req, res) => {
        try {
            const { locations, metrics, units } = req.body;
            const data = await openRouteModel.getDistanceMatrix(locations, metrics, units);
            res.json(data);
        } catch (err) {
            console.error('Error en getDistanceMatrix:', err);
            res.status(500).json({ error: "Error fetching distance matrix" });
        }
    },
    getDirections: async (req, res) => {
        try {
            const { coordinates } = req.body;
            const data = await openRouteModel.getDirections(coordinates);
            res.json(data);
        } catch (err) {
            console.error('Error en getDirections:', err);
            res.status(500).json({ error: "Error fetching directions" });
        }
    }
};

module.exports = openRouteController;