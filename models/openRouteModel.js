const openRouteModel = {
  getDistanceMatrix: async (locations) => {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': '5b3ce3597851110001cf62488f5c52d5a56f4f209b6b76718839d551',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locations,
        metrics: ['distance'],
        units: 'm'
      })
    });
    if (!response.ok) throw new Error('Error al consultar OpenRouteService');
    return await response.json();
  }
};

module.exports = openRouteModel;