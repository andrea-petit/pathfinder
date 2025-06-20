document.addEventListener('DOMContentLoaded', () => {
    const empleadosBtn = document.getElementById('empleados-button');
    const paquetesBtn = document.querySelector('nav button:nth-child(2)');
    const reportesBtn = document.querySelector('nav button:nth-child(3)');
    const vehiculosBtn = document.querySelector('nav button:nth-child(4)');

    const empleadosContainer = document.getElementById('empleados-container');
    const paquetesContainer = document.getElementById('paquetes-container');
    const reportesContainer = document.getElementById('reportes-container');
    const vehiculosContainer = document.getElementById('vehiculos-container');

    function mostrarSeccion(seccion) {
        empleadosContainer.style.display = 'none';
        paquetesContainer.style.display = 'none';
        reportesContainer.style.display = 'none';
        vehiculosContainer.style.display = 'none';
        seccion.style.display = 'block';
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
            <h2>Vehículos</h2>
            <p>Control y registro de vehículos.</p>
            <button id="ver-todos-vehiculos">Ver todos los vehículos</button>
            <button id="ver-solicitudes-cambio">Ver solicitudes de cambio de vehículo</button>
            <div id="info-vehiculos"></div>
        `;

        const infoDiv = document.getElementById('info-vehiculos');

        document.getElementById('ver-todos-vehiculos').onclick = async () => {
            infoDiv.innerHTML = '<h3>Todos los vehículos</h3>';
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
            infoDiv.innerHTML = '<h3>Solicitudes de cambio de vehículo</h3>';
            const res = await fetch('/api/admin/solicitudesCambioVehiculo');
            const solicitudes = await res.json();

            if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
                infoDiv.innerHTML += '<p>No hay solicitudes pendientes.</p>';
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
});