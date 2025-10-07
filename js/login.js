document.addEventListener("DOMContentLoaded", async () => {
  // --- Selectores del DOM ---
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");
  const registerErrorMessage = document.getElementById(
    "register-error-message",
  );
  const registerSuccessMessage = document.getElementById(
    "register-success-message",
  );

  if (!loginForm) return;

  // --- Función para crear registro en tabla mayoristas (LA OFICIAL) ---
  const createMayorista = async (user) => {
    try {
      const metadata = user.user_metadata || {};

      console.log("🏢 Creando mayorista para:", user.email);

      const mayoristaData = {
        email: user.email,
        nombre: metadata.nombre || user.email?.split("@")[0] || "Sin nombre",
        apellido: metadata.apellido || "Sin apellido",
        rut: metadata.rut || null,
        celular: metadata.celular || null,
        nombre_empresa:
          metadata.nombre_empresa || `${user.email?.split("@")[0]} Empresa`,
        direccion: metadata.direccion || null,
        departamento: metadata.departamento || null,
        agencia_envio: metadata.agencia_envio || null,
        activo: true,
      };

      const { data, error: createError } = await supabase
        .from("mayoristas")
        .insert([mayoristaData])
        .select();

      if (createError) {
        console.warn("Error al crear mayorista:", createError);

        // Intentar actualizar si ya existe (por email único)
        if (createError.code === "23505") {
          console.log("Mayorista ya existe, intentando actualizar...");
          const { error: updateError } = await supabase
            .from("mayoristas")
            .update(mayoristaData)
            .eq("email", user.email);

          if (!updateError) {
            console.log("✅ Mayorista actualizado exitosamente");
          }
        }
      } else {
        console.log("✅ Mayorista creado exitosamente:", data);

        // 📧 ENVIAR EMAIL DE BIENVENIDA
        try {
          console.log("📧 Enviando email de bienvenida...");
          const { data: emailResponse, error: emailError } =
            await supabase.functions.invoke("send-welcome-email", {
              body: {
                email: user.email,
                nombreEmpresa: nombreEmpresa,
              },
            });

          if (emailError) {
            console.warn("Error enviando email de bienvenida:", emailError);
          } else {
            console.log("✅ Email de bienvenida enviado exitosamente");
          }
        } catch (emailError) {
          console.warn("Error general enviando email:", emailError);
        }
      }
    } catch (error) {
      console.warn("Error general al crear usuario de negocio:", error);
    }
  };

  // --- Manejar confirmación de email desde URL ---
  const handleEmailConfirmation = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const tokenType = urlParams.get("token_type");

    if (accessToken && refreshToken) {
      try {
        // Establecer la sesión con los tokens de la URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        if (data.user) {
          // Intentar crear el registro de mayorista
          await createMayorista(data.user);

          const nombreEmpresa =
            data.user.user_metadata?.nombre_empresa || "Mi Empresa";
          const nombreUsuario = data.user.email?.split("@")[0] || "Usuario";

          // Mostrar mensaje de bienvenida y redirigir
          successMessage.innerHTML = `
                        <strong>¡Cuenta confirmada exitosamente!</strong><br>
                        Bienvenido/a ${nombreUsuario} de ${nombreEmpresa}<br>
                        Redirigiendo al catálogo...
                    `;
          successMessage.style.display = "block";

          setTimeout(() => {
            window.location.href = "index.html#productos";
          }, 2000);
          return;
        }
      } catch (error) {
        console.error("Error al confirmar email:", error);
        errorMessage.textContent =
          "Error al confirmar tu cuenta. Por favor, intenta iniciar sesión manualmente.";
        errorMessage.style.display = "block";
      }
    }
  };

  // Ejecutar la verificación de confirmación al cargar la página
  await handleEmailConfirmation();

  // Toggle entre formularios
  if (showRegisterLink && showLoginLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.style.display = "none";
      showRegisterLink.parentElement.style.display = "none";
      registerForm.style.display = "flex";
      showLoginLink.parentElement.style.display = "block";
    });

    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      registerForm.style.display = "none";
      showLoginLink.parentElement.style.display = "none";
      loginForm.style.display = "flex";
      showRegisterLink.parentElement.style.display = "block";
    });
  }

  // Manejo del Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // Intenta iniciar sesión
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        console.error("Error de autenticación:", loginError);
        throw new Error("auth_error");
      }

      if (!authData.user) {
        console.error("No se recibieron datos de usuario después del login");
        throw new Error("auth_error");
      }

      // Verificar si el usuario es admin usando email específico
      const adminEmails = [
        "admin@ianmodas.com",
        "dylan@ianmodas.com",
        "ianmodas@admin.com",
        "adinaventas@hotmail.com",
      ];
      const isAdmin = adminEmails.includes(authData.user.email?.toLowerCase());

      console.log(
        "🔍 Verificando admin:",
        authData.user.email,
        "Es admin:",
        isAdmin,
      );

      // Si es admin, redirigir al panel
      if (isAdmin) {
        successMessage.textContent = "¡Bienvenido/a Administrador/a!";
        successMessage.style.display = "block";
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1500);
        return;
      }

      // Si no es admin, verificar/crear mayorista por EMAIL
      let mayorista = null;
      let nombreEmpresa = "Mayorista";

      try {
        // BUSCAR POR EMAIL, NO POR ID
        const { data: mayoristaData, error: mayoristaError } = await supabase
          .from("mayoristas")
          .select("*")
          .eq("email", authData.user.email)
          .maybeSingle(); // maybeSingle no falla si no encuentra nada

        if (mayoristaError) {
          console.warn("Error al consultar mayorista:", mayoristaError);
          // Crear mayorista automáticamente si hay error
          await createMayorista(authData.user);
        } else if (!mayoristaData) {
          console.log("Mayorista no existe, creando...");
          // Crear mayorista si no existe
          await createMayorista(authData.user);
        } else {
          mayorista = mayoristaData;
          nombreEmpresa = mayorista?.nombre_empresa || "Mayorista";
          console.log("✅ Mayorista encontrado:", nombreEmpresa);
        }
      } catch (error) {
        console.warn("Error general al manejar mayorista:", error);
        // Permitir login aunque haya error con mayoristas
      }

      // Obtener nombre de empresa de metadata si no hay mayorista
      if (!mayorista) {
        nombreEmpresa =
          authData.user.user_metadata?.nombre_empresa ||
          authData.user.email?.split("@")[0] ||
          "Mayorista";
      }

      // Obtener nombre del email para mostrar junto con la empresa
      const nombreUsuario = authData.user.email?.split("@")[0] || "Usuario";

      successMessage.textContent = `¡Bienvenido/a ${nombreUsuario} de ${nombreEmpresa}!`;
      successMessage.style.display = "block";
      setTimeout(() => {
        window.location.href = "index.html#productos"; // Redirigir al catálogo
      }, 1500);
    } catch (error) {
      // Mensajes amigables para el usuario según el tipo de error
      let userMessage =
        "Lo sentimos, ha ocurrido un error. Por favor, intenta nuevamente.";

      switch (error.message) {
        case "auth_error":
          userMessage = "El email o la contraseña son incorrectos.";
          break;
        case "role_check_error":
          userMessage =
            "No se pudo verificar tu rol de usuario. Por favor, intenta nuevamente.";
          break;
        case "mayorista_check_error":
          userMessage =
            "Error de conexión con la base de datos. Intenta nuevamente.";
          break;
        case "mayorista_create_error":
          userMessage =
            "Problema técnico. Tu cuenta está activa, intenta nuevamente.";
          break;
        case "not_mayorista":
          userMessage =
            "Problema con tu cuenta de mayorista. Contacta al administrador.";
          break;
        default:
          console.error("Error no manejado:", error);
      }

      errorMessage.textContent = userMessage;
      errorMessage.style.display = "block";
    }
  });

  // Función para deshabilitar el formulario temporalmente
  const disableFormTemporarily = (seconds, errorMsg) => {
    const submitButton = document.getElementById("register-submit-btn");
    submitButton.disabled = true;

    let timeLeft = seconds;
    submitButton.textContent = `Espera ${timeLeft} segundos...`;

    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        submitButton.disabled = false;
        submitButton.textContent = "Registrarme";
        registerErrorMessage.style.display = "none";
      } else {
        submitButton.textContent = `Espera ${timeLeft} segundos...`;
      }
    }, 1000);

    if (errorMsg) {
      registerErrorMessage.textContent = errorMsg;
      registerErrorMessage.style.display = "block";
    }
  };

  // Función de validación del formulario
  const validateRegisterForm = (formData) => {
    const {
      email,
      password,
      nombre,
      apellido,
      rut,
      celular,
      nombreEmpresa,
      direccion,
      depto,
    } = formData;

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    if (!email.includes("@")) {
      throw new Error("Por favor ingresa un email válido");
    }
    if (!nombre.trim()) {
      throw new Error("El nombre es requerido");
    }
    if (!apellido.trim()) {
      throw new Error("El apellido es requerido");
    }
    if (!rut.trim()) {
      throw new Error("El RUT es requerido");
    }
    if (!validateRUT(rut)) {
      throw new Error("El RUT ingresado no es válido (formato: 12345678-9)");
    }
    if (!celular.trim()) {
      throw new Error("El celular es requerido");
    }
    if (!validateCelular(celular)) {
      throw new Error("El celular debe tener formato uruguayo (ej: 099123456)");
    }
    if (!nombreEmpresa.trim()) {
      throw new Error("El nombre de la empresa es requerido");
    }
    if (!direccion.trim()) {
      throw new Error("La dirección es requerida");
    }
    if (!depto.trim()) {
      throw new Error("Debe seleccionar un departamento");
    }
  };

  // Función para validar RUT uruguayo
  const validateRUT = (rut) => {
    const rutPattern = /^\d{8}-\d$/;
    return rutPattern.test(rut);
  };

  // Función para validar celular uruguayo
  const validateCelular = (celular) => {
    const celularPattern = /^09[0-9]{7}$/;
    return celularPattern.test(celular.replace(/\s/g, ""));
  };

  // Manejar el registro de mayoristas
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitButton = document.getElementById("register-submit-btn");
      if (submitButton.disabled) return;

      // Verificar términos y condiciones
      const termsCheckbox = document.getElementById("register-terms");
      if (!termsCheckbox.checked) {
        registerErrorMessage.textContent =
          "Debes aceptar los términos y condiciones";
        registerErrorMessage.style.display = "block";
        return;
      }

      registerErrorMessage.style.display = "none";
      registerSuccessMessage.style.display = "none";

      // Recopilar todos los datos del formulario
      const formData = {
        nombre: document.getElementById("register-nombre").value.trim(),
        apellido: document.getElementById("register-apellido").value.trim(),
        rut: document.getElementById("register-rut").value.trim(),
        celular: document.getElementById("register-celular").value.trim(),
        nombreEmpresa: document.getElementById("register-empresa").value.trim(),
        email: document.getElementById("register-email").value.trim(),
        password: document.getElementById("register-password").value,
        direccion: document.getElementById("register-direccion").value.trim(),
        depto: document.getElementById("register-depto").value,
        agenciaEnvio: document.getElementById("register-agencia").value || null,
      };

      try {
        // Validar el formulario
        validateRegisterForm(formData);

        // Crear el usuario en auth con todos los metadatos
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nombre: formData.nombre,
              apellido: formData.apellido,
              rut: formData.rut,
              celular: formData.celular,
              nombre_empresa: formData.nombreEmpresa,
              direccion: formData.direccion,
              departamento: formData.depto,
              agencia_envio: formData.agenciaEnvio,
              tipo_usuario: "mayorista",
            },
          },
        });

        if (signUpError) {
          console.error("Error en signUp:", signUpError);
          if (signUpError.message.includes("already registered")) {
            throw new Error("Este email ya está registrado.");
          }
          throw signUpError;
        }

        if (!data?.user?.id) {
          throw new Error("No se pudo crear el usuario");
        }

        // Mostrar mensaje de confirmación
        registerSuccessMessage.innerHTML = `
                    <strong>¡Registro exitoso, ${formData.nombre}!</strong><br>
                    📧 Te hemos enviado un correo de confirmación a <strong>${formData.email}</strong><br>
                    🔗 Haz clic en el enlace del correo para activar tu cuenta de mayorista<br>
                    ✅ Una vez confirmado, podrás acceder al catálogo exclusivo de <strong>${formData.nombreEmpresa}</strong><br>
                    📦 Los pedidos se enviarán a: <strong>${formData.direccion}, ${formData.depto}</strong>
                `;
        registerSuccessMessage.style.display = "block";
        registerForm.reset();
      } catch (error) {
        console.error("Error en registro:", error);
        let errorMsg =
          "Error al crear la cuenta. Por favor, intenta nuevamente.";

        // Manejar errores de validación personalizada
        if (
          error.message.includes("contraseña") ||
          error.message.includes("email") ||
          error.message.includes("nombre") ||
          error.message.includes("apellido") ||
          error.message.includes("RUT") ||
          error.message.includes("celular") ||
          error.message.includes("empresa") ||
          error.message.includes("dirección") ||
          error.message.includes("departamento")
        ) {
          errorMsg = error.message;
        }
        // Manejar errores de Supabase
        else if (error.message && typeof error.message === "string") {
          if (error.message.includes("after")) {
            const seconds = parseInt(
              error.message.match(/after (\d+) seconds/)?.[1] || "60",
            );
            disableFormTemporarily(
              seconds,
              "Has realizado demasiados intentos. Por favor espera.",
            );
            return;
          } else if (error.message.includes("already registered")) {
            errorMsg = "Este email ya está registrado.";
          } else if (error.message.includes("Invalid email")) {
            errorMsg = "El email ingresado no es válido.";
          } else if (error.message.includes("at least 6 characters")) {
            errorMsg = "La contraseña debe tener al menos 6 caracteres.";
          }
        }

        registerErrorMessage.textContent = errorMsg;
        registerErrorMessage.style.display = "block";
      }
    });
  }
});
