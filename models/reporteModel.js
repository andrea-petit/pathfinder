const db= require('../database/db');

const reporteModel = {
    getReporteViajes: (fechaInicio, fechaFin) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    v.id AS id_viaje,
                    v.fecha,
                    e.id_empleado,
                    e.nombre1,
                    e.apellido1,
                    veh.placa,
                    veh.marca,
                    veh.modelo,
                    p.id_paquete,
                    c.nombre1 AS cliente_nombre,
                    c.apellido1 AS cliente_apellido,
                    d.calle,
                    d.sector,
                    d.estado,
                    d.pais,
                    vd.orden_entrega,
                    vd.estado AS estado_entrega,
                    vd.eta_estimada,
                    vd.observacion
                FROM viajes v
                JOIN empleados e ON v.id_empleado = e.id_empleado
                LEFT JOIN (
                    SELECT ev.id_empleado, ev.id_vehiculo
                    FROM empleado_vehiculo ev
                    WHERE ev.id IN (
                        SELECT MAX(id) FROM empleado_vehiculo GROUP BY id_empleado
                    )
                ) as ev ON e.id_empleado = ev.id_empleado
                LEFT JOIN vehiculos veh ON ev.id_vehiculo = veh.id_vehiculo
                JOIN viaje_detalles vd ON v.id = vd.id_viaje
                JOIN destinos dest ON vd.id_destino = dest.id
                JOIN paquetes p ON dest.id_paquete = p.id_paquete
                JOIN clientes c ON p.id_cliente = c.id_cliente
                JOIN direccion d ON dest.id_direccion = d.id_direccion
                WHERE DATE(v.fecha) BETWEEN ? AND ?
                ORDER BY v.fecha DESC, v.id
            `;
            db.all(sql, [fechaInicio, fechaFin], (err, rows) => {
                if (err) {
                    console.error('Error al obtener reporte de viajes:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },
    getReporteViajesPorEmpleado: (id_empleado, fechaInicio, fechaFin) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    v.id AS id_viaje,
                    v.fecha,
                    e.id_empleado,
                    e.nombre1,
                    e.apellido1,
                    veh.placa,
                    veh.marca,
                    veh.modelo,
                    p.id_paquete,
                    c.nombre1 AS cliente_nombre,
                    c.apellido1 AS cliente_apellido,
                    d.calle,
                    d.sector,
                    d.estado,
                    d.pais,
                    vd.orden_entrega,
                    vd.estado AS estado_entrega,
                    vd.eta_estimada,
                    vd.observacion
                FROM viajes v
                JOIN empleados e ON v.id_empleado = e.id_empleado
                LEFT JOIN (
                    SELECT ev.id_empleado, ev.id_vehiculo
                    FROM empleado_vehiculo ev
                    WHERE ev.id IN (
                        SELECT MAX(id) FROM empleado_vehiculo GROUP BY id_empleado
                    )
                ) as ev ON e.id_empleado = ev.id_empleado
                LEFT JOIN vehiculos veh ON ev.id_vehiculo = veh.id_vehiculo
                JOIN viaje_detalles vd ON v.id = vd.id_viaje
                JOIN destinos dest ON vd.id_destino = dest.id
                JOIN paquetes p ON dest.id_paquete = p.id_paquete
                JOIN clientes c ON p.id_cliente = c.id_cliente
                JOIN direccion d ON dest.id_direccion = d.id_direccion
                WHERE e.id_empleado = ? AND DATE(v.fecha) BETWEEN ? AND ?
                ORDER BY v.fecha DESC, v.id
            `;
            db.all(sql, [id_empleado, fechaInicio, fechaFin], (err, rows) => {
                if (err) {
                    console.error('Error al obtener reporte de viajes por empleado:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },
    
};

module.exports = reporteModel;