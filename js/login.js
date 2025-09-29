document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    const errorMessage = document.getElementById('error-message');
    
    // Muestra un mensaje si el usuario fue redirigido por no tener permisos
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'auth') {
        errorMessage.textContent = 'No tienes permisos para acceder al panel.';
        errorMessage.style.display = 'block';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Intenta iniciar sesión
            const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (loginError) {
                console.error('Error de autenticación:', {
                    code: loginError.code,
                    message: loginError.message,
                    details: loginError.details
                });
                throw new Error('auth_error');
            }
            
            // Verificar si el usuario es admin
            const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
            if (adminCheckError) {
                console.error('Error al verificar rol de admin:', {
                    code: adminCheckError.code,
                    message: adminCheckError.message,
                    details: adminCheckError.details
                });
                throw new Error('role_check_error');
            }

            // Redirigir según el rol
            if (isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }

        } catch (error) {
            // Mensajes amigables para el usuario según el tipo de error
            let userMessage = 'Lo sentimos, ha ocurrido un error. Por favor, intenta nuevamente.';
            
            if (error.message === 'auth_error') {
                userMessage = 'El email o la contraseña son incorrectos.';
            } else if (error.message === 'role_check_error') {
                userMessage = 'No se pudo verificar tu rol de usuario. Por favor, intenta nuevamente.';
            }

            errorMessage.textContent = userMessage;
            errorMessage.style.display = 'block';
        }
    });
});

