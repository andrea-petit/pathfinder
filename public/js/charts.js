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

        const hoy = new Date();
        const fechaFin = hoy.toISOString().slice(0, 10);

        const hace6dias = new Date(hoy);
        hace6dias.setDate(hoy.getDate() - 6);
        const fechaInicio = hace6dias.toISOString().slice(0, 10);

        try {
            const res = await fetch('/api/estadisticas/paquetes/entregados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fechaInicio, fechaFin })
            });

            const data = await res.json();
            console.log('Respuesta del backend:', data);

            const estadisticasContainer = document.getElementById('estadisticas-container');

            const oldP = document.getElementById('info-estadisticas');
            if (oldP) oldP.remove();

            const infoP = document.createElement('p');
            infoP.id = 'info-estadisticas';
            infoP.textContent = `Estadísticas de entrega desde ${fechaInicio} hasta ${fechaFin}`;
            estadisticasContainer.prepend(infoP);

            graficarEntregadosPorEmpleado(data);

            console.log('Datos para la gráfica semanal:', data);
        } catch (err) {
            console.error('Error al obtener datos de paquetes entregados por semana:', err);
        }
    });

    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        return new Date(d.setDate(diff));
    }

    const graficarEntregadosPorEmpleado = (data) => {
        const ctx = document.getElementById('entregadosPorEmpleadoChart').getContext('2d');
        const labels = data.map(item => `${item.nombre1} ${item.apellido1}`);
        const entregados = data.map(item => item.total_entregados);

        const colores = [
            '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#C9CBCF', '#FF6384', '#36A2EB', '#4BC0C0'
        ];
        const backgroundColors = labels.map((_, i) => colores[i % colores.length]);
        const borderColors = backgroundColors.map(c => c);

        if (window.entregadosChart) window.entregadosChart.destroy();

        window.entregadosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Paquetes Entregados',
                    data: entregados,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.2,        
                    categoryPercentage: 0.5   
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Entregas por Empleado',
                        font: { size: 18 }
                    }
                },
                scales: {
                    x: {
                        ticks: { font: { size: 14 } }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { size: 14 } }
                    }
                }
            }
        });
    }



});

