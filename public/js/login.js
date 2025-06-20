document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const data = {
        nombre_usuario: form.nombre_usuario.value,
        contraseña: form.contraseña.value
    };

    try {
        const response = await fetch('/api/empleados/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.id_empleado) {
                if(result.rol === 'administrador') {
                    window.location.href = '/admin';
                }
                else{
                    window.location.href = '/home';
                }
            } else {
                Swal.fire({
                                    title: "Usuario o contraseña incorrectos",
                                    icon: "error",
                                    });;
            }
            
        } else {
            Swal.fire({
                title: "Error de inicio de sesión",
                text: result.error || 'Error al iniciar sesión',
                icon: "error",
            });
        }
    } catch (err) {
        Swal.fire({
            title: "Error de conexión",
            text: 'No se pudo conectar al servidor',
            icon: "error",
        });
    }
});

document.getElementById('mostrarContrasena').addEventListener('change', function() {
    const passInput = document.querySelector('input[name="contraseña"]');
    if (this.checked) {
        passInput.type = 'text';
    } else {
        passInput.type = 'password';
    }
});