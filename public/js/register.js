document.addEventListener('DOMContentLoaded', async () => {
    
    const selectPregunta = document.getElementById('pregunta');
    try {
        const res = await fetch('/api/empleados/preguntasSeguridad');
        const preguntas = await res.json();
        // Supón que preguntas es un array de objetos con {id, pregunta}
        preguntas.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id; // <-- Debe ser el id real de la pregunta
            option.textContent = p.pregunta;
            selectPregunta.appendChild(option);
        });
    } catch (err) {
        alert('Error al cargar preguntas de seguridad');
        console.error(err);
    }

    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        if (formData.get('respuesta') !== formData.get('respuesta2')) {
            alert('Las respuestas de seguridad no coinciden.');
            return;
        }

        if (formData.get('contraseña') !== formData.get('contraseña2')) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const userData = {
            id_empleado: formData.get('id_empleado'),
            nombre_usuario: formData.get('nombre_usuario'),
            contraseña: formData.get('contraseña')
        };
        const preguntaData = {
            id_empleado: formData.get('id_empleado'),
            id_pregunta: formData.get('id_pregunta'),
            respuesta: formData.get('respuesta')
        };

        try {
            const resUser = await fetch('/api/empleados/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const resultUser = await resUser.json();

            if (!resUser.ok) {
                alert(resultUser.error || 'Error al registrar usuario');
                return;
            }

            const resPregunta = await fetch('/api/empleados/savePreguntaRespuesta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preguntaData)
            });
            const resultPregunta = await resPregunta.json();

            if (!resPregunta.ok) {
                alert(resultPregunta.error || 'Error al guardar pregunta de seguridad');
                return;
            }

            alert('Usuario registrado exitosamente');
            window.location.href = '/login';
        } catch (err) {
            alert('Error de conexión');
        }
    });
});