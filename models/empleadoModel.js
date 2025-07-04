const db = require('../database/db');

const empleadoModel = {
    registerUser: (id_empleado, nombre_usuario, contraseña) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO usuarios (id_empleado, nombre_usuario, contraseña, rol) VALUES (?, ?, ?, ?)`;
            db.run(sql, [id_empleado, nombre_usuario, contraseña, "Repartidor"], function(err) {
                if (err) {
                    reject(err);
                }
                resolve({ id: this.lastID });
            });
        });
    },

    getPreguntasSeguridad: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM preguntas_seguridad`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error al realizar la consulta:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    savePreguntaRespuesta: (id_empleado, id_pregunta, respuesta) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO respuestas_seguridad (id_empleado, id_pregunta, respuesta) VALUES (?, ?, ?)`;
            db.run(sql, [id_empleado, id_pregunta, respuesta], function(err) {
                if (err) {
                    console.error('Error al realizar la inserción:', err.message);
                    return reject(err);
                }
                resolve({ id: this.lastID });
            });
        });
    },

    loginEmpleado: (nombre_usuario, contraseña) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?`;
            db.get(sql, [nombre_usuario, contraseña], (err, row) => {
                if (err) {
                    console.error('Error al realizar la consulta:', err); 
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    getInfoById: (id_empleado) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM empleados WHERE id_empleado = ?`;
            db.get(sql, [id_empleado], (err, row) => {
                if (err) {
                    console.error('Error al realizar la consulta:', err.message);
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    getVehiculo: (id_empleado) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ev.*, v.placa, v.marca, v.modelo
                FROM empleado_vehiculo ev
                JOIN vehiculos v ON ev.id_vehiculo = v.id_vehiculo
                WHERE ev.id_empleado = ?
                ORDER BY ev.id DESC
                LIMIT 1
            `;
            db.get(sql, [id_empleado], (err, row) => {
                if (err) {
                    console.error('Error al realizar la consulta:', err.message);
                    return reject(err);
                }
                resolve(row);
            });
        });
    },
    updateInfo: (id_empleado, campo, valor) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE empleados SET ${campo} = ? WHERE id_empleado = ?`;
            db.run(sql, [valor, id_empleado], function(err) {
                if (err) {
                    console.error('Error al actualizar la información:', err.message);
                    return reject(err);
                }
                resolve({ changes: this.changes });
            });
        });
    },
    cambiarContraseña: (nombre_usuario, nueva_contraseña) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE usuarios SET contraseña = ? WHERE nombre_usuario = ?`;
            db.run(sql, [nueva_contraseña, nombre_usuario], function(err) {
                if (err) {
                    console.error('Error al cambiar la contraseña:', err.message);
                    return reject(err);
                }
                resolve({ changes: this.changes });
            });
        });
        
    },
    getPreguntaSeguridad: (nombre_usuario) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ps.pregunta
                FROM respuestas_seguridad rs
                JOIN preguntas_seguridad ps ON rs.id_pregunta = ps.id
                JOIN usuarios u ON rs.id_empleado = u.id_empleado
                WHERE u.nombre_usuario = ?
            `;
            db.get(sql, [nombre_usuario], (err, row) => {
                if (err) {
                    console.error('Error al obtener la pregunta de seguridad:', err.message);
                    return reject(err);
                }
                resolve(row ? row.pregunta : null);
            });
        });
    },
    verificarRespuesta: (nombre_usuario, respuesta) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT rs.respuesta
                FROM respuestas_seguridad rs
                JOIN usuarios u ON rs.id_empleado = u.id_empleado
                WHERE u.nombre_usuario = ?
            `;
            db.get(sql, [nombre_usuario], (err, row) => {
                if (err) {
                    console.error('Error al verificar la respuesta de seguridad:', err.message);
                    return reject(err);
                }
                if (row && row.respuesta && respuesta &&
                    row.respuesta.trim().toLowerCase() === respuesta.trim().toLowerCase()) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    },
    
    solicitarCambioVehiculo: (id_empleado, id_vehiculo) => {
        return new Promise((resolve, reject) => {
            console.log('ID_VEHICULO:', id_vehiculo);
            const sql = `INSERT INTO solicitudCambioVehiculo (id_empleado, id_vehiculo) VALUES (?, ?)`;
            db.run(sql, [id_empleado, id_vehiculo], function(err) {
                if (err) {
                    console.error('Error al solicitar cambio de vehículo:', err.message);
                    return reject(err);
                }
                resolve({ id: this.lastID });
            });
        });
    },
}

module.exports = empleadoModel;