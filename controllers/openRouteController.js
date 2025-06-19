const openRouteModel = require('../models/openRouteModel');

const openRouteController = {
  getDistanceMatrix: async (req, res) => {
    try {
      const { locations } = req.body;
      if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ error: 'Invalid locations array' });
      }

      const matrix = await openRouteModel.getDistanceMatrix(locations);
      res.json(matrix);
    } catch (error) {
      console.error('Error in getDistanceMatrix:', error);
      res.status(500).json({ error: 'Error fetching distance matrix' });
    }
  }
};

module.exports = openRouteController;