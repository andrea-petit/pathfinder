document.addEventListener('DOMContentLoaded', () => {
    const empleadosContainer = document.getElementById('empleados-container');
    const paquetesContainer = document.getElementById('paquetes-container');
    const reportesContainer = document.getElementById('reportes-container');
    const vehiculosContainer = document.getElementById('vehiculos-container');
    const empleadosButton = document.getElementById('empleados-button');

    const empleadosDiv = document.createElement('div');
    empleadosDiv.id = 'empleados-div';
    empleadosContainer.appendChild(empleadosDiv);

    const agregarEmpleadoButton = document.createElement('button');
    agregarEmpleadoButton.id = 'agregar-empleado-button';
    agregarEmpleadoButton.textContent = 'Agregar Empleado';
    empleadosContainer.appendChild(agregarEmpleadoButton);

    const volverButton = document.createElement('button');
    volverButton.textContent = 'Volver';
    volverButton.style.display = 'none';
    empleadosContainer.appendChild(volverButton);

    empleadosContainer.style.display = 'block';
    paquetesContainer.style.display = 'none';
    reportesContainer.style.display = 'none';
    vehiculosContainer.style.display = 'none';

    empleadosButton.addEventListener('click', () => {
        empleadosContainer.style.display = 'block';
        paquetesContainer.style.display = 'none';
        reportesContainer.style.display = 'none';
        vehiculosContainer.style.display = 'none';
        mostrarListaEmpleados();
    });
+
    agregarEmpleadoButton.addEventListener('click', () => {
        mostrarFormularioEmpleado();
    });

    volverButton.addEventListener('click', () => {
        mostrarListaEmpleados();
    });

    async function mostrarListaEmpleados() {
        empleadosDiv.innerHTML = '<h2>Lista de Empleados</h2>';
        agregarEmpleadoButton.style.display = 'inline-block';
        volverButton.style.display = 'none';

        try {
            const response = await fetch('api/admin/getEmpleados');
            if (!response.ok) throw new Error('Network response was not ok');
            const empleados = await response.json();
            empleados.forEach(empleado => {
                if (empleado.id_empleado !== 1) {
                    const card = document.createElement('div');
                    card.style.border = '1px solid #ccc';
                    card.style.borderRadius = '8px';
                    card.style.padding = '16px';
                    card.style.margin = '12px 0';
                    card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                    card.style.background = '#fafbfc';

                    card.innerHTML = `
                        <strong>Cédula:</strong> ${empleado.id_empleado}<br>
                        <strong>Nombre:</strong> ${empleado.nombre1} ${empleado.nombre2 || ''}<br>
                        <strong>Apellido:</strong> ${empleado.apellido1} ${empleado.apellido2 || ''}<br>
                        <strong>Teléfono:</strong> ${empleado.telefono}<br>
                        <strong>Correo:</strong> ${empleado.correo}<br>
                        <strong>Vehículo:</strong> ${empleado.placa ? `
                            <br>&nbsp;&nbsp;<strong>Placa:</strong> ${empleado.placa}
                            <br>&nbsp;&nbsp;<strong>Marca:</strong> ${empleado.marca}
                            <br>&nbsp;&nbsp;<strong>Modelo:</strong> ${empleado.modelo}
                        ` : 'Sin asignar'}
                        <br>
                        <button class="btn-actualizar" data-id="${empleado.id_empleado}">Actualizar</button>
                        <button class="btn-borrar" data-id="${empleado.id_empleado}">Borrar</button>
                        <div class="form-actualizar-container"></div>
                    `;

                    card.querySelector('.btn-borrar').addEventListener('click', async function() {
                        if (confirm('¿Seguro que deseas borrar este empleado?')) {
                            const res = await fetch(`/api/admin/deleteEmpleado/${empleado.id_empleado}`, { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) {
                                card.remove();
                                alert('Empleado eliminado');
                            } else {
                                alert(data.error || 'Error al eliminar');
                            }
                        }
                    });

                    card.querySelector('.btn-actualizar').addEventListener('click', function() {
                        const id_empleado = this.getAttribute('data-id');
                        const formContainer = card.querySelector('.form-actualizar-container');

                        if (formContainer.innerHTML) {
                            formContainer.innerHTML = '';
                            return;
                        }

                        formContainer.innerHTML = `
                            <form class="form-actualizar">
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
                            </form>
                        `;
                        const form = formContainer.querySelector('.form-actualizar');
                        form.addEventListener('submit', async function(e) {
                            e.preventDefault();
                            const campo = form.campo.value;
                            const valor = form.valor.value;
                            if (!campo || !valor) {
                                alert('Completa todos los campos.');
                                return;
                            }
                            const res = await fetch(`/api/admin/updateEmpleado/${id_empleado}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ campo, valor })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                alert('Empleado actualizado correctamente');
                                formContainer.innerHTML = '';
                                mostrarListaEmpleados();
                            } else {
                                alert(data.error || 'Error al actualizar');
                            }
                        });
                    });

                    empleadosDiv.appendChild(card);
                }
            });
        } catch (error) {
            empleadosDiv.innerHTML += '<p>Error al cargar empleados.</p>';
            console.error('Error fetching empleados:', error);
        }
    }

    function mostrarFormularioEmpleado(empleado = null) {
        empleadosDiv.innerHTML = `
            <h2>${empleado ? 'Actualizar' : 'Agregar'} Empleado</h2>
            <form id="empleado-form">
                <label for="id_empleado">Cedula de Identidad:</label>
                <input type="text" id="id_empleado" name="id_empleado" required value="${empleado ? empleado.id_empleado : ''}" ${empleado ? 'readonly' : ''}>
                <label for="nombre1">Primer nombre:</label>
                <input type="text" id="nombre1" name="nombre1" required value="${empleado ? empleado.nombre1 : ''}">
                <label for="nombre2">Segundo Nombre:</label>
                <input type="text" id="nombre2" name="nombre2" value="${empleado ? empleado.nombre2 || '' : ''}">
                <label for="apellido1">Primer Apellido:</label>
                <input type="text" id="apellido1" name="apellido1" required value="${empleado ? empleado.apellido1 : ''}">
                <label for="apellido2">Segundo Apellido:</label>
                <input type="text" id="apellido2" name="apellido2" value="${empleado ? empleado.apellido2 || '' : ''}">
                <label for="telefono">Telefono:</label>
                <input type="tel" id="telefono" name="telefono" required value="${empleado ? empleado.telefono : ''}">
                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required value="${empleado ? empleado.correo : ''}">
                <label for="id_vehiculo">Vehículo (opcional):</label>
                <select id="id_vehiculo" name="id_vehiculo">
                </select>
                <button type="submit">${empleado ? 'Actualizar' : 'Agregar'} Empleado</button>
            </form>
        `;
        agregarEmpleadoButton.style.display = 'none';
        volverButton.style.display = 'inline-block';

        fetch('/api/admin/vehiculos')
            .then(res => res.json())
            .then(vehiculos => {
                const selectVehiculo = document.getElementById('id_vehiculo');
                vehiculos.forEach(v => {
                    const option = document.createElement('option');
                    option.value = v.id_vehiculo;
                    option.textContent = `${v.placa} - ${v.marca} ${v.modelo}`;
                    selectVehiculo.appendChild(option);
                });
            });

        const form = document.getElementById('empleado-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const empleadoData = {
                id_empleado: formData.get('id_empleado'),
                nombre1: formData.get('nombre1'),
                nombre2: formData.get('nombre2'),
                apellido1: formData.get('apellido1'),
                apellido2: formData.get('apellido2'),
                telefono: formData.get('telefono'),
                correo: formData.get('correo')
            };
            const id_vehiculo = formData.get('id_vehiculo');

            try {
                const response = await fetch('/api/admin/empleados', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(empleadoData)
                });
                const result = await response.json();

                if (!response.ok) {
                    alert(result.error || 'Error al registrar empleado');
                    return;
                }

                if (id_vehiculo) {
                    const asignarRes = await fetch('/api/admin/asignarVehiculo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleadoData.id_empleado,
                            id_vehiculo: id_vehiculo
                        })
                    });
                    const asignarResult = await asignarRes.json();
                    if (!asignarRes.ok) {
                        alert(asignarResult.error || 'Empleado registrado, pero error al asignar vehículo');
                        return;
                    }
                }

                alert('Empleado registrado correctamente');
                mostrarListaEmpleados();
            } catch (error) {
                alert('Error al agregar empleado');
            }
        });
    }

    mostrarListaEmpleados();
});