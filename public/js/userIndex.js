document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resEmpleado = await fetch('/api/empleados/info');
        const empleado = await resEmpleado.json();

        if (resEmpleado.ok) {
            document.querySelector('#info-repartidor').innerHTML = `
                <p><strong>Nombre:</strong> ${empleado.nombre1} ${empleado.nombre2 || ''} ${empleado.apellido1} ${empleado.apellido2 || ''}</p>
                <p><strong>Cédula:</strong> ${empleado.id_empleado}</p>
                <p><strong>Correo:</strong> ${empleado.correo}</p>
            `;
        } else {
            document.querySelector('#info-repartidor').innerHTML = `<p>Error al cargar información personal.</p>`;
        }

        const resVehiculo = await fetch('/api/empleados/vehiculo');
        const vehiculo = await resVehiculo.json();

        if (resVehiculo.ok && vehiculo) {
            document.querySelector('#info-vehiculo').innerHTML = `
                <p><strong>Placa:</strong> ${vehiculo.placa}</p>
                <p><strong>Modelo:</strong> ${vehiculo.modelo}</p>
                <p><strong>Tipo:</strong> ${vehiculo.marca}</p>
            `;
        } else {
            document.querySelector('#info-vehiculo').innerHTML = `<p>No tiene vehículo asignado.</p>`;
        }

    } catch (err) {
        document.querySelector('#info-repartidor').innerHTML = `<p>Error de conexión.</p>`;
        document.querySelector('#info-vehiculo').innerHTML = `<p>Error de conexión.</p>`;
        document.getElementById('cantidad-paquetes').textContent = '0';
    }

    let paquetes = [];
    try {
        const res = await fetch('/api/paquetes/getPaquetes');
        paquetes = await res.json();
        document.getElementById('cantidad-paquetes').textContent = paquetes.length;
    } catch (err) {
        document.getElementById('cantidad-paquetes').textContent = '0';
    }

    document.getElementById('generar-viajes-btn').addEventListener('click', () => {
        mostrarSeleccionPaquetes(paquetes);
    });
});

function mostrarSeleccionPaquetes(paquetes) {
    let contenedor = document.getElementById('seleccion-paquetes');
    if (contenedor) contenedor.remove();

    contenedor = document.createElement('div');
    contenedor.id = 'seleccion-paquetes';
    contenedor.innerHTML = '<h3>Selecciona hasta 5 paquetes para el viaje</h3>';

    const seleccionados = new Set();

    paquetes.forEach(paquete => {
        const div = document.createElement('div');
        div.innerHTML = `
            <input type="checkbox" class="paquete-checkbox" value="${paquete.id_paquete}">
            <strong>Código:</strong> ${paquete.id_paquete}<br>
            <strong>Cliente:</strong> ${paquete.cliente_nombre1} ${paquete.cliente_apellido1}<br>
            <strong>Teléfono:</strong> ${paquete.cliente_telefono}<br>
            <strong>Dirección:</strong> ${paquete.sector}, ${paquete.urbanizacion}, ${paquete.calle}, Casa ${paquete.numero_casa}<br>
            <strong>Referencia:</strong> ${paquete.referencia || ''}<br>
        `;
        contenedor.appendChild(div);
    });

    const btnGenerar = document.createElement('button');
    btnGenerar.textContent = 'Confirmar viaje';
    btnGenerar.disabled = true;
    contenedor.appendChild(btnGenerar);

    document.body.appendChild(contenedor);

    const checkboxes = contenedor.querySelectorAll('.paquete-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            if (this.checked) {
                if (seleccionados.size >= 5) {
                    this.checked = false;
                    alert('Solo puedes seleccionar hasta 5 paquetes.');
                } else {
                    seleccionados.add(this.value);
                }
            } else {
                seleccionados.delete(this.value);
            }
            btnGenerar.disabled = seleccionados.size === 0;
        });
    });

    btnGenerar.addEventListener('click', async () => {
        const id_empleado = window.ID_EMPLEADO || prompt('Ingresa tu ID de empleado:');
        if (!id_empleado) {
            alert('No se pudo obtener el ID del empleado.');
            return;
        }
        try {
            const res = await fetch('/api/paquetes/generarViaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empleado,
                    ids_paquetes: Array.from(seleccionados)
                })
            });
            const result = await res.json();
            if (res.ok) {
                alert('Viaje generado exitosamente');
                contenedor.remove();
                location.reload();
            } else {
                alert(result.error || 'Error al generar el viaje');
            }
        } catch (err) {
            alert('Error de conexión al generar el viaje');
        }
    });
}

