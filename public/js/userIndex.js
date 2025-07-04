import { generarRuta } from './rutaOptima.js';

let paquetes = [];
let tipoPlaca = null;


document.addEventListener('DOMContentLoaded', async () => {
    
    try {
        const res = await fetch('/api/paquetes/getPaquetes');
        paquetes = await res.json();
        document.getElementById('cantidad-paquetes').textContent = paquetes.length;
    } catch (err) {
        document.getElementById('cantidad-paquetes').textContent = '0';
    }
    try {
        const resEmpleado = await fetch('/api/empleados/info');
        const empleado = await resEmpleado.json();


        if (resEmpleado.ok) {
            document.querySelector('#info-repartidor').innerHTML = `
                <h2>Información Personal</h2>
                <p><strong>Nombre:</strong> ${empleado.nombre1} ${empleado.nombre2 || ''} ${empleado.apellido1} ${empleado.apellido2 || ''}</p>
                <p><strong>Cédula:</strong> ${empleado.id_empleado}</p>
                <p><strong>Correo:</strong> ${empleado.correo}</p>
            `;
            document.querySelector('#info-repartidor').style.display = 'block'
        } else {
            document.querySelector('#info-repartidor').innerHTML = `<p>Error al cargar información personal.</p>`;
        }

        const resVehiculo = await fetch('/api/empleados/vehiculo');
        const vehiculo = await resVehiculo.json();

        if (resVehiculo.ok && vehiculo) {
            tipoPlaca = vehiculo.placa.substring(0, 3).toUpperCase();
            console.log(tipoPlaca);
            document.querySelector('#info-vehiculo').innerHTML = `
                <h3>Vehículo Asignado</h3>
                <p><strong>Placa:</strong> ${vehiculo.placa}</p>
                <p><strong>Modelo:</strong> ${vehiculo.modelo}</p>
                <p><strong>Marca:</strong> ${vehiculo.marca}</p>
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
    } catch (err) {
        document.getElementById('cantidad-paquetes').textContent = '0';
    }

    document.getElementById('generar-viajes-btn').addEventListener('click', () => {
        document.getElementById('contenedor-paquetes').style.display = 'flex';
        document.getElementById('update-data').style.display = 'none';
        document.getElementById('contenedor-form-cambio-vehiculo').style.display = 'none';
        document.getElementById('main-sections').style.display = 'none';
        document.getElementById('resumen-indiv').style.display = 'none';

        mostrarSeleccionPaquetes(paquetes, tipoPlaca);
    });
});

function mostrarSeleccionPaquetes(paquetes, tipoPlaca) {
    const limitesPorTipo = {
        'MTO': 5,
        'CAR': 7,
        'CAM': 10, 
    };
    const limite = limitesPorTipo[tipoPlaca] || 5;
    console.log(`Límite de paquetes para tipo de placa ${tipoPlaca}: ${limite}`);
    Swal.fire({
        title: "Seleccionar Paquetes",
        text: "Selecciona hasta " + limite + " paquetes para generar un viaje.",
        icon: "info",
        confirmButtonText: "Continuar",
    })
    
    let contenedor = document.getElementById('seleccion-paquetes');
    if (contenedor) contenedor.remove();

    contenedor = document.createElement('div');
    
    contenedor.id = 'seleccion-paquetes';

    const contenedorPaquetes = document.getElementById('contenedor-paquetes');

    const seleccionados = new Set();

    paquetes.forEach(paquete => {
        let telefono = paquete.cliente_telefono || '';
        if (telefono.startsWith('0')) {
            telefono = '58' + telefono.slice(1);
        }

        const div = document.createElement('div');
        div.className = "paquete-card"
        div.innerHTML = `
            <input type="checkbox" class="paquete-checkbox" value="${paquete.id_paquete}">
            <strong>Código:</strong> ${paquete.id_paquete}<br>
            <strong>Cliente:</strong> ${paquete.cliente_nombre1} ${paquete.cliente_apellido1}<br>
            <strong>Teléfono:</strong> ${telefono || 'No disponible'}<br>
            <strong>Dirección:</strong> ${paquete.sector}, ${paquete.calle}, Casa ${paquete.numero_casa}<br>
            <strong>Referencia:</strong> ${paquete.referencia || ''}<br>
        `;
        contenedor.appendChild(div);
    });

    const btnGenerar = document.createElement('button');
    btnGenerar.textContent = 'Confirmar viaje';
    btnGenerar.id = 'boton-confirmar'
    btnGenerar.disabled = true;
    contenedor.appendChild(btnGenerar);

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.id = 'boton-cancelar'
    contenedor.appendChild(btnCancelar);

    contenedorPaquetes.appendChild(contenedor);

    const checkboxes = contenedor.querySelectorAll('.paquete-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            if (this.checked) {
                if (seleccionados.size >= limite) {
                    this.checked = false;
                    Swal.fire({
                        title: "Límite alcanzado",
                        text: `Solo puedes seleccionar hasta ${limite} paquetes para este vehículo.`,
                        icon: "warning",
                    });
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
        const seleccionadosArray = Array.from(seleccionados).map(id =>
            paquetes.find(p => p.id_paquete == id)
        );
        const confirmacion = await Swal.fire({
            title: "Confirmar viaje",
            text: `¿Estás seguro de que deseas generar un viaje con ${seleccionadosArray.length} paquetes?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, generar viaje",
            cancelButtonText: "Cancelar"
        }).then(result => result.isConfirmed);
        if (!confirmacion) return;
        document.getElementById('nav-bar').style.display = 'block';
        document.getElementById('main-sections').style.display = 'none';
        generarRuta(seleccionadosArray);
        contenedor.remove();
    });

    btnCancelar.addEventListener('click', () => {
        contenedor.remove();
        document.getElementById('main-sections').style.display = 'block';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnActualizar = document.getElementById('actualizar-datos-btn');
    btnActualizar.addEventListener('click', mostrarFormularioActualizar);
});

