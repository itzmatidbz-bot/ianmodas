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
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 12;
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
            console.log('🔧 Cargando datos para filtros...');
            
            // Cargar categorías
            try {
                const { data: categorias } = await supabase.rpc('get_categorias');
                if (categorias && categorias.length > 0) {
                    // Popular por nombre para búsquedas por texto y RPC dependiente
                    populateSelect('categoria-filter', categorias, 'nombre', 'nombre');
                    console.log('✅ Categorías cargadas para filtros:', categorias.length);
                }
            } catch (e) {
                console.log('⚠️ Usando categorías desde productos existentes');
                const categorias = [...new Set(allProducts.map(p => p.categoria_nombre))].filter(Boolean);
                populateSelectFromArray('categoria-filter', categorias);
            }

            // Inicializar Tipo de Prenda vacío y deshabilitado; se cargará por categoría
            const tipoSelect = document.getElementById('tipo-filter');
            if (tipoSelect) {
                tipoSelect.innerHTML = '<option value="">Todos los tipos</option>';
                tipoSelect.disabled = true;
            }

            // Cargar estilos
            try {
                const { data: estilos } = await supabase.rpc('get_estilos_todos');
                if (estilos && estilos.length > 0) {
                    populateSelect('estilo-filter', estilos, 'id', 'nombre');
                }
            } catch (e) {
                const estilos = [...new Set(allProducts.map(p => p.estilo_nombre))].filter(Boolean);
                populateSelectFromArray('estilo-filter', estilos);
            }

            // Cargar tipos de tela
            try {
                const { data: telas } = await supabase.rpc('get_telas');
                if (telas && telas.length > 0) {
                    populateSelect('tipo-tela-filter', telas, 'id', 'nombre');
                }
            } catch (e) {
                const telas = [...new Set(allProducts.map(p => p.tela_nombre))].filter(Boolean);
                populateSelectFromArray('tipo-tela-filter', telas);
            }

            // Cargar colores
            try {
                const { data: colores } = await supabase.rpc('get_colores');
                if (colores && colores.length > 0) {
                    populateSelect('color-filter', colores, 'id', 'nombre');
                }
            } catch (e) {
                // Usar colores básicos como fallback
                const coloresBasicos = [
                    'Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde', 
                    'Amarillo', 'Rosa', 'Morado', 'Naranja', 'Celeste', 'Beige'
                ];
                populateSelectFromArray('color-filter', coloresBasicos);
            }

            console.log('✅ Datos de filtros cargados');

        } catch (error) {
            console.error('Error loading filter data:', error);
        }
    }

    function populateSelect(selectId, data, valueField, textField) {
        const select = document.getElementById(selectId);
        if (!select || !data) return;

        const defaultOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (defaultOption) select.appendChild(defaultOption);

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField] ?? item.id ?? '';
            option.textContent = item[textField] ?? item.nombre ?? '';
            select.appendChild(option);
        });
    }

    function populateSelectFromArray(selectId, items) {
        const select = document.getElementById(selectId);
        if (!select || !items) return;

        const defaultOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (defaultOption) select.appendChild(defaultOption);

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    }

    async function handleCategoryChange(categoriaNombre) {
        const tipoSelect = document.getElementById('tipo-filter');
        if (!tipoSelect) return;

        if (!categoriaNombre) {
            tipoSelect.innerHTML = '<option value="">Todos los tipos</option>';
            tipoSelect.disabled = true;
            return;
        }

        try {
            // Usar función existente: get_tipos_prenda(cat_nombre TEXT)
            const { data: tipos, error } = await supabase.rpc('get_tipos_prenda', {
                cat_nombre: categoriaNombre
            });
            if (error) throw error;

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
            // Fallback: derivar tipos únicos del catálogo filtrado por categoría
            const tiposFallback = [...new Set(allProducts
                .filter(p => p.categoria_nombre && p.categoria_nombre.toLowerCase() === categoriaNombre.toLowerCase())
                .map(p => p.tipo_prenda_nombre))].filter(Boolean);
            tipoSelect.innerHTML = '<option value="">Todos los tipos</option>';
            tiposFallback.forEach(nombre => {
                const option = document.createElement('option');
                option.value = nombre; // permitir filtrado por nombre en fallback
                option.textContent = nombre;
                tipoSelect.appendChild(option);
            });
            tipoSelect.disabled = tiposFallback.length === 0;
        }
    }

    function showFilterLoading(show) {
        const loadingIndicator = document.querySelector('.filter-loading');
        if (!loadingIndicator) {
            if (show) {
                const loader = document.createElement('div');
                loader.className = 'filter-loading';
                loader.innerHTML = `
                    <div class="loading-spinner"></div>
                    <span>Filtrando productos...</span>
                `;
                document.querySelector('.filter-section')?.appendChild(loader);
            }
            return;
        }
        
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    function renderProducts(products, page = 1) {
        if (!productGrid) return;

        // Mostrar indicador de carga
        showFilterLoading(true);
        
        // Simulamos un pequeño delay para mostrar el loading
        setTimeout(() => {
            // Limpiar el grid
            productGrid.innerHTML = '';
            
            // Mostrar/ocultar mensaje de no resultados
            noResultsMessage.style.display = products.length === 0 ? 'block' : 'none';

            if (products.length === 0) {
                showFilterLoading(false);
                return;
            }

            // Calcular paginación
            const startIndex = (page - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            // Actualizar currentPage y filteredProducts
            currentPage = page;
            filteredProducts = products;

        paginatedProducts.forEach(product => {
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
        
        // Renderizar controles de paginación
        renderPagination(products.length, page);
        
        // Ocultar indicador de carga
        showFilterLoading(false);
        }, 150); // Pequeño delay para mostrar el feedback visual
    }

    function renderPagination(totalProducts, currentPage) {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        
        if (totalPages <= 1) {
            // No mostrar paginación si solo hay una página
            const existingPagination = document.querySelector('.pagination-container');
            if (existingPagination) existingPagination.remove();
            return;
        }
        
        // Buscar o crear contenedor de paginación
        let paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            productGrid.parentNode?.insertBefore(paginationContainer, productGrid.nextSibling);
        }
        
        // Mostrar info de página actual
        const startItem = ((currentPage - 1) * productsPerPage) + 1;
        const endItem = Math.min(currentPage * productsPerPage, totalProducts);
        
        paginationContainer.innerHTML = `
            <div class="pagination-info">
                Mostrando ${startItem}-${endItem} de ${totalProducts} productos
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span class="pagination-current">Página ${currentPage} de ${totalPages}</span>
                <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    function changePage(page) {
        if (page < 1 || page > Math.ceil(filteredProducts.length / productsPerPage)) return;
        
        renderProducts(filteredProducts, page);
        
        // Scroll suave al top de los productos
        document.querySelector('.products-section')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Exponer función globalmente
    window.changePage = changePage;

    function applyFilters() {
        console.log('🔍 Aplicando filtros inteligentes...');
        
        const filters = {
            categoria: document.getElementById('categoria-filter')?.value || '',
            tipo: document.getElementById('tipo-filter')?.value || '',
            estilo: document.getElementById('estilo-filter')?.value || '',
            color: document.getElementById('color-filter')?.value || '',
            tipoTela: document.getElementById('tipo-tela-filter')?.value || '',
            genero: document.getElementById('genero-filter')?.value || '',
            temporada: document.getElementById('temporada-filter')?.value || ''
        };

        console.log('📊 Filtros aplicados:', filters);
        console.log('📦 Total productos disponibles:', allProducts.length);

        // FILTRO INTELIGENTE: Solo aplica los filtros que están seleccionados
        let filteredProducts = allProducts.filter(product => {
            
            // Filtro por categoría (más flexible)
            if (filters.categoria) {
                const categoryMatch = 
                    product.categoria_id == filters.categoria ||
                    (product.categoria_nombre && product.categoria_nombre.toLowerCase().includes(filters.categoria.toLowerCase()));
                if (!categoryMatch) return false;
            }
            
            // Filtro por tipo de prenda (más flexible)
            if (filters.tipo) {
                const typeMatch = 
                    product.tipo_prenda_id == filters.tipo ||
                    (product.tipo_prenda_nombre && product.tipo_prenda_nombre.toLowerCase().includes(filters.tipo.toLowerCase()));
                if (!typeMatch) return false;
            }
            
            // Filtro por estilo (opcional - no bloquea si no está definido)
            if (filters.estilo && product.estilo_id && product.estilo_id != filters.estilo) {
                return false;
            }
            
            // Filtro por color (busca en string de colores disponibles)
            if (filters.color && product.colores_disponibles) {
                const colorMatch = product.colores_disponibles.toLowerCase().includes(filters.color.toLowerCase());
                console.log(`🎨 Buscando color "${filters.color}" en "${product.colores_disponibles}": ${colorMatch}`);
                if (!colorMatch) return false;
            }
            
            // Filtro por tipo de tela (opcional)
            if (filters.tipoTela && product.tela_id && product.tela_id != filters.tipoTela) {
                return false;
            }
            
            // Filtro por género (más permisivo)
            if (filters.genero && filters.genero !== 'todos') {
                if (product.genero && product.genero.toLowerCase() !== filters.genero.toLowerCase()) {
                    return false;
                }
            }
            
            // Filtro por temporada (más permisivo)
            if (filters.temporada && filters.temporada !== 'todo_año') {
                if (product.temporada && product.temporada !== filters.temporada) {
                    return false;
                }
            }

            return true;
        });

        console.log(`✅ Filtros aplicados: ${allProducts.length} → ${filteredProducts.length} productos`);
        renderProducts(filteredProducts);
        updateResultsCounter(filteredProducts.length);
        
        // Debug: Mostrar algunos productos filtrados
        if (filteredProducts.length > 0) {
            console.log('🔍 Ejemplo de productos filtrados:', filteredProducts.slice(0, 3).map(p => ({
                nombre: p.nombre,
                categoria: p.categoria_nombre,
                colores: p.colores_disponibles
            })));
        }
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
        const tipoSelect = document.getElementById('tipo-filter');
        if (tipoSelect) {
            tipoSelect.innerHTML = '<option value="">Todos los tipos</option>';
            tipoSelect.disabled = true;
        }
        
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

        // Configurar botones de aplicar y limpiar filtros
        const applyBtn = document.querySelector('[onclick*="APLICAR FILTROS"]') || document.getElementById('apply-filters');
        const clearBtn = document.querySelector('[onclick*="LIMPIAR FILTROS"]') || document.getElementById('clear-filters');
        
        if (applyBtn) {
            applyBtn.onclick = null; // Remover onclick anterior
            applyBtn.addEventListener('click', applyFilters);
        }
        
        if (clearBtn) {
            clearBtn.onclick = null; // Remover onclick anterior  
            clearBtn.addEventListener('click', clearFilters);
        }

        // Eventos de filtros individuales
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
        console.log('🍔 Configurando menú móvil...');
        
        // Función para abrir menú
        const openMenu = () => {
            console.log('📱 Abriendo menú móvil');
            if (navMenu) {
                navMenu.classList.add('show-menu');
                if (navOverlay) navOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Animación de entrada para los links
                const navLinks = navMenu.querySelectorAll('.nav__link');
                navLinks.forEach((link, index) => {
                    link.style.animation = `slideInRight 0.3s ease ${index * 0.1}s both`;
                });
            }
        };

        // Función para cerrar menú
        const closeMenu = () => {
            console.log('❌ Cerrando menú móvil');
            if (navMenu) {
                navMenu.classList.remove('show-menu');
                if (navOverlay) navOverlay.classList.remove('active');
                document.body.style.overflow = '';
                
                // Limpiar animaciones
                const navLinks = navMenu.querySelectorAll('.nav__link');
                navLinks.forEach(link => {
                    link.style.animation = '';
                });
            }
        };

        // Toggle menú
        if (navToggle) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (navMenu && navMenu.classList.contains('show-menu')) {
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
            if (window.innerWidth <= 992 && navMenu && navMenu.classList.contains('show-menu')) {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    closeMenu();
                }
            }
        });

        // Cerrar menú al redimensionar ventana
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
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
            <div class="cart-item" data-id="${item.id}" data-color="${item.color_id || 'sin-color'}">
                <img src="${item.imagen_url}" alt="${item.nombre}" class="cart-item__image">
                <div class="cart-item__info">
                    <p class="cart-item__title">${item.nombre}</p>
                    ${item.color_nombre ? `<p class="cart-item__color">Color: ${item.color_nombre}</p>` : ''}
                    ${item.tipo_tela_nombre ? `<p class="cart-item__fabric">Tela: ${item.tipo_tela_nombre}</p>` : ''}
                    <p class="cart-item__price">$${item.precio.toFixed(2)}</p>
                    <div class="cart-item__quantity">
                        <span>Cantidad: ${item.quantity}</span>
                    </div>
                </div>
                <button class="cart-item__remove" data-id="${item.id}" data-color="${item.color_id || 'sin-color'}">&times;</button>
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
            const colorId = e.target.dataset.color;
            
            // Remover considerando ID del producto y color
            cart = cart.filter(item => !(item.id === itemId && (item.color_id || 'sin-color') === colorId));
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
            if (item.color_nombre) message += `  - Color: ${item.color_nombre}\n`;
            if (item.tipo_tela_nombre) message += `  - Tela: ${item.tipo_tela_nombre}\n`;
            message += `  - Cantidad: ${item.quantity}\n`;
            message += `  - Precio unitario: $${item.precio.toFixed(2)}\n`;
            message += `  - Subtotal: $${(item.precio * item.quantity).toFixed(2)}\n\n`;
        });
        const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
        message += `*Total del Pedido: $${total.toFixed(2)}*\n\n`;
        message += `¡Quedo a la espera de su confirmación! Gracias.`;
        const whatsappUrl = `https://wa.me/59894772730?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // === FUNCIONES DE FILTRADO AVANZADO ===

    function matchesFilter(productValue, filterValue) {
        if (!productValue || !filterValue) return false;
        return productValue.toLowerCase().includes(filterValue.toLowerCase()) || 
               filterValue.toLowerCase().includes(productValue.toLowerCase());
    }

    // Nota: clearFilters ya está definido más arriba con la lógica correcta.

    // Hacer las funciones globales para que puedan ser llamadas desde HTML
    window.applyFilters = applyFilters;
    window.clearFilters = clearFilters;

    function displayProducts(products) {
        const productGrid = document.getElementById('product-grid');
        const noResultsMessage = document.getElementById('no-results-message');
        const resultsCount = document.getElementById('results-count');

        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = `
                <p id="no-results-message" class="no-results-message" style="display: flex;">
                    <i class="fas fa-search"></i>
                    No se encontraron productos con los filtros seleccionados.
                    <button id="show-all-products" class="btn btn--outline">Ver todos los productos</button>
                </p>`;
            resultsCount.textContent = '0 productos encontrados';
            // Asegurarse de que el botón para limpiar filtros sea funcional
            const showAllBtn = document.getElementById('show-all-products');
            if(showAllBtn) {
                showAllBtn.addEventListener('click', clearFilters);
            }
            return;
        }

        resultsCount.textContent = `${products.length} productos encontrados`;

        products.forEach(product => {
            const isNew = product.es_nuevo;
            const price = isAdmin ? `$${product.precio_compra}` : 'Consultar precio';
            const priceClass = isAdmin ? '' : 'hidden';

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;

            productCard.innerHTML = `
                <div class="product-card__image-container">
                    <img src="${product.imagen_url || 'placeholder.jpg'}" alt="${product.nombre}" class="product-card__image" loading="lazy">
                    ${isNew ? '<span class="product-card__badge">Nuevo</span>' : ''}
                </div>
                <div class="product-card__content">
                    <span class="product-card__category">${product.categoria || 'Sin categoría'}</span>
                    <h3 class="product-card__title">${product.nombre}</h3>
                    <div class="product-card__footer">
                        <span class="product-card__price ${priceClass}">${price}</span>
                        <div class="product-card__action">
                            <button class="btn btn--primary btn--sm add-to-cart-btn" data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i>
                                <span class="btn-text">Agregar</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        // Re-vincular eventos para los nuevos botones
        productGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
                const productId = e.currentTarget.dataset.productId;
                const product = allProducts.find(p => p.id == productId);
                if (product) {
                    addToCart(product);
                }
            });
        });

        productGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                window.location.href = `producto.html?id=${productId}`;
            });
        });
    }

    init();
});

