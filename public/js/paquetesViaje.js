document.addEventListener('DOMContentLoaded', async () => {
    let paquetes = [];
    try {
        const res = await fetch('/api/paquetes/getPaquetes');
        paquetes = await res.json();
        mostrarSeleccionPaquetes(paquetes);
    } catch (err) {
        alert('Error al cargar paquetes');
    }
});

function mostrarSeleccionPaquetes(paquetes) {
    const cambioVehiculo = document.getElementById('form-cambio-vehiculo');
    if (cambioVehiculo) cambioVehiculo.remove();

    let contenedor = document.getElementById('paquetes-viaje');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'paquetes-viaje';
        document.body.appendChild(contenedor);
    }
    contenedor.innerHTML = '<h3>Selecciona al menos 5 paquetes</h3>';

    const seleccionados = new Set();

    paquetes.forEach(paquete => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.margin = '8px 0';
        div.style.padding = '8px';
        div.innerHTML = `
            <input type="checkbox" class="paquete-checkbox" value="${paquete.id_paquete}">
            <strong>Código:</strong> ${paquete.id_paquete}<br>
            <strong>Cliente:</strong> ${paquete.cliente_nombre1} ${paquete.cliente_apellido1}<br>
            <strong>Dirección:</strong> ${paquete.sector}, ${paquete.urbanizacion}, ${paquete.calle}, Casa ${paquete.numero_casa}<br>
            <strong>Referencia:</strong> ${paquete.referencia || ''}<br>
        `;
        contenedor.appendChild(div);
    });

    const btnGenerar = document.createElement('button');
    btnGenerar.textContent = 'Generar viaje';
    btnGenerar.disabled = true;
    contenedor.appendChild(btnGenerar);

    contenedor.querySelectorAll('.paquete-checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
            if (this.checked) {
                seleccionados.add(this.value);
            } else {
                seleccionados.delete(this.value);
            }
            btnGenerar.disabled = seleccionados.size < 5;
        });
    });

    btnGenerar.addEventListener('click', async () => {
        const id_empleado = window.ID_EMPLEADO || prompt('Ingresa tu ID de empleado:');
        if (!id_empleado) return alert('ID de empleado requerido.');
        const resViaje = await fetch('/api/paquetes/generarViaje', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado })
        });
        const dataViaje = await resViaje.json();
        if (!resViaje.ok) return alert(dataViaje.error || 'Error al generar viaje');

        alert('Viaje generado. Ahora puedes optimizar la ruta.');
    });
}