function mostrarFormularioActualizar() {
    document.getElementById('update-data').style.display = 'flex';
    document.getElementById('main-sections').style.display = 'none';
    document.getElementById('contenedor-form-cambio-vehiculo').style.display = 'none';
    document.getElementById('contenedor-paquetes').style.display = 'none';
    document.getElementById('resumen-indiv').style.display = 'none';

    if (document.getElementById('form-actualizar-datos')) return;

    const updateDiv= document.getElementById('update-data');
    const form = document.createElement('form');
    form.id = 'form-actualizar-datos';
    form.innerHTML = `
        <h3>Actualizar mis datos</h3>
        <hr>
        <select name="campo" required>
            <option value="">Selecciona un campo</option>
            <option value="nombre1">Primer Nombre</option>
            <option value="nombre2">Segundo Nombre</option>
            <option value="apellido1">Primer Apellido</option>
            <option value="apellido2">Segundo Apellido</option>
            <option value="telefono">Teléfono</option>
            <option value="correo">Correo</option>
        </select>
        <input type="text" name="valor" placeholder="Nuevo valor" required>
        <button type="submit">Guardar</button>
        <button type="button" id="cancelar-actualizar">Cancelar</button>
    `;
    updateDiv.appendChild(form);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const campo = form.campo.value;
        const valor = form.valor.value;
        if (!campo || !valor) {
            Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos.",
                icon: "warning",
            });
            return;
        }
        try {
            const res = await fetch('/api/empleados/updateInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campo, valor })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                    title: "Datos actualizados",
                    icon: "success",
                });
                form.remove();
                location.reload();
            } else {
                Swal.fire({
                    title: "Error al actualizar",
                    text: data.error || 'Error al actualizar los datos',
                    icon: "error",
                });
            }
        } catch {
            Swal.fire({
                title: "Error de conexión",
                text: 'No se pudo conectar al servidor',
                icon: "error",
            });
        }
    });

    form.querySelector('#cancelar-actualizar').addEventListener('click', () => {
        form.remove();
        document.getElementById('main-sections').style.display = 'block';
        document.getElementById('info-repartidor').style.display = 'block';
        document.getElementById('info-vehiculo').style.display = 'block';
        document.getElementById('paquetes-contenedor').style.display = 'block';
    });
}

