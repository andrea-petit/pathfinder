require('dotenv').config();

const ORS_API_KEY = process.env.ORS_API_KEY;

const openRouteModel = {
  getDistanceMatrix: async (locations, metrics, units) => {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locations,
        metrics: metrics || ['distance'],
        units: units || 'm'
      })
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('Respuesta de ORS:', text);
      throw new Error('Error al consultar OpenRouteService');
    }
    return await response.json();
  },
   getDirections: async (coordinates) => {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ coordinates })
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('Respuesta de ORS:', text);
      throw new Error('Error al consultar OpenRouteService');
    }
    return await response.json();
  }
};

module.exports = openRouteModel;