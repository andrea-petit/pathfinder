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

    try {
        const res = await fetch('/api/paquetes/getPaquetes');
        const paquetes = await res.json();
        document.getElementById('cantidad-paquetes').textContent = paquetes.length;

        document.getElementById('generar-viajes-btn').addEventListener('click', () => {
            mostrarPaquetesParaViaje(paquetes);
        });
    } catch (err) {
        document.getElementById('cantidad-paquetes').textContent = '0';
    }
});

function mostrarPaquetesParaViaje(paquetes) {
    let contenedor = document.getElementById('paquetes-viaje');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'paquetes-viaje';
        document.body.appendChild(contenedor);
    }
    contenedor.innerHTML = '<h3>Selecciona hasta 5 paquetes para el viaje</h3>';

    let seleccionados = new Set();

    paquetes.forEach(paquete => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.margin = '8px 0';
        div.style.padding = '8px';
        div.innerHTML = `
            <strong>Código:</strong> ${paquete.codigo}<br>
            <strong>Dirección:</strong> ${paquete.direccion_entrega}<br>
            <button class="seleccionar-btn" data-id="${paquete.id_paquete}">Seleccionar</button>
        `;
        contenedor.appendChild(div);

        const btn = div.querySelector('.seleccionar-btn');
        btn.addEventListener('click', (e) => {
            const idPaquete = e.target.getAttribute('data-id');
            if (seleccionados.has(idPaquete)) {
                seleccionados.delete(idPaquete);
                btn.textContent = 'Seleccionar';
                btn.style.background = '';
            } else {
                if (seleccionados.size >= 5) {
                    alert('Solo puedes seleccionar hasta 5 paquetes.');
                    return;
                }
                seleccionados.add(idPaquete);
                btn.textContent = 'Seleccionado';
                btn.style.background = '#b3e6b3';
            }
        });
    });
}

