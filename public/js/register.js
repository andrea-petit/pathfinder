document.addEventListener('DOMContentLoaded', async () => {
    
    const selectPregunta = document.getElementById('pregunta');
    try {
        const res = await fetch('/api/empleados/preguntasSeguridad');
        const preguntas = await res.json();
        preguntas.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.pregunta;
            selectPregunta.appendChild(option);
        });
    } catch (err) {
        Swal.fire({
                    title: "Error al cargar preguntas de seguridad",
                    icon: "error",
                    });
        console.error(err);
    }

    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        if (formData.get('respuesta') !== formData.get('respuesta2')) {
            Swal.fire({
                    title: "Las respuestas de seguridad no coinciden",
                    icon: "error",
                    });
            return;
        }

        if (formData.get('contraseña') !== formData.get('contraseña2')) {
            Swal.fire({
                    title: "Las contraseñas no coinciden",
                    icon: "error",
                    });
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
                Swal.fire({
                    title: "Error al registrar usuario",
                    text: resultUser.error || 'Error al registrar el usuario',
                    icon: "error",
                });
                return;
            }

            const resPregunta = await fetch('/api/empleados/savePreguntaRespuesta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preguntaData)
            });
            const resultPregunta = await resPregunta.json();

            if (!resPregunta.ok) {
                Swal.fire({
                    title: "Error al guardar pregunta de seguridad",
                    text: resultPregunta.error || 'Error al guardar la pregunta de seguridad',
                    icon: "error",
                });
                return;
            }

            Swal.fire({
                    title: "Registro exitoso!",
                    icon: "success",
                    confirmButtonText: 'Aceptar'
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.href = '/login';
                }
            })
        } catch (err) {
            Swal.fire({
                title: "Error de conexión",
                text: 'No se pudo conectar al servidor',
                icon: "error",
            });
            console.error(err);
        }
    });
});