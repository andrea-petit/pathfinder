const db = require('../database/db');

const paquetesModel = {
    getPaquetes: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, 
                       d.direccion AS direccion_entrega
                FROM paquetes p
                JOIN clientes c ON p.id_cliente = c.id_cliente
                JOIN direcciones d ON p.id_direccion = d.id_direccion
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    },

    getPaqueteById: (id_paquete) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM paquetes WHERE id_paquete = ?`;
            db.get(sql, [id_paquete], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    
};

module.exports = paquetesModel;

