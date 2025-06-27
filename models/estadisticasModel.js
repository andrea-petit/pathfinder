const db = require('../database/db');

const estadisticasModel = {
    getPaquetesEntregadosByPeriodo: (fechaInicio, fechaFin) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT v.id_empleado, e.nombre1, e.apellido1, COUNT(DISTINCT d.id_paquete) AS total_entregados
                FROM viaje_detalles vd
                JOIN viajes v ON vd.id_viaje = v.id
                JOIN empleados e ON v.id_empleado = e.id_empleado
                JOIN destinos d ON vd.id_destino = d.id
                JOIN paquetes p ON d.id_paquete = p.id_paquete
                WHERE vd.estado = 'entregado'
                AND DATE(v.fecha) BETWEEN ? AND ?
                GROUP BY v.id_empleado
                ORDER BY total_entregados DESC
            `;
            db.all(query, [fechaInicio, fechaFin], (err, rows) => {
                if (err) {
                    console.error('Error al obtener paquetes entregados por empleado en el periodo:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },
};

module.exports = estadisticasModel;