document.getElementById('solicitar-cambio-vehiculo-btn').addEventListener('click', async function() {;
    document.getElementById('main-sections').style.display = 'none';
    document.getElementById('contenedor-form-cambio-vehiculo').style.display = 'flex';
    document.getElementById('update-data').style.display = 'none';
    document.getElementById('resumen-indiv').style.display = 'none';



    const seleccionPaquetes = document.getElementById('seleccion-paquetes');
    if (seleccionPaquetes) seleccionPaquetes.remove();

    const solicitudContainer = document.getElementById('contenedor-form-cambio-vehiculo');

    const contenedor= document.createElement('div');
    contenedor.id = 'form-cambio-vehiculo';
    const existente = document.getElementById('form-cambio-vehiculo');
    if (existente) existente.remove();

    contenedor.innerHTML = `
        <h3>Solicitar cambio de vehículo</h3>
        <hr>
        <select id="vehiculo-nuevo" required>
            <option value="">Seleccione un vehículo</option>
        </select>
        <button id="enviar-solicitud-cambio">Enviar solicitud</button>
        <button id="cancelar-solicitud-cambio">Cancelar</button>
    `;

    solicitudContainer.appendChild(contenedor);

    const res = await fetch('/api/admin/vehiculos');
    const vehiculos = await res.json();
    const select = document.getElementById('vehiculo-nuevo');
    vehiculos.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id_vehiculo;
        opt.textContent = `${v.placa} - ${v.marca} ${v.modelo}`;
        select.appendChild(opt);
    });

    document.getElementById('enviar-solicitud-cambio').onclick = async function() {
        const id_vehiculo = select.value;
        console.log('ID Vehículo seleccionado:', id_vehiculo);
        if (!id_vehiculo){
            Swal.fire({
                title: "Seleccione un vehículo",
                text: "Por favor, seleccione un vehículo para solicitar el cambio.",
                icon: "warning",
            });
        } 
        const res = await fetch('/api/empleados/solicitarCambioVehiculo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id_vehiculo: id_vehiculo})
        });
        const data = await res.json();
        if (res.ok) {
            Swal.fire({
                title: "Solicitud enviada",
                text: "Su solicitud de cambio de vehículo ha sido enviada exitosamente.",
                icon: "success",
                confirmButtonText: "Aceptar" 
            }).then(result => {
                window.location.href = '/home';
            });
        } else {
            Swal.fire({
                title: "Error al enviar solicitud",
                text: data.error || 'Error al enviar la solicitud de cambio de vehículo',
                icon: "error",
            });
        }
    };

    document.getElementById('cancelar-solicitud-cambio').onclick = function() {
        const contenedor = document.getElementById('form-cambio-vehiculo');
        if (contenedor) contenedor.remove();
        document.getElementById('main-sections').style.display = 'block';
    };
});

document.getElementById('resumen-individual-btn').addEventListener('click', async () => {
    document.getElementById('contenedor-paquetes').style.display = 'none';
    document.getElementById('update-data').style.display = 'none';
    document.getElementById('contenedor-form-cambio-vehiculo').style.display = 'none';
    document.getElementById('main-sections').style.display = 'none';
    document.getElementById('resumen-indiv').style.display = 'flex';

    const btnResumen = document.getElementById('generar-resumen-btn');
    btnResumen.onclick = async function () {
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        if (!fechaInicio || !fechaFin) {
            Swal.fire("Fechas requeridas", "Debes seleccionar la fecha de inicio y fin.", "warning");
            return;
        }
        try {
            const res = await fetch('/api/reporte/reporteIndividual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fechaInicio, fechaFin })
            });
            if (!res.ok) throw new Error('No se pudo generar el reporte');
            Swal.fire({
                title: "Reporte generado",
                text: "Comenzando descarga...",
                icon: "success",
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_individual_${fechaInicio}_al_${fechaFin}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            Swal.fire("Error", "No se pudo generar el reporte.", "error");
        }
    };
});

const contenedor = document.getElementById('paquetes-viaje');
if (contenedor) {
  contenedor.style.display = '';
}

const lista = document.getElementById('lista-paquetes');
if (lista) {
  lista.innerHTML = '';
}

paquetes.forEach((p, i) => {
  const tel = p.cliente_telefono.replace(/^0/, '58');
  const div = document.createElement('div');
  div.className = 'paquete-item';
  div.innerHTML = `
    <strong>#${i + 1}</strong> ${p.cliente_nombre1} ${p.cliente_apellido1} - ${tel}
    <button class="entregado-btn" data-id="${p.id_paquete}">Entregar</button>
    <button onclick="window.open('https://wa.me/${tel}')">Contactar</button>
    <input type="text" id="obs-${p.id_paquete}" placeholder="Observación"/>
    <hr>
  `;
  lista.appendChild(div);
});

const info = document.getElementById('info-container');
if (info) {
  info.style.display = 'none';
}








