document.addEventListener('DOMContentLoaded', async function () {
    const empleadosBtn = document.getElementById('empleados-button');
    const paquetesBtn = document.getElementById('paquetes-button');
    const reportesBtn = document.getElementById('reportes-button');
    const vehiculosBtn = document.getElementById('vehiculos-button');

    const empleadosContainer = document.getElementById('empleados-container');
    const paquetesContainer = document.getElementById('paquetes-container');
    const reportesContainer = document.getElementById('reportes-container');
    const vehiculosContainer = document.getElementById('vehiculos-container');

    let paquetes;

    function mostrarSeccion(seccion) {
        empleadosContainer.style.display = 'none';
        paquetesContainer.style.display = 'none';
        reportesContainer.style.display = 'none';
        vehiculosContainer.style.display = 'none';
        seccion.style.display = 'block';
    }

    paquetesBtn.addEventListener('click', async function () {
        try {
            const res = await fetch('/api/paquetes/getPaquetes');
            paquetes = await res.json();
            document.getElementById('cantidad-paquetes').textContent = paquetes.length;
        } catch (err) {
            document.getElementById('cantidad-paquetes').textContent = '0';
            console.error('Error al obtener los paquetes:', err);
        }
        mostrarSeccion(paquetesContainer);
    });

});