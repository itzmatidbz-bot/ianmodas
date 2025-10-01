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
    const navOverlay = document.getElementById('nav-overlay');
    
    // --- Elementos del Carrito ---
    const cartModal = document.getElementById('cart-modal');
    const cartToggle = document.getElementById('cart-toggle');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');

    // --- Estado de la App ---
    let allProducts = [];
    let currentUser = null;
    let cart = JSON.parse(localStorage.getItem('ianModasCart')) || [];

    async function init() {
        await checkUserStatus();
        await loadProducts();
        setupEventListeners();
        setupMobileMenu();
        updateCartUI();
    }
    
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

    async function loadProducts() {
        try {
            // Cargar productos usando la vista completa con categorización
            const { data, error } = await supabase
                .from('vista_productos_completa')
                .select('*')
                .order('nombre', { ascending: true });
            
            if (error) throw error;
            allProducts = data || [];
            
            // Cargar datos de filtros
            await loadFilterData();
            
            // Renderizar productos
            renderProducts(allProducts);
            updateResultsCounter(allProducts.length);
            
        } catch (error) {
            console.error('Error fetching products:', error);
            if(productGrid) {
                productGrid.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error al cargar el catálogo. Intente más tarde.</p>
                    </div>
                `;
            }
        }
    }

    // --- Funciones de Filtros Avanzados ---
    async function loadFilterData() {
        try {
            // Cargar categorías
            const { data: categorias } = await supabase.rpc('get_categorias_activas');
            populateSelect('categoria-filter', categorias, 'id', 'nombre');

            // Cargar estilos
            const { data: estilos } = await supabase.rpc('get_estilos_activos');
            populateSelect('estilo-filter', estilos, 'id', 'nombre');

            // Cargar colores
            const { data: colores } = await supabase.rpc('get_colores_activos');
            populateSelect('color-filter', colores, 'id', 'nombre');

            // Cargar tipos de tela
            const { data: tiposTela } = await supabase.rpc('get_tipos_tela_activos');
            populateSelect('tipo-tela-filter', tiposTela, 'id', 'nombre');

        } catch (error) {
            console.error('Error loading filter data:', error);
        }
    }

    function populateSelect(selectId, data, valueField, textField) {
        const select = document.getElementById(selectId);
        if (!select || !data) return;

        // Mantener la opción por defecto
        const defaultOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (defaultOption) select.appendChild(defaultOption);

        // Agregar opciones
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            select.appendChild(option);
        });
    }

    async function handleCategoryChange(categoriaId) {
        const tipoSelect = document.getElementById('tipo-filter');
        
        if (!categoriaId) {
            tipoSelect.innerHTML = '<option value="">Todos los tipos</option>';
            tipoSelect.disabled = true;
            return;
        }

        try {
            const { data: tipos } = await supabase.rpc('get_tipos_prenda_por_categoria', {
                categoria_id: parseInt(categoriaId)
            });

            tipoSelect.innerHTML = '<option value="">Todos los tipos</option>';
            
            if (tipos && tipos.length > 0) {
                tipos.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo.id;
                    option.textContent = tipo.nombre;
                    tipoSelect.appendChild(option);
                });
                tipoSelect.disabled = false;
            } else {
                tipoSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error loading tipos de prenda:', error);
            tipoSelect.disabled = true;
        }
    }

    function renderProducts(products) {
        if (!productGrid) return;

        // Limpiar el grid
        productGrid.innerHTML = '';
        
        // Mostrar/ocultar mensaje de no resultados
        noResultsMessage.style.display = products.length === 0 ? 'block' : 'none';

        if (products.length === 0) return;

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;
            
            // Formatear precio
            const precio = product.precio ? parseFloat(product.precio) : 0;
            const priceHTML = currentUser
                ? `<p class="product-card__price">$UYU ${precio.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>`
                : `<p class="product-card__price hidden">Inicia sesión para ver precios</p>`;

            // Mostrar información de categorización
            const categoryInfo = [];
            if (product.categoria_nombre) categoryInfo.push(product.categoria_nombre);
            if (product.tipo_prenda_nombre) categoryInfo.push(product.tipo_prenda_nombre);
            
            const categoryText = categoryInfo.length > 0 ? categoryInfo.join(' • ') : 'Sin categoría';

            card.innerHTML = `
                <img src="${product.imagen_url || 'https://placehold.co/600x400/eee/ccc?text=IanModas'}" alt="${product.nombre}" class="product-card__image">
                <div class="product-card__content">
                    <p class="product-card__category">${categoryText}</p>
                    <h3 class="product-card__title">${product.nombre}</h3>
                    ${priceHTML}
                </div>
            `;
            
            // Hacer la tarjeta clickeable
            card.addEventListener('click', () => {
                window.location.href = `producto.html?id=${product.id}`;
            });
            
            productGrid.appendChild(card);
        });
    }

    function applyFilters() {
        const filters = {
            categoria: document.getElementById('categoria-filter')?.value || '',
            tipo: document.getElementById('tipo-filter')?.value || '',
            estilo: document.getElementById('estilo-filter')?.value || '',
            color: document.getElementById('color-filter')?.value || '',
            tipoTela: document.getElementById('tipo-tela-filter')?.value || '',
            genero: document.getElementById('genero-filter')?.value || '',
            temporada: document.getElementById('temporada-filter')?.value || ''
        };

        let filteredProducts = allProducts.filter(product => {
            // Filtro por categoría
            if (filters.categoria && product.categoria_id != filters.categoria) return false;
            
            // Filtro por tipo de prenda
            if (filters.tipo && product.tipo_prenda_id != filters.tipo) return false;
            
            // Filtro por estilo
            if (filters.estilo && product.estilo_id != filters.estilo) return false;
            
            // Filtro por color
            if (filters.color && product.color_id != filters.color) return false;
            
            // Filtro por tipo de tela
            if (filters.tipoTela && product.tipo_tela_id != filters.tipoTela) return false;
            
            // Filtro por género
            if (filters.genero && product.genero && product.genero !== filters.genero) return false;
            
            // Filtro por temporada
            if (filters.temporada && product.temporada && product.temporada !== filters.temporada) return false;

            return true;
        });

        renderProducts(filteredProducts);
        updateResultsCounter(filteredProducts.length);
    }

    function clearFilters() {
        // Resetear todos los selects
        document.getElementById('categoria-filter').value = '';
        document.getElementById('tipo-filter').value = '';
        document.getElementById('estilo-filter').value = '';
        document.getElementById('color-filter').value = '';
        document.getElementById('tipo-tela-filter').value = '';
        document.getElementById('genero-filter').value = '';
        document.getElementById('temporada-filter').value = '';
        
        // Deshabilitar tipo de prenda
        document.getElementById('tipo-filter').disabled = true;
        
        // Mostrar todos los productos
        renderProducts(allProducts);
        updateResultsCounter(allProducts.length);
    }

    function updateResultsCounter(count) {
        const counter = document.getElementById('results-count');
        if (counter) {
            counter.textContent = `${count} producto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
        }
    }
    
    function setupEventListeners() {
        // --- Filtros Avanzados ---
        const toggleFiltersBtn = document.getElementById('toggle-filters');
        const filtersContent = document.getElementById('filters-content');
        const toggleText = document.getElementById('toggle-text');
        const toggleIcon = document.getElementById('toggle-icon');

        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener('click', () => {
                const isActive = filtersContent.classList.contains('active');
                
                if (isActive) {
                    filtersContent.classList.remove('active');
                    toggleText.textContent = 'Mostrar Filtros';
                    toggleIcon.style.transform = 'rotate(0deg)';
                } else {
                    filtersContent.classList.add('active');
                    toggleText.textContent = 'Ocultar Filtros';
                    toggleIcon.style.transform = 'rotate(180deg)';
                }
            });
        }

        // Eventos de filtros
        const categoriaSelect = document.getElementById('categoria-filter');
        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', (e) => {
                handleCategoryChange(e.target.value);
            });
        }

        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', applyFilters);
        }

        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearFilters);
        }

        const showAllBtn = document.getElementById('show-all-products');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                clearFilters();
                // Abrir filtros si están cerrados
                if (!filtersContent.classList.contains('active')) {
                    toggleFiltersBtn.click();
                }
            });
        }
        
        // Aplicar filtros automáticamente cuando cambian los valores
        const autoFilterSelects = [
            'categoria-filter', 'tipo-filter', 'estilo-filter', 
            'color-filter', 'tipo-tela-filter', 'genero-filter', 'temporada-filter'
        ];
        
        autoFilterSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    setTimeout(applyFilters, 100); // Pequeño delay para mejor UX
                });
            }
        });
        
        // Formularios de auth
        if(document.getElementById('login-form')) {
            setupAuthForms();
        }
        
        // Listeners del Carrito
        if (cartToggle) cartToggle.addEventListener('click', () => cartModal.classList.add('active'));
        if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
        
        const cartFooter = document.querySelector('.cart-modal__footer');
        if (cartFooter) cartFooter.addEventListener('click', handleCartActions);
        if (cartItemsContainer) cartItemsContainer.addEventListener('click', handleCartActions);
    }

    function setupMobileMenu() {
        // Función para abrir menú
        const openMenu = () => {
            if (navMenu) {
                navMenu.classList.add('active');
                if (navOverlay) navOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        // Función para cerrar menú
        const closeMenu = () => {
            if (navMenu) {
                navMenu.classList.remove('active');
                if (navOverlay) navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        // Toggle menú
        if (navToggle) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (navMenu && navMenu.classList.contains('active')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }
        
        // Botón cerrar
        if (navClose) {
            navClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
            });
        }

        // Cerrar menú al hacer click en un enlace
        if (navMenu) {
            const navLinks = navMenu.querySelectorAll('.nav__link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Solo cerrar si es un enlace interno
                    if (link.getAttribute('href').startsWith('#')) {
                        closeMenu();
                    }
                });
            });
        }

        // Cerrar menú al hacer click en overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', closeMenu);
        }

        // Cerrar menú al hacer click fuera (solo en móvil)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    closeMenu();
                }
            }
        });

        // Cerrar menú al redimensionar ventana
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }
    
    function setupAuthForms() {
        // ... (el código del formulario de login y registro se mantiene igual)
    }

    // --- Lógica del Carrito/Pedido ---
    function saveCart() {
        localStorage.setItem('ianModasCart', JSON.stringify(cart));
    }

    function updateCartUI() {
        renderCartItems();
        renderCartTotal();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu lista de pedido está vacía.</p>';
            return;
        }
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.imagen_url}" alt="${item.nombre}" class="cart-item__image">
                <div class="cart-item__info">
                    <p class="cart-item__title">${item.nombre}</p>
                    <p class="cart-item__price">$${item.precio.toFixed(2)}</p>
                    <div class="cart-item__quantity">
                        <span>Cantidad: ${item.quantity}</span>
                    </div>
                </div>
                <button class="cart-item__remove" data-id="${item.id}">&times;</button>
            </div>
        `).join('');
    }

    function renderCartTotal() {
        const cartFooter = document.querySelector('.cart-modal__footer');
        if (cart.length === 0) {
            cartFooter.innerHTML = '';
            return;
        }
        const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        cartFooter.innerHTML = `
            <div class="cart-total">
                <p>Total del Pedido:</p>
                <p>$${total.toFixed(2)}</p>
            </div>
            <button id="checkout-btn" class="btn">Enviar Pedido por WhatsApp</button>
            <button id="clear-cart-btn" class="btn btn--secondary">Vaciar Lista</button>
        `;
    }
    
    function handleCartActions(e) {
        if (e.target.id === 'checkout-btn') {
            checkoutToWhatsApp();
        } else if (e.target.id === 'clear-cart-btn') {
            if (confirm('¿Seguro que quieres vaciar tu lista de pedido?')) {
                cart = [];
                saveCart();
                updateCartUI();
            }
        } else if (e.target.classList.contains('cart-item__remove')) {
            const itemId = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
            updateCartUI();
        }
    }
    
    function checkoutToWhatsApp() {
        if (cart.length === 0) {
            alert("Tu lista de pedido está vacía.");
            return;
        }
        let message = "¡Hola Ian Modas! 👋 Quisiera hacer el siguiente pedido:\n\n";
        cart.forEach(item => {
            message += `▪️ *${item.nombre}*\n`;
            message += `  - Cantidad: ${item.quantity}\n`;
            message += `  - Precio unitario: $${item.precio.toFixed(2)}\n\n`;
        });
        const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        message += `*Total del Pedido: $${total.toFixed(2)}*\n\n`;
        message += `¡Quedo a la espera de su confirmación! Gracias.`;
        const whatsappUrl = `https://wa.me/59894772730?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    init();
});

