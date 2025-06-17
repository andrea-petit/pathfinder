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
    }
};

module.exports = adminModel;