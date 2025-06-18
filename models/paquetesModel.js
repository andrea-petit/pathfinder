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
                    d.calle,
                    d.numero_casa,
                    d.referencia,
                    d.lat AS LAT,
                    d.lon AS LON
                FROM paquetes p
                JOIN clientes c ON p.id_cliente = c.id_cliente
                JOIN destinos dest ON dest.id_paquete = p.id_paquete
                JOIN direccion d ON dest.id_direccion = d.id_direccion
                ORDER BY p.id_paquete
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
            const sql = `
                SELECT 
                    p.*,
                    c.id_cliente,
                    c.nombre1 AS cliente_nombre1,
                    c.nombre2 AS cliente_nombre2,
                    c.apellido1 AS cliente_apellido1,
                    c.apellido2 AS cliente_apellido2,
                    c.telefono AS cliente_telefono,
                    d.id_direccion,
                    d.sector,
                    d.calle,
                    d.estado,
                    d.pais,
                    d.numero_casa,
                    d.referencia,
                    d.LAT,
                    d.LON
                FROM paquetes p
                JOIN clientes c ON p.id_cliente = c.id_cliente
                JOIN destinos dest ON dest.id_paquete = p.id_paquete
                JOIN direccion d ON dest.id_direccion = d.id_direccion
                WHERE p.id_paquete = ?
            `;
            db.get(sql, [id_paquete], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    },

    generarViaje: (id_empleado) => {
        return new Promise((resolve, reject) => {
            if (!id_empleado) {
                return reject(new Error('ID de empleado no proporcionado.'));
            }
            const sql = `INSERT INTO viajes (id_empleado, fecha) VALUES (?, datetime('now'))`;
            db.run(sql, [id_empleado], function (err) {
                if (err) {
                    console.error('Error al generar viaje:', err.message);
                    return reject(err);
                }
                resolve({ id_viaje: this.lastID });
            });
        });
    },
    
    guardarViajeDetalles: (id_viaje, detalles) => {
        return new Promise((resolve, reject) => {
            if (!id_viaje || !Array.isArray(detalles) || detalles.length === 0) {
                return reject(new Error('Datos insuficientes para guardar detalles del viaje.'));
            }
            let completados = 0;
            let errorOcurrido = false;
            detalles.forEach(detalle => {
                const { id_paquete, orden_entrega, comentario } = detalle;
                db.get(
                    `SELECT id FROM destinos WHERE id_paquete = ?`,
                    [id_paquete],
                    function (err, row) {
                        if (err || !row) {
                            errorOcurrido = true;
                            return reject(new Error('No se encontró destino para el paquete ' + id_paquete));
                        }
                        db.run(
                            `INSERT INTO viaje_detalles (id_viaje, id_destino, orden_entrega, observacion) VALUES (?, ?, ?, ?)`,
                            [id_viaje, row.id, orden_entrega, comentario || null],
                            function (err2) {
                                if (err2 && !errorOcurrido) {
                                    errorOcurrido = true;
                                    return reject(err2);
                                }
                                completados++;
                                if (completados === detalles.length && !errorOcurrido) {
                                    resolve({ message: 'Detalles de viaje guardados correctamente.' });
                                }
                            }
                        );
                    }
                );
            });
        });
    },
};

module.exports = paquetesModel;

