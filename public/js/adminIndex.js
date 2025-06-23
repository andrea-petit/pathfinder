document.addEventListener('DOMContentLoaded', () => {
    const empleadosBtn = document.getElementById('empleados-button');
    const paquetesBtn = document.getElementById('paquetes-button');
    const reportesBtn = document.getElementById('reportes-button');
    const vehiculosBtn = document.getElementById('vehiculos-button');

    const empleadosContainer = document.getElementById('empleados-container');
    const paquetesContainer = document.getElementById('paquetes-container');
    const reportesContainer = document.getElementById('reportes-container');
    const vehiculosContainer = document.getElementById('vehiculos-container');

    function mostrarSeccion(seccion) {
        empleadosContainer.style.display = 'none';
        paquetesContainer.style.display = 'none';
        reportesContainer.style.display = 'none';
        vehiculosContainer.style.display = 'none';
        if(seccion == reportesContainer) {seccion.style.display = 'flex'}
        else {seccion.style.display = 'block';}
        
    }

    empleadosBtn.addEventListener('click', () => mostrarSeccion(empleadosContainer));
    paquetesBtn.addEventListener('click', () => mostrarSeccion(paquetesContainer));
    reportesBtn.addEventListener('click', () => mostrarSeccion(reportesContainer));
    vehiculosBtn.addEventListener('click', () => {
        mostrarSeccion(vehiculosContainer);
        renderVehiculos();
    });

    function renderVehiculos() {
        vehiculosContainer.innerHTML = `
            <h1>Vehículos</h1>
            <p>Control y registro de vehículos.</p>
            <button id="ver-todos-vehiculos">Ver todos los vehículos</button>
            <button id="ver-solicitudes-cambio">Ver solicitudes de cambio de vehículo</button>
            <div id="info-vehiculos"></div>
        `;

        const infoDiv = document.getElementById('info-vehiculos');

        document.getElementById('ver-todos-vehiculos').onclick = async () => {
            infoDiv.innerHTML = '<hr><h3>Todos los vehículos</h3>';
            const res = await fetch('/api/admin/getAllVehiculosInfo');
            const vehiculos = await res.json();
            if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
                infoDiv.innerHTML += '<p>No hay vehículos registrados.</p>';
                return;
            }
            vehiculos.forEach(v => {
                const div = document.createElement('div');
                div.style.border = '1px solid #ccc';
                div.style.margin = '10px 0';
                div.style.padding = '10px';
                div.innerHTML = `
                    <strong>Placa:</strong> ${v.placa}<br>
                    <strong>Marca:</strong> ${v.marca}<br>
                    <strong>Modelo:</strong> ${v.modelo}<br>
                    <strong>Estado:</strong> ${v.estado}<br>
                    <strong>Empleado asignado:</strong> ${v.nombre1 ? v.nombre1 + ' ' + (v.apellido1 || '') : 'Sin asignar'}
                `;
                infoDiv.appendChild(div);
            });
        };

        document.getElementById('ver-solicitudes-cambio').onclick = async () => {
            infoDiv.innerHTML = '<hr><h3>Solicitudes de cambio de vehículo</h3>';
            const res = await fetch('/api/admin/solicitudesCambioVehiculo');
            const solicitudes = await res.json();

            if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
                infoDiv.innerHTML += '<p id="psoli">No hay solicitudes pendientes.</p>';
                return;
            }

            solicitudes.forEach(solicitud => {
                const div = document.createElement('div');
                div.style.border = '1px solid #ccc';
                div.style.margin = '10px 0';
                div.style.padding = '10px';
                div.innerHTML = `
                    <strong>Empleado:</strong> ${solicitud.nombre1} ${solicitud.apellido1} (${solicitud.id_empleado})<br>
                    <strong>Vehículo solicitado:</strong> ${solicitud.placa} - ${solicitud.marca} ${solicitud.modelo}<br>
                    <strong>Fecha:</strong> ${solicitud.fecha_solicitud}<br>
                    <strong>Estado:</strong> ${solicitud.estado}<br>
                    <button class="aprobar-btn">Aprobar</button>
                    <button class="rechazar-btn">Rechazar</button>
                `;

                div.querySelector('.aprobar-btn').addEventListener('click', async () => {
                    const res = await fetch('/api/admin/aprobarSolicitudVehiculo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: solicitud.id_empleado,
                            id_vehiculo: solicitud.id_vehiculo,
                            id_solicitud: solicitud.id
                        })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        Swal.fire({
                            title: "Solicitud aprobada",
                            icon: "success",
                        });
                        renderVehiculos();
                    } else {
                        Swal.fire({
                            title: "Error al aprobar",
                            text: data.error || 'Error al aprobar la solicitud',
                            icon: "error",
                        });
                    }
                });

                div.querySelector('.rechazar-btn').addEventListener('click', async () => {
                    const res = await fetch('/api/admin/rechazarSolicitudVehiculo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_solicitud: solicitud.id })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        Swal.fire({
                                    title: "Solicitud rechazada",
                                    icon: "warning",
                                    });
                        div.remove();
                    } else {
                        Swal.fire({
                                    title: "Error al rechazar",
                                    text: data.error || 'Error al rechazar la solicitud',
                                    icon: "error",
                                    });
                    }
                });

                infoDiv.appendChild(div);
            });
        };
    }

    const tipoReporte = document.getElementById('tipo-reporte');
    const reporteIndividualDiv = document.getElementById('reporte-individual');
    const selectEmpleado = document.getElementById('select-empleado');
    const generarReporteBtn = document.getElementById('generar-reporte-btn');

    reporteIndividualDiv.style.display = 'none';

    tipoReporte.addEventListener('change', () => {
        if (tipoReporte.value === 'empleados') {
            reporteIndividualDiv.style.display = 'block';
            cargarEmpleados();
        } else {
            reporteIndividualDiv.style.display = 'none';
        }
    });

    async function cargarEmpleados() {
        try {
            const res = await fetch('/api/admin/getEmpleados');
            const empleados = await res.json();
            selectEmpleado.innerHTML = '<option value="">Seleccione un empleado</option>';
            empleados.forEach(emp => {
                if (emp.id_empleado == 1) return;
                const option = document.createElement('option');
                option.value = emp.id_empleado;
                option.textContent = `${emp.nombre1} ${emp.apellido1} (${emp.id_empleado})`;
                selectEmpleado.appendChild(option);
            });
        } catch (err) {
            console.error('Error al cargar empleados:', err);
        }
    }

    if (generarReporteBtn) {
        generarReporteBtn.addEventListener('click', async () => {
            const fechaInicio = document.getElementById('fecha-inicio').value;
            const fechaFin = document.getElementById('fecha-fin').value;

            if (tipoReporte.value === 'viajes') {
                if (!fechaInicio || !fechaFin) {
                    Swal.fire({
                        title: "Fechas requeridas",
                        text: "Debes seleccionar la fecha de inicio y fin.",
                        icon: "warning"
                    });
                    return;
                }
                try {
                    const res = await fetch('/api/reporte/reporteViajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fechaInicio, fechaFin })
                    });

                    if (!res.ok) {
                        throw new Error('No se pudo generar el reporte');
                    }

                    Swal.fire({
                        title: "Reporte generado",
                        text: "La descarga del reporte ha comenzado",
                        icon: "success"
                    });
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte_viajes_${fechaInicio}_al_${fechaFin}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo generar el reporte.",
                        icon: "error"
                    });
                }
            } else if (tipoReporte.value === 'empleados') {
                const id_empleado = selectEmpleado.value;
                if (!id_empleado || !fechaInicio || !fechaFin) {
                    Swal.fire({
                        title: "Campos requeridos",
                        text: "Selecciona un empleado y el rango de fechas.",
                        icon: "warning"
                    });
                    return;
                }
                try {
                    const res = await fetch('/api/reporte/reporteIndividual', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado, fechaInicio, fechaFin })
                    });

                    if (!res.ok) {
                        throw new Error('No se pudo generar el reporte');
                    }

                    Swal.fire({
                        title: "Reporte generado",
                        text: "La descarga del reporte ha comenzado",
                        icon: "success"
                    });
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte_individual_${id_empleado}_${fechaInicio}_al_${fechaFin}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo generar el reporte.",
                        icon: "error"
                    });
                }
            }
        });
    }
});