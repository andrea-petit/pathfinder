document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id_empleado = form.id_empleado.value.trim();
        const nombre_usuario = form.nombre_usuario.value.trim();
        const contraseña = form.contraseña.value;
        const contraseña2 = form.contraseña2.value;

        if (contraseña !== contraseña2) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        try {
            const response = await fetch('/api/empleados/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_empleado, nombre_usuario, contraseña })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Usuario registrado exitosamente');
                window.location.href = '/login';
            } else {
                if (result.error) {
                    alert(result.error);
                } else {
                    alert('Error al registrar usuario');
                }
            }
        } catch (err) {
            alert('Error de conexión con el servidor');
        }
    });

});