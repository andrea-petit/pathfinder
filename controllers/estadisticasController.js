const estadisticasModel = require("../models/estadisticasModel");

const estadisticasController = {
    getPaquetesEntregadosByPeriodo: (req, res) => {
        const { fechaInicio, fechaFin } = req.body;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Debes proporcionar fechaInicio y fechaFin' });
        }

        estadisticasModel.getPaquetesEntregadosByPeriodo(fechaInicio, fechaFin)
            .then(data => {
                res.status(200).json(data);
            })
            .catch(err => {
                console.error('Error al obtener paquetes entregados por periodo:', err);
                res.status(500).json({ error: 'Error al obtener datos' });
            });
    },
};

module.exports = estadisticasController;