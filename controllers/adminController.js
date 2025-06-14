const adminModel = require('../models/adminModel');

const adminController = {
    registerEmpleado: (req, res) => {
        const { id_empleado, nombre1, nombre2, apellido1, apellido2, telefono, correo } = req.body;
        adminModel.registerEmpleado(id_empleado, nombre1, nombre2, apellido1, apellido2, telefono, correo)
            .then(result => {
                res.status(201).json({ message: 'Empleado registrado exitosamente', id: result.id });
            })
            .catch(err => {
                console.error('Error al registrar empleado:', err.message);
                res.status(500).json({ error: 'Error al registrar empleado' });
            });
    },

    getEmpleados: (req, res) => {
        adminModel.getEmpleados()
            .then(rows => {
                res.json(rows);
            })
            .catch(err => {
                console.error('Error al obtener empleados:', err.message);
                res.status(500).json({ error: 'Error al obtener empleados' });
            });
    },

    getEmpleadoById: (req, res) => {
        const id_empleado = req.params.id_empleado;
        adminModel.getEmpleadoById(id_empleado)
            .then(row => {
                if (!row) {
                    return res.status(404).json({ error: 'Empleado no encontrado' });
                }
                res.json(row);
            })
            .catch(err => {
                console.error('Error al obtener empleado:', err.message);
                res.status(500).json({ error: 'Error al obtener empleado' });
            });
    },
};

module.exports = adminController;