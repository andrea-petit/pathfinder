const db= require('../database/db');

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
            const sql = `INSERT INTO empleado_vehiculo (id_empleado, id_vehiculo) VALUES (?, ?)`;
            db.run(sql, [id_empleado, id_vehiculo], function(err) {
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
    }


};

module.exports = adminModel;