document.addEventListener('DOMContentLoaded', () => {
    // Detectar qué formulario tenemos
    const adminLoginForm = document.getElementById('admin-login-form');
    const mayoristasLoginForm = document.getElementById('login-form');
    const isAdminLogin = window.location.pathname.includes('admin_login.html');

    // Seleccionar el formulario y mensaje de error correspondiente
    const loginForm = isAdminLogin ? adminLoginForm : mayoristasLoginForm;
    const errorMessage = document.getElementById('error-message');

    if (!loginForm || !errorMessage) {
        console.error('Elementos del formulario no encontrados');
        return;
    }

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
            const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            });

            if (loginError) {
                console.error('Error de autenticación:', {
                    code: loginError.code,
                    message: loginError.message,
                    details: loginError.details
                });
                throw new Error('auth_error');
            }

            if (!authData.user) {
                console.error('No se recibieron datos de usuario después del login');
                throw new Error('auth_error');
            }

            if (isAdminLogin) {
                // Si estamos en el login de admin, verificar rol
                const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
                
                if (adminCheckError) {
                    console.error('Error al verificar rol de admin:', {
                        code: adminCheckError.code,
                        message: adminCheckError.message,
                        details: adminCheckError.details
                    });
                    throw new Error('role_check_error');
                }

                if (!isAdmin) {
                    console.error('Usuario no es admin');
                    throw new Error('not_admin');
                }

                window.location.href = 'admin.html';
            } else {
                // Para mayoristas, verificar que exista en la tabla de mayoristas
                const { data: mayorista, error: mayoristaError } = await supabase
                    .from('mayoristas')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (mayoristaError) {
                    console.error('Error al verificar mayorista:', {
                        code: mayoristaError.code,
                        message: mayoristaError.message,
                        details: mayoristaError.details
                    });
                    throw new Error('mayorista_check_error');
                }

                window.location.href = 'index.html';
            }

        } catch (error) {
            // Mensajes amigables para el usuario según el tipo de error
            let userMessage = 'Lo sentimos, ha ocurrido un error. Por favor, intenta nuevamente.';
            
            switch (error.message) {
                case 'auth_error':
                    userMessage = 'El email o la contraseña son incorrectos.';
                    break;
                case 'role_check_error':
                    userMessage = 'No se pudo verificar tu rol de usuario. Por favor, intenta nuevamente.';
                    break;
                case 'not_admin':
                    userMessage = 'No tienes permisos de administrador.';
                    break;
                case 'mayorista_check_error':
                    userMessage = 'Error al verificar cuenta de mayorista.';
                    break;
                default:
                    console.error('Error no manejado:', error);
            }

            errorMessage.textContent = userMessage;
            errorMessage.style.display = 'block';
        }
    });
});

