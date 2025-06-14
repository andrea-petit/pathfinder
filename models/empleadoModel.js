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

    loginEmpleado: (nombre_usuario, contraseña, callback) => {
        const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?`;
        db.get(sql, [nombre_usuario, contraseña], (err, row) => {
            if (err) {
                
                console.error('Error al realizar la consulta:', err.message);
                return callback(err);
            }
            callback(null, row);
        });
    },
    getInfoById: (id_empleado, callback) => {
        const sql = `SELECT * FROM empleados WHERE id_empleado = ?`;
        db.get(sql, [id_empleado], (err, row) => {
            if (err) {
                console.error('Error al realizar la consulta:', err.message);
                return callback(err);
            }
            callback(null, row);
        });
    },

}

module.exports = empleadoModel;