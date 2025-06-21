document.getElementById('recuperar-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '';
    try {
        const res = await fetch('/api/empleados/getPreguntaSeguridad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario: usuario })
        });
        const data = await res.json();
        if (res.ok && data) {
            document.getElementById('pregunta').textContent = data;
            document.getElementById('pregunta-seguridad').style.display = 'block';
            document.getElementById('recuperar-form').style.display = 'none';
            window.USUARIO_RECUP = usuario;
        } else {
            mensaje.textContent = data.error || 'Usuario no encontrado.';
        }
    } catch {
        mensaje.textContent = 'Error de conexión.';
    }
});

document.getElementById('verificar-btn').addEventListener('click', async function() {
    const respuesta = document.getElementById('respuesta').value;
    const usuario = window.USUARIO_RECUP;
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '';
    try {
        const res = await fetch('/api/empleados/verificarRespuesta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario: usuario, respuesta })
        });
        const data = await res.json();
        if (res.ok && data.correcto) {
            document.getElementById('nueva-clave').style.display = 'block';
            document.getElementById('pregunta-seguridad').style.display = 'none';
        } else {
            mensaje.textContent = data.error || 'Respuesta incorrecta.';
        }
    } catch {
        mensaje.textContent = 'Error de conexión.';
    }
});

document.getElementById('cambiar-btn').addEventListener('click', async function() {
    const clave = document.getElementById('clave').value;
    const clave2 = document.getElementById('clave2').value;
    const usuario = window.USUARIO_RECUP;
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '';
    if (!clave || !clave2 || !usuario) {
        mensaje.textContent = 'Completa todos los campos.';
        return;
    }
    if (clave !== clave2) {
        mensaje.textContent = 'Las contraseñas no coinciden.';
        return;
    }
    try {
        const res = await fetch('/api/empleados/cambiarPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario: usuario, nueva_contraseña: clave })
        });
        const data = await res.json();
        if (res.ok) {
            Swal.fire({
                title: "Contraseña cambiada exitosamente",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => {
                window.location.href = '/login';
            });
        } else {
            mensaje.textContent = data.error || 'No se pudo cambiar la contraseña.';
        }
    } catch {
        mensaje.textContent = 'Error de conexión.';
    }
});