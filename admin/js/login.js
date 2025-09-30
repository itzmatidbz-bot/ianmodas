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
            // Simplemente intenta iniciar sesión
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            // Si el login es exitoso, redirige al panel.
            // El panel se encargará de verificar si es admin.
            window.location.href = 'index.html';

        } catch (error) {
            errorMessage.textContent = 'Email o contraseña incorrectos.';
            errorMessage.style.display = 'block';
        }
    });
});

