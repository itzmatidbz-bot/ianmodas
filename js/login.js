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

    // --- Función helper para crear registro de mayorista ---
    const createMayoristaRecord = async (user) => {
        try {
            const nombreEmpresa = user.user_metadata?.nombre_empresa || user.email?.split('@')[0] || 'Mi Empresa';
            
            const { error: createError } = await supabase
                .from('mayoristas')
                .insert([{
                    id: user.id,
                    nombre_empresa: nombreEmpresa
                }]);

            if (createError) {
                console.warn('No se pudo crear registro de mayorista:', createError);
                // No lanzar error, permitir login igual
            } else {
                console.log('Registro de mayorista creado exitosamente');
            }
        } catch (error) {
            console.warn('Error al crear mayorista:', error);
            // No lanzar error, permitir login igual
        }
    };

    // --- Manejar confirmación de email desde URL ---
    const handleEmailConfirmation = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const tokenType = urlParams.get('token_type');

        if (accessToken && refreshToken) {
            try {
                // Establecer la sesión con los tokens de la URL
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                if (error) throw error;

                if (data.user) {
                    // Intentar crear el registro de mayorista
                    await createMayoristaRecord(data.user);

                    const nombreEmpresa = data.user.user_metadata?.nombre_empresa || 'Mi Empresa';
                    const nombreUsuario = data.user.email?.split('@')[0] || 'Usuario';

                    // Mostrar mensaje de bienvenida y redirigir
                    successMessage.innerHTML = `
                        <strong>¡Cuenta confirmada exitosamente!</strong><br>
                        Bienvenido/a ${nombreUsuario} de ${nombreEmpresa}<br>
                        Redirigiendo al catálogo...
                    `;
                    successMessage.style.display = 'block';

                    setTimeout(() => {
                        window.location.href = 'index.html#productos';
                    }, 2000);
                    return;
                }
            } catch (error) {
                console.error('Error al confirmar email:', error);
                errorMessage.textContent = 'Error al confirmar tu cuenta. Por favor, intenta iniciar sesión manualmente.';
                errorMessage.style.display = 'block';
            }
        }
    };

    // Ejecutar la verificación de confirmación al cargar la página
    await handleEmailConfirmation();

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

            // Si no es admin, verificar si es mayorista (con manejo de errores mejorado)
            let mayorista = null;
            let nombreEmpresa = 'Mayorista';

            try {
                const { data: mayoristaData, error: mayoristaError } = await supabase
                    .from('mayoristas')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (mayoristaError) {
                    console.warn('Error al consultar mayorista:', mayoristaError);
                    
                    // Si es error 500 (servidor) o tabla no existe, crear mayorista igual
                    if (mayoristaError.code === 'PGRST116' || mayoristaError.message?.includes('500') || !mayoristaError.code) {
                        console.log('Mayorista no encontrado, creando nuevo registro...');
                        // Intentar crear mayorista
                        await createMayoristaRecord(authData.user);
                    } else {
                        // Otros errores, pero permitir login igual
                        console.warn('Error de BD, permitiendo login sin verificar mayorista');
                    }
                } else {
                    mayorista = mayoristaData;
                    nombreEmpresa = mayorista?.nombre_empresa || 'Mayorista';
                }
            } catch (error) {
                console.warn('Error general al manejar mayorista:', error);
                // Permitir login aunque haya error con mayoristas
            }

            // Obtener nombre de empresa de metadata si no hay mayorista
            if (!mayorista) {
                nombreEmpresa = authData.user.user_metadata?.nombre_empresa || 
                              authData.user.email?.split('@')[0] || 'Mayorista';
            }

            // Obtener nombre del email para mostrar junto con la empresa
            const nombreUsuario = authData.user.email?.split('@')[0] || 'Usuario';
            
            successMessage.textContent = `¡Bienvenido/a ${nombreUsuario} de ${nombreEmpresa}!`;
            successMessage.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'index.html#productos'; // Redirigir al catálogo
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
                    userMessage = 'Error de conexión con la base de datos. Intenta nuevamente.';
                    break;
                case 'mayorista_create_error':
                    userMessage = 'Problema técnico. Tu cuenta está activa, intenta nuevamente.';
                    break;
                case 'not_mayorista':
                    userMessage = 'Problema con tu cuenta de mayorista. Contacta al administrador.';
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

                // 1. Crear el usuario en auth (con confirmación por email)
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nombre_empresa: nombreEmpresa
                        }
                    }
                });

                if (signUpError) {
                    console.error('Error en signUp:', signUpError);
                    if (signUpError.message.includes('already registered')) {
                        throw new Error('Este email ya está registrado.');
                    }
                    throw signUpError;
                }

                if (!data?.user?.id) {
                    throw new Error('No se pudo crear el usuario');
                }

                // 2. Mostrar mensaje de confirmación (siempre necesario)
                registerSuccessMessage.innerHTML = `
                    <strong>¡Registro exitoso!</strong><br>
                    📧 Te hemos enviado un correo de confirmación a <strong>${email}</strong><br>
                    🔗 Haz clic en el enlace del correo para activar tu cuenta de mayorista<br>
                    ✅ Una vez confirmado, podrás iniciar sesión y acceder al catálogo exclusivo
                `;
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