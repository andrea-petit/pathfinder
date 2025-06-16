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
    }
}; 

module.exports = paquetesController;