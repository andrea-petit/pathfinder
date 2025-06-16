const empleadoModel = require('../models/empleadoModel');

const empleadoController = {
    registerUser: (req, res) => {
        const { id_empleado, nombre_usuario, contraseña } = req.body;
        empleadoModel.registerUser(id_empleado, nombre_usuario, contraseña)
            .then(result => {
                res.status(201).json({ message: 'Usuario registrado exitosamente', id: result.id });
            })
            .catch(err => {
                console.error('Error al registrar usuario:', err.message);
                res.status(500).json({ error: 'Error al registrar usuario' });
            });
    },
    getPreguntasSeguridad: (req, res) => {
        empleadoModel.getPreguntasSeguridad()
            .then(rows => {
                res.json(rows);
            })
            .catch(err => {
                console.error('Error al obtener preguntas de seguridad:', err.message);
                res.status(500).json({ error: 'Error al obtener preguntas de seguridad' });
            });
    },

    savePreguntaRespuesta: (req, res) => {
        const { id_empleado, id_pregunta, respuesta } = req.body;
        empleadoModel.savePreguntaRespuesta(id_empleado, id_pregunta, respuesta)
            .then(result => {
                res.status(201).json({ message: 'Pregunta y respuesta guardadas exitosamente', id: result.id });
            })
            .catch(err => {
                console.error('Error al guardar pregunta y respuesta:', err.message);
                res.status(500).json({ error: 'Error al guardar pregunta y respuesta' });
            });
    },

    loginEmpleado: (req, res) => {
        const { nombre_usuario, contraseña } = req.body;
        empleadoModel.loginEmpleado(nombre_usuario, contraseña)
            .then(row => {
                if (!row) {
                    return res.status(401).json({ error: 'Credenciales incorrectas' });
                }
                req.session.id_empleado = row.id_empleado;
                req.session.rol = row.rol;
                res.json({ message: 'Inicio de sesión exitoso', id_empleado: row.id_empleado, rol: row.rol });
            })
            .catch(err => {
                console.error('Error en loginEmpleado:', err);
                res.status(500).json({ error: 'Error al realizar la consulta' });
            });
    },

    getInfoById: (req, res) => {
        const id_empleado = req.session.id_empleado;
        empleadoModel.getInfoById(id_empleado)
            .then(row => {
                if (!row) {
                    return res.status(404).json({ error: 'Empleado no encontrado' });
                }
                res.json(row);
            })
            .catch(err => {
                res.status(500).json({ error: 'Error al realizar la consulta' });
            });
    },

    getVehiculo: (req, res) => {
        const id_empleado = req.session.id_empleado;
        empleadoModel.getVehiculo(id_empleado)
            .then(row => {
                if (!row) {
                    return res.status(404).json({ error: 'Vehículo no encontrado' });
                }
                res.json(row);
            })
            .catch(err => {
                res.status(500).json({ error: 'Error al realizar la consulta' });
            });
    },
};

module.exports = empleadoController;