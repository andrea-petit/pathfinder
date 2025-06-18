const paquetesModel = require('../models/paquetesModel');

const paquetesController = {
    getPaquetes: (req, res) => {
        paquetesModel.getPaquetes()
            .then(rows => {
                res.json(rows);
            })
            .catch(err => {
                console.error('Error al obtener paquetes:', err.message);
                res.status(500).json({ error: 'Error al obtener paquetes' });
            });
    },

    getPaqueteById: (req, res) => {
        const id_paquete = req.params.id_paquete;
        paquetesModel.getPaqueteById(id_paquete)
            .then(row => {
                if (!row) {
                    return res.status(404).json({ error: 'Paquete no encontrado' });
                }
                res.json(row);
            })
            .catch(err => {
                console.error('Error al obtener paquete:', err.message);
                res.status(500).json({ error: 'Error al obtener paquete' });
            });
    },

    generarViaje: async (req, res) => {
        const { id_empleado } = req.session.id_empleado
        if (!id_empleado) {
            return res.status(400).json({ error: 'ID de empleado requerido.' });
        }
        try {
            const result = await paquetesModel.generarViaje(id_empleado);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error al generar viaje:', err.message);
            res.status(500).json({ error: 'Error al generar viaje.' });
        }
    },

    guardarViajeDetalles: async (req, res) => {
        const { id_viaje, detalles } = req.body;
        if (!id_viaje || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: 'Datos insuficientes para guardar detalles.' });
        }
        try {
            const result = await paquetesModel.guardarViajeDetalles(id_viaje, detalles);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error al guardar detalles de viaje:', err.message);
            res.status(500).json({ error: 'Error al guardar detalles de viaje.' });
        }
    }
}; 

module.exports = paquetesController;