document.addEventListener('DOMContentLoaded', async () => {
    // --- Selectores del DOM ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerSuccessMessage = document.getElementById('register-success-message');

    if (!loginForm) return;

    // Toggle entre formularios
    if (showRegisterLink && showLoginLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            showRegisterLink.parentElement.style.display = 'none';
            registerForm.style.display = 'flex';
            showLoginLink.parentElement.style.display = 'block';
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            showLoginLink.parentElement.style.display = 'none';
            loginForm.style.display = 'flex';
            showRegisterLink.parentElement.style.display = 'block';
        });
    }

    // Manejo del Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Intenta iniciar sesión
            const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            });

            if (loginError) {
                console.error('Error de autenticación:', loginError);
                throw new Error('auth_error');
            }

            if (!authData.user) {
                console.error('No se recibieron datos de usuario después del login');
                throw new Error('auth_error');
            }

            // Verificar si el usuario es admin
            const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');

            if (adminCheckError) {
                console.error('Error al verificar rol de admin:', adminCheckError);
                throw new Error('role_check_error');
            }

            // Si es admin, redirigir al panel
            if (isAdmin) {
                successMessage.textContent = '¡Bienvenido/a Administrador/a!';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
                return;
            }

            // Si no es admin, verificar si es mayorista
            const { data: mayorista, error: mayoristaError } = await supabase
                .from('mayoristas')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (mayoristaError) {
                console.error('Error al verificar mayorista:', mayoristaError);
                throw new Error('mayorista_check_error');
            }

            if (!mayorista) {
                throw new Error('not_mayorista');
            }

            successMessage.textContent = '¡Bienvenido/a!';
            successMessage.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

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
                case 'mayorista_check_error':
                    userMessage = 'Error al verificar cuenta de mayorista.';
                    break;
                case 'not_mayorista':
                    userMessage = 'No tienes una cuenta de mayorista registrada.';
                    break;
                default:
                    console.error('Error no manejado:', error);
            }

            errorMessage.textContent = userMessage;
            errorMessage.style.display = 'block';
        }
    });

    // Función para deshabilitar el formulario temporalmente
    const disableFormTemporarily = (seconds, errorMsg) => {
        const submitButton = document.getElementById('register-submit-btn');
        submitButton.disabled = true;
        
        let timeLeft = seconds;
        submitButton.textContent = `Espera ${timeLeft} segundos...`;
        
        const timer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitButton.disabled = false;
                submitButton.textContent = 'Registrarme';
                registerErrorMessage.style.display = 'none';
            } else {
                submitButton.textContent = `Espera ${timeLeft} segundos...`;
            }
        }, 1000);

        if (errorMsg) {
            registerErrorMessage.textContent = errorMsg;
            registerErrorMessage.style.display = 'block';
        }
    };

    // Función de validación del formulario
    const validateRegisterForm = (email, password, nombreEmpresa) => {
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        if (!email.includes('@')) {
            throw new Error('Por favor ingresa un email válido');
        }
        if (!nombreEmpresa.trim()) {
            throw new Error('El nombre de la empresa es requerido');
        }
    };

    // Manejar el registro de mayoristas
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = document.getElementById('register-submit-btn');
            if (submitButton.disabled) return;

            registerErrorMessage.style.display = 'none';
            registerSuccessMessage.style.display = 'none';

            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const nombreEmpresa = document.getElementById('register-empresa').value;

            try {
                // Validar el formulario primero
                validateRegisterForm(email, password, nombreEmpresa);

                // 1. Crear el usuario en auth
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nombre_empresa: nombreEmpresa
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (!data?.user?.id) {
                    throw new Error('No se pudo crear el usuario');
                }

                // 2. Crear el registro en la tabla mayoristas
                const { error: mayoristaError } = await supabase
                    .from('mayoristas')
                    .insert([{
                        id: data.user.id,
                        nombre_empresa: nombreEmpresa
                    }]);

                if (mayoristaError) {
                    console.error('Error al crear registro de mayorista:', mayoristaError);
                    let errorMessage = 'Error al registrar la cuenta de mayorista';
                    if (mayoristaError.code === '42501') {
                        errorMessage = 'No tienes permisos para escribir en esta tabla';
                    } else if (mayoristaError.code === '23502') {
                        errorMessage = 'Datos inválidos o incompletos: falta el nombre de la empresa';
                    }
                    throw new Error(errorMessage);
                }

                registerSuccessMessage.textContent = '¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.';
                registerSuccessMessage.style.display = 'block';
                registerForm.reset();

            } catch (error) {
                console.error('Error en registro:', error);
                let errorMsg = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
                
                // Manejar errores específicos primero
                if (error.message === 'La contraseña debe tener al menos 6 caracteres' ||
                    error.message === 'Por favor ingresa un email válido' ||
                    error.message === 'El nombre de la empresa es requerido') {
                    errorMsg = error.message;
                }
                // Manejar errores de Supabase
                else if (error.message && typeof error.message === 'string') {
                    if (error.message.includes('after')) {
                        // Extraer el número de segundos del mensaje de error
                        const seconds = parseInt(error.message.match(/after (\d+) seconds/)?.[1] || '60');
                        disableFormTemporarily(seconds, 'Has realizado demasiados intentos. Por favor espera.');
                        return;
                    } else if (error.message.includes('already registered')) {
                        errorMsg = 'Este email ya está registrado.';
                    } else if (error.message.includes('Invalid email')) {
                        errorMsg = 'El email ingresado no es válido.';
                    } else if (error.message.includes('at least 6 characters')) {
                        errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
                    }
                }

                registerErrorMessage.textContent = errorMsg;
                registerErrorMessage.style.display = 'block';
            }
        });
    }
});