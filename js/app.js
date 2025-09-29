document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el script debe ejecutarse en la página actual
    const isPublicPage = document.getElementById('product-grid') || document.getElementById('login-form');
    if (!isPublicPage) return;

    // --- Selectores del DOM ---
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const noResultsMessage = document.getElementById('no-results-message');
    const userSessionLink = document.getElementById('user-session');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');

    let allProducts = [];
    let currentUser = null;

    /**
     * Inicializa la página: carga productos y configura listeners.
     */
    async function init() {
        await checkUserStatus();
        await loadProducts();
        setupEventListeners();
        setupMobileMenu();
    }
    
    /**
     * Verifica si hay un usuario mayorista logueado.
     */
    async function checkUserStatus() {
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session ? session.user : null;

        if (currentUser) {
            userSessionLink.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Salir</span>`;
            userSessionLink.href = '#';
            userSessionLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabase.auth.signOut();
                window.location.reload();
            });
        }
    }

    /**
     * Carga todos los productos desde Supabase.
     */
    async function loadProducts() {
        try {
            const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
            if (error) throw error;
            allProducts = data;
            renderProducts(allProducts);
        } catch (error) {
            if(productGrid) productGrid.innerHTML = '<p>Error al cargar el catálogo. Intente más tarde.</p>';
            console.error('Error fetching products:', error);
        }
    }

    /**
     * Renderiza las tarjetas de productos en el grid.
     * @param {Array} products - El array de productos a mostrar.
     */
    function renderProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (products.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const priceHTML = currentUser
                ? `<p class="product-card__price">$${product.precio.toFixed(2)}</p>`
                : `<p class="product-card__price hidden">Inicia sesión para ver precios</p>`;

            card.innerHTML = `
                <img src="${product.imagen_url || 'https://placehold.co/600x400/eee/ccc?text=IanModas'}" alt="${product.nombre}" class="product-card__image">
                <div class="product-card__content">
                    <p class="product-card__category">${product.categoria}</p>
                    <h3 class="product-card__title">${product.nombre}</h3>
                    ${priceHTML}
                </div>
            `;
            productGrid.appendChild(card);
        });
    }
    
    /**
     * Configura los event listeners para filtros y menú móvil.
     */
    function setupEventListeners() {
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                const selectedCategory = categoryFilter.value;
                const filtered = selectedCategory === 'all'
                    ? allProducts
                    : allProducts.filter(p => p.categoria === selectedCategory);
                renderProducts(filtered);
            });
        }
        
        // Lógica para formularios de Login/Registro
        if(document.getElementById('login-form')) {
            setupAuthForms();
        }
    }

    /**
     * Configura la lógica para el menú de hamburguesa.
     */
    function setupMobileMenu() {
        if (navToggle) {
            navToggle.addEventListener('click', () => navMenu.classList.add('active'));
        }
        if (navClose) {
            navClose.addEventListener('click', () => navMenu.classList.remove('active'));
        }
    }
    
    /**
     * Maneja los formularios de autenticación (login y registro).
     */
    function setupAuthForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');

        // Toggle entre formularios
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

        // Evento de Login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-message');
            
            try {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.location.href = 'index.html';
            } catch (error) {
                errorMsg.textContent = 'Email o contraseña incorrectos.';
                errorMsg.style.display = 'block';
            }
        });

        // Evento de Registro
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const nombreEmpresa = document.getElementById('register-empresa').value;
            const errorMsg = document.getElementById('register-error-message');
            const successMsg = document.getElementById('register-success-message');
            
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            try {
                const { data: { user }, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                
                // Insertar datos adicionales en la tabla 'mayoristas'
                const { error: profileError } = await supabase.from('mayoristas').insert({
                    id: user.id,
                    nombre_empresa: nombreEmpresa
                });
                if (profileError) throw profileError;
                
                successMsg.textContent = '¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.';
                successMsg.style.display = 'block';
                registerForm.reset();

            } catch (error) {
                errorMsg.textContent = error.message;
                errorMsg.style.display = 'block';
            }
        });
    }

    // Iniciar la aplicación
    init();
});
