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
    generarViaje: (req, res) => {
        const id_empleado = req.session.id_empleado;
        const ids_paquetes = req.body.ids_paquetes;

        paquetesModel.generarViaje(id_empleado, ids_paquetes)
            .then(result => {
                res.status(201).json({ message: 'Viaje generado exitosamente', id_viaje: result.id });
            })
            .catch(err => {
                console.error('Error al generar viaje:', err.message);
                res.status(500).json({ error: err.message || 'Error al generar viaje' });
            });
    }
}; 

module.exports = paquetesController;