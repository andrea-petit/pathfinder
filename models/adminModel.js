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
            const sql = `SELECT * FROM empleados`;
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


};

module.exports = adminModel;