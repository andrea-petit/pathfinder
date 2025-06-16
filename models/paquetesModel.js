const db = require('../database/db');

const paquetesModel = {
    getPaquetes: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    p.id_paquete,
                    p.fecha_envio,
                    p.estado,
                    c.id_cliente,
                    c.nombre1 AS cliente_nombre1,
                    c.nombre2 AS cliente_nombre2,
                    c.apellido1 AS cliente_apellido1,
                    c.apellido2 AS cliente_apellido2,
                    c.telefono AS cliente_telefono,
                    d.sector,
                    d.urbanizacion,
                    d.calle,
                    d.numero_casa,
                    d.referencia
                FROM paquetes p
                JOIN clientes c ON p.id_cliente = c.id_cliente
                JOIN destinos dest ON dest.id_paquete = p.id_paquete
                JOIN direccion d ON dest.id_direccion = d.id_direccion
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error al obtener paquetes:', err.message);
                    return reject(err);
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
    },

    generarViaje: (id_empleado, ids_paquetes) => {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(ids_paquetes) || ids_paquetes.length === 0) {
                return reject(new Error('Debes seleccionar al menos un paquete.'));
            }
            if (ids_paquetes.length > 5) {
                return reject(new Error('No puedes seleccionar más de 5 paquetes.'));
            }

            db.run(
                `INSERT INTO viajes (id_empleado, fecha) VALUES (?, datetime('now'))`,
                [id_empleado],
                function (err) {
                    if (err) {
                        console.error('Error al crear viaje:', err.message);
                        return reject(err);
                    }
                    const id_viaje = this.lastID;

                    const placeholders = ids_paquetes.map(() => '?').join(',');
                    db.all(
                        `SELECT id, id_paquete FROM destinos WHERE id_paquete IN (${placeholders})`,
                        ids_paquetes,
                        (err, destinos) => {
                            if (err) {
                                console.error('Error al obtener destinos:', err.message);
                                return reject(err);
                            }

                            let inserts = 0;
                            destinos.forEach((destino, idx) => {
                                db.run(
                                    `INSERT INTO viaje_detalles (id_viaje, id_destino, orden_entrega) VALUES (?, ?, ?)`,
                                    [id_viaje, destino.id, idx + 1],
                                    function (err) {
                                        if (err) {
                                            console.error('Error al insertar detalle de viaje:', err.message);
                                            return reject(err);
                                        }
                                        inserts++;
                                        if (inserts === destinos.length) {
                                            resolve({ id_viaje, paquetes: ids_paquetes });
                                        }
                                    }
                                );
                            });
                        }
                    );
                }
            );
        });
    },
};

module.exports = paquetesModel;

