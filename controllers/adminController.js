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
    asignVehiculo: (req, res) => {
        const { id_empleado, id_vehiculo } = req.body;
        adminModel.asignVehiculo(id_empleado, id_vehiculo)
            .then(result => {
                res.status(201).json({ message: 'Vehículo asignado exitosamente', id: result.id });
            })
            .catch(err => {
                console.error('Error al asignar vehículo:', err.message);
                res.status(500).json({ error: 'Error al asignar vehículo' });
            });
    },
    getVehiculos: (req, res) => {
        adminModel.getVehiculos()
            .then(rows => {
                res.json(rows);
            })
            .catch(err => {
                console.error('Error al obtener vehículos:', err.message);
                res.status(500).json({ error: 'Error al obtener vehículos' });
            });
    },
    solicitarEntradaPaquetes: async (req, res) => {
        const cantidad = req.body.cantidad || 20; 
        try {
            const paquetes = await adminModel.solicitarEntradaPaquetes(cantidad);
            res.status(201).json({ message: 'Paquetes generados exitosamente', paquetes });
        } catch (err) {
            console.error('Error al generar paquetes:', err.message);
            res.status(500).json({ error: 'Error al generar paquetes' });
        }
    },
    updateEmpleado: async (req, res) => {
        const id_empleado = req.params.id_empleado;
        const { campo, valor } = req.body;
        try {
            const result = await adminModel.updateEmpleado(id_empleado, campo, valor);
            res.json({ message: 'Empleado actualizado exitosamente', id: result.id });
            console.log(`Empleado ${id_empleado} actualizado: ${campo} = ${valor}`);
        } catch (err) {
            console.error('Error al actualizar empleado:', err.message);
            res.status(500).json({ error: 'Error al actualizar empleado' });
        }
    },
    deleteEmpleado: async (req, res) => {
        const id_empleado = req.params.id_empleado;
        try {
            const result = await adminModel.deleteEmpleado(id_empleado);
            res.json({ message: 'Empleado eliminado exitosamente', id: result.id });
        } catch (err) {
            console.error('Error al eliminar empleado:', err.message);
            res.status(500).json({ error: 'Error al eliminar empleado' });
        }
    },
    getSolicitudesCambioVehiculo: (req, res) => {
        adminModel.getSolicitudesCambioVehiculo()
            .then(rows => res.json(rows))
            .catch(err => {
                console.error('Error al obtener solicitudes:', err.message);
                res.status(500).json({ error: 'Error al obtener solicitudes' });
            });
    },
    aprobarSolicitudVehiculo: (req, res) => {
        const { id_empleado, id_vehiculo, id_solicitud } = req.body;
        if (!id_empleado || !id_vehiculo || !id_solicitud) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        adminModel.aprobarSolicitudVehiculo(id_empleado, id_vehiculo, id_solicitud)
            .then(result => res.json(result))  
            .catch(err => {
                console.error('Error al aprobar solicitud:', err.message);
                res.status(500).json({ error: 'Error al aprobar solicitud' });
            });
    },
    rechazarSolicitudVehiculo: (req, res) => {
        const { id_solicitud } = req.body;
        if (!id_solicitud) {
            return res.status(400).json({ error: 'ID de solicitud requerido' });
        }
        adminModel.rechazarSolicitudVehiculo(id_solicitud)
            .then(result => res.json(result))
            .catch(err => {
                console.error('Error al rechazar solicitud:', err.message);
                res.status(500).json({ error: 'Error al rechazar solicitud' });
            });
    },
    getAllVehiculosInfo: (req, res) => {
        adminModel.getAllVehiculosInfo()
            .then(rows => res.json(rows))
            .catch(err => {
                console.error('Error al obtener información de vehículos:', err.message);
                res.status(500).json({ error: 'Error al obtener información de vehículos' });
            });
    },
};

module.exports = adminController;