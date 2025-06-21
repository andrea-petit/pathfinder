const db = require('../database/db');


const adminModel = {
    registerEmpleado: (id_empleado, nombre1, nombre2, apellido1, apellido2, telefono, correo) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO empleados (id_empleado, nombre1, nombre2, apellido1, apellido2, telefono, correo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [id_empleado, nombre1, nombre2, apellido1, apellido2, telefono, correo], function(err) {
                if (err) {
                    reject(err);
                }
                resolve({ id: id_empleado});
            });
        });
    },

    getEmpleados: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT e.*, v.id_vehiculo, v.placa, v.marca, v.modelo
                FROM empleados e
                LEFT JOIN (
                    SELECT ev.id_empleado, ev.id_vehiculo, v.placa, v.marca, v.modelo
                    FROM empleado_vehiculo ev
                    JOIN vehiculos v ON ev.id_vehiculo = v.id_vehiculo
                    WHERE ev.id IN (
                        SELECT MAX(id) FROM empleado_vehiculo GROUP BY id_empleado
                    )
                ) v ON e.id_empleado = v.id_empleado
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    },

    getEmpleadoById: (id_empleado) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM empleados WHERE id_empleado = ?`;
            db.get(sql, [id_empleado], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    },

    asignVehiculo: (id_empleado, id_vehiculo) => {
        return new Promise((resolve, reject) => {
            const nota = 'Afiliación inicial';
            const fecha_asignacion = new Date().toISOString();
            const sql = `INSERT INTO empleado_vehiculo (id_empleado, id_vehiculo, nota, fecha_asignacion) VALUES (?, ?, ?, ?)`;
            db.run(sql, [id_empleado, id_vehiculo, nota, fecha_asignacion], function(err) {
                if (err) {
                    return reject(err);
                }
                const updateSql = `UPDATE vehiculos SET estado = 'asignado' WHERE id_vehiculo = ?`;
                db.run(updateSql, [id_vehiculo], (err2) => {
                    if (err2) {
                        return reject(err2);
                    }
                    resolve({ id: this.lastID });
                });
            });
        });
    },

    getVehiculos: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM vehiculos where estado = 'disponible'`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    },

    solicitarEntradaPaquetes: (cantidad = 20) => {
        return new Promise((resolve, reject) => {
            try {
                generarPaquetesAleatorios(cantidad)
                    .then(result => resolve(result))
                    .catch(err => reject(err));
            } catch (err) {
                reject(err);
            }
        });
    },
    updateEmpleado: (id_empleado, campo, valor) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE empleados SET ${campo} = ? WHERE id_empleado = ?`;
            db.run(sql, [valor, id_empleado], function(err) {
                if (err) {
                    console.error('Error al actualizar empleado:', err.message);
                    return reject(err);
                }
                resolve({ id: id_empleado });
            });
        });
    },
    deleteEmpleado: (id_empleado) => {
        return new Promise((resolve, reject) => {
            const vehiculoSql = `
                SELECT id_vehiculo FROM empleado_vehiculo
                WHERE id_empleado = ?
                ORDER BY id DESC LIMIT 1
            `;
            db.get(vehiculoSql, [id_empleado], function(err, row) {
                if (err) {
                    console.error('Error al buscar vehículo asignado:', err.message);
                    return reject(err);
                }
                const liberarVehiculo = row && row.id_vehiculo
                    ? new Promise((res, rej) => {
                        db.run(
                            `UPDATE vehiculos SET estado = 'disponible' WHERE id_vehiculo = ?`,
                            [row.id_vehiculo],
                            function(err2) {
                                if (err2) {
                                    console.error('Error al liberar vehículo:', err2.message);
                                    return rej(err2);
                                }
                                res();
                            }
                        );
                    })
                    : Promise.resolve();

                liberarVehiculo.then(() => {
                    const sql = `DELETE FROM empleados WHERE id_empleado = ?`;
                    db.run(sql, [id_empleado], function(err3) {
                        if (err3) {
                            console.error('Error al eliminar empleado:', err3.message);
                            return reject(err3);
                        }
                        resolve({ id: id_empleado });
                    });
                }).catch(reject);
            });
        });
    },
    aprobarSolicitudVehiculo: (id_empleado, id_vehiculo, id_solicitud) => {
        return new Promise((resolve, reject) => {
            const sqlAnterior = `
                SELECT id_vehiculo FROM empleado_vehiculo
                WHERE id_empleado = ?
                ORDER BY id DESC LIMIT 1
            `;
            db.get(sqlAnterior, [id_empleado], function(err, rowAnterior) {
                if (err) {
                    console.error('Error al buscar vehículo anterior:', err.message);
                    return reject(err);
                }
                const sql = `INSERT INTO empleado_vehiculo (id_empleado, id_vehiculo, nota, fecha_asignacion) VALUES (?, ?, 'Solicitud aprobada', ?)`;
                const fecha_asignacion = new Date().toISOString();
                db.run(sql, [id_empleado, id_vehiculo, fecha_asignacion], function(err2) {
                    if (err2) {
                        console.error('Error al aprobar solicitud de vehículo:', err2.message);
                        return reject(err2);
                    }
                    db.run(`UPDATE vehiculos SET estado = 'asignado' WHERE id_vehiculo = ?`, [id_vehiculo], (err3) => {
                        if (err3) {
                            console.error('Error al actualizar estado del vehículo nuevo:', err3.message);
                            return reject(err3);
                        }
                        // Cambia el estado de la solicitud a 'aprobada'
                        db.run(`UPDATE solicitudCambioVehiculo SET estado = 'aprobada' WHERE id = ?`, [id_solicitud], (err5) => {
                            if (err5) {
                                console.error('Error al actualizar estado de la solicitud:', err5.message);
                                return reject(err5);
                            }
                            if (rowAnterior && rowAnterior.id_vehiculo && rowAnterior.id_vehiculo != id_vehiculo) {
                                db.run(`UPDATE vehiculos SET estado = 'disponible' WHERE id_vehiculo = ?`, [rowAnterior.id_vehiculo], (err4) => {
                                    if (err4) {
                                        console.error('Error al liberar vehículo anterior:', err4.message);
                                        return reject(err4);
                                    }
                                    resolve({ id: this.lastID });
                            });
                        } else {
                            resolve({ id: this.lastID });
                        }
                    });
                });
            });
        });
    });

    },

    getSolicitudesCambioVehiculo: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT scv.*, e.nombre1, e.apellido1, v.placa, v.marca, v.modelo
                FROM solicitudCambioVehiculo scv
                JOIN empleados e ON scv.id_empleado = e.id_empleado
                JOIN vehiculos v ON scv.id_vehiculo = v.id_vehiculo
                WHERE scv.estado = 'pendiente'
                ORDER BY scv.fecha_solicitud DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error al obtener solicitudes:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    rechazarSolicitudVehiculo: (id_solicitud) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE solicitudCambioVehiculo SET estado = 'rechazada' WHERE id = ?`;
            db.run(sql, [id_solicitud], function(err) {
                if (err) {
                    console.error('Error al rechazar solicitud:', err.message);
                    return reject(err);
                }
                resolve({ id: id_solicitud, rechazada: true });
            });
        });
    },
    getAllVehiculosInfo: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT v.*, 
                       CASE WHEN v.estado = 'asignado' THEN ev.id_empleado ELSE NULL END as id_empleado,
                       CASE WHEN v.estado = 'asignado' THEN e.nombre1 ELSE NULL END as nombre1,
                       CASE WHEN v.estado = 'asignado' THEN e.apellido1 ELSE NULL END as apellido1
                FROM vehiculos v
                LEFT JOIN empleado_vehiculo ev
                    ON v.id_vehiculo = ev.id_vehiculo
                    AND ev.id = (
                        SELECT MAX(ev2.id)
                        FROM empleado_vehiculo ev2
                        WHERE ev2.id_vehiculo = v.id_vehiculo
                    )
                LEFT JOIN empleados e ON ev.id_empleado = e.id_empleado
                ORDER BY v.placa
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error al obtener información de vehículos:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },
};

module.exports = adminModel;