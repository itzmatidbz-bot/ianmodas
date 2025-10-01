// JAVASCRIPT ACTUALIZADO PARA SISTEMA 3FN
// Reemplaza el contenido de js/admin.js

document.addEventListener('DOMContentLoaded', async () => {
    let editingProductId = null;

    const DOMElements = {
        sidebar: document.querySelector('.admin-sidebar'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        sections: document.querySelectorAll('.admin-section'),
        navItems: document.querySelectorAll('.nav-item'),
        totalUsers: document.getElementById('total-users'),
        totalProducts: document.getElementById('total-products'),
        productsTableBody: document.getElementById('products-table-body'),
        usersTableBody: document.getElementById('users-table-body'),
        productForm: document.getElementById('product-form'),
        logoutButton: document.getElementById('logout-button')
    };

    // Proteger página y cargar datos
    await protectPage();
    await loadCategoriesData();
    const allData = await loadInitialData();
    if (allData) {
        renderUI(allData);
        setupEventListeners(allData.products, allData.users);
    }

    async function protectPage() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = 'login.html';
                return;
            }
            
            const { data: isAdmin, error } = await supabase.rpc('is_admin');
            if (error || !isAdmin) {
                await supabase.auth.signOut();
                window.location.href = 'login.html?error=auth';
                return;
            }
            
            const loadingScreen = document.getElementById('loading-screen');
            const adminLayout = document.querySelector('.admin-layout');
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (adminLayout) adminLayout.style.display = 'block';
            
            const adminUserSpan = document.querySelector('.admin-user span');
            if (adminUserSpan) {
                const userName = session.user.email?.split('@')[0] || 'Admin';
                adminUserSpan.textContent = `Admin: ${userName}`;
            }
            
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            window.location.href = 'login.html';
        }
    }

    // Cargar datos de categorización con nueva estructura 3FN
    async function loadCategoriesData() {
        try {
            console.log('🏷️ Cargando sistema 3FN...');
            
            // Cargar categorías
            try {
                const { data: categorias, error } = await supabase.rpc('get_categorias');
                if (!error && categorias && categorias.length > 0) {
                    console.log('✅ Categorías cargadas:', categorias.length);
                    populateSelect('categoria', categorias, 'Selecciona categoría');
                } else {
                    console.log('⚠️ Error cargando categorías:', error);
                    loadFallbackCategorias();
                }
            } catch (e) {
                console.log('⚠️ Función get_categorias no disponible');
                loadFallbackCategorias();
            }
            
            // Cargar telas
            try {
                const { data: telas, error } = await supabase.rpc('get_telas');
                if (!error && telas && telas.length > 0) {
                    console.log('✅ Telas cargadas:', telas.length);
                    populateSelect('tela', telas, 'Selecciona tela');
                } else {
                    console.log('⚠️ Sin telas, usando fallback');
                    loadFallbackTelas();
                }
            } catch (e) {
                console.log('⚠️ Función get_telas no disponible');
                loadFallbackTelas();
            }
            
            // Cargar colores
            try {
                const { data: colores, error } = await supabase.rpc('get_colores');
                if (!error && colores && colores.length > 0) {
                    console.log('✅ Colores cargados:', colores.length);
                    populateSelect('color', colores, 'Selecciona color');
                } else {
                    console.log('⚠️ Sin colores, usando fallback');
                    loadFallbackColores();
                }
            } catch (e) {
                console.log('⚠️ Función get_colores no disponible');
                loadFallbackColores();
            }
            
            // Configurar dependencias entre selects
            setupCategoryDependencies();
            
            console.log('✅ Sistema 3FN cargado');
            
        } catch (error) {
            console.error('❌ Error al cargar sistema 3FN:', error);
            loadAllFallbacks();
        }
    }

    function populateSelect(selectId, options, placeholder) {
        const select = document.getElementById(selectId);
        if (!select || !options || options.length === 0) return;
        
        select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.nombre;
            if (option.descripcion) {
                optionElement.title = option.descripcion;
            }
            select.appendChild(optionElement);
        });
    }

    // Configurar dependencias entre selects (3FN)
    function setupCategoryDependencies() {
        const categoriaSelect = document.getElementById('categoria');
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        const estiloSelect = document.getElementById('estilo');
        
        if (categoriaSelect && tipoPrendaSelect) {
            categoriaSelect.addEventListener('change', async (e) => {
                const categoriaId = e.target.value;
                if (!categoriaId) {
                    resetSelect(tipoPrendaSelect, 'Selecciona tipo de prenda');
                    resetSelect(estiloSelect, 'Selecciona estilo');
                    return;
                }
                
                // Cargar tipos de prenda para esta categoría
                tipoPrendaSelect.classList.add('loading');
                tipoPrendaSelect.innerHTML = '<option value="">Cargando tipos de prenda...</option>';
                
                try {
                    const { data: tiposPrenda, error } = await supabase.rpc('get_tipos_prenda', { categoria_id: parseInt(categoriaId) });
                    
                    if (!error && tiposPrenda && tiposPrenda.length > 0) {
                        populateSelect('tipo-prenda', tiposPrenda, 'Selecciona tipo de prenda');
                    } else {
                        resetSelect(tipoPrendaSelect, 'Sin tipos de prenda disponibles');
                    }
                } catch (error) {
                    console.error('Error al cargar tipos de prenda:', error);
                    resetSelect(tipoPrendaSelect, 'Error cargando tipos');
                }
                
                tipoPrendaSelect.classList.remove('loading');
                resetSelect(estiloSelect, 'Primero selecciona tipo de prenda');
            });
        }
        
        if (tipoPrendaSelect && estiloSelect) {
            tipoPrendaSelect.addEventListener('change', async (e) => {
                const tipoPrendaId = e.target.value;
                if (!tipoPrendaId) {
                    resetSelect(estiloSelect, 'Selecciona estilo');
                    return;
                }
                
                // Cargar estilos para este tipo de prenda
                estiloSelect.classList.add('loading');
                estiloSelect.innerHTML = '<option value="">Cargando estilos...</option>';
                
                try {
                    const { data: estilos, error } = await supabase.rpc('get_estilos', { tipo_prenda_id: parseInt(tipoPrendaId) });
                    
                    if (!error && estilos && estilos.length > 0) {
                        populateSelect('estilo', estilos, 'Selecciona estilo (opcional)');
                    } else {
                        // No hay estilos para este tipo de prenda (normal en 3FN)
                        estiloSelect.innerHTML = '<option value="" selected>No hay estilos para este tipo</option>';
                    }
                } catch (error) {
                    console.error('Error al cargar estilos:', error);
                    estiloSelect.innerHTML = '<option value="" selected>Sin estilos disponibles</option>';
                }
                
                estiloSelect.classList.remove('loading');
            });
        }
    }

    function resetSelect(select, placeholder) {
        if (select) {
            select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        }
    }

    // Funciones fallback si las RPC no funcionan
    function loadFallbackCategorias() {
        const fallback = [
            { id: 1, nombre: 'Ropa Interior' },
            { id: 2, nombre: 'Calzado' },
            { id: 3, nombre: 'Tops' },
            { id: 4, nombre: 'Pantalones' },
            { id: 5, nombre: 'Vestidos' },
            { id: 6, nombre: 'Buzos' },
            { id: 7, nombre: 'Camperas' }
        ];
        populateSelect('categoria', fallback, 'Selecciona categoría');
    }

    function loadFallbackTelas() {
        const fallback = [
            { id: 1, nombre: 'Algodón' },
            { id: 2, nombre: 'Jean' },
            { id: 3, nombre: 'Seda' },
            { id: 4, nombre: 'Lycra' },
            { id: 5, nombre: 'Encaje' }
        ];
        populateSelect('tela', fallback, 'Selecciona tela');
    }

    function loadFallbackColores() {
        const fallback = [
            { id: 1, nombre: 'Negro' },
            { id: 2, nombre: 'Blanco' },
            { id: 3, nombre: 'Azul' },
            { id: 4, nombre: 'Rosa' },
            { id: 5, nombre: 'Verde' }
        ];
        populateSelect('color', fallback, 'Selecciona color');
    }

    function loadAllFallbacks() {
        loadFallbackCategorias();
        loadFallbackTelas();
        loadFallbackColores();
    }

    async function loadInitialData() {
        try {
            // Cargar productos desde la nueva vista
            const { data: products, error: productsError } = await supabase
                .from('vista_productos_completa')
                .select('*')
                .order('nombre', { ascending: true });

            if (productsError) throw productsError;

            // Cargar usuarios
            const { data: users, error: usersError } = await supabase
                .from('usuarios')
                .select('*')
                .order('created_at', { ascending: false });

            return {
                products: products || [],
                users: users || []
            };

        } catch (error) {
            console.error('Error loading initial data:', error);
            return null;
        }
    }

    function renderUI(data) {
        updateStats(data);
        renderProductsTable(data.products);
        renderUsersTable(data.users);
    }

    function updateStats(data) {
        if (DOMElements.totalUsers) {
            DOMElements.totalUsers.textContent = data.users.length;
        }
        if (DOMElements.totalProducts) {
            DOMElements.totalProducts.textContent = data.products.length;
        }
    }

    function renderProductsTable(products) {
        if (!DOMElements.productsTableBody) return;

        if (products.length === 0) {
            DOMElements.productsTableBody.innerHTML = `
                <tr><td colspan="7" class="no-data">No hay productos registrados</td></tr>
            `;
            return;
        }

        DOMElements.productsTableBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div class="product-info">
                        ${product.imagen_url ? `<img src="${product.imagen_url}" alt="${product.nombre}" class="product-thumb">` : ''}
                        <span>${product.nombre}</span>
                    </div>
                </td>
                <td>${product.categoria}</td>
                <td>${product.tipo_prenda}</td>
                <td>${product.estilo}</td>
                <td>${product.tela}</td>
                <td>$${parseFloat(product.precio).toFixed(2)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" data-id="${product.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" data-id="${product.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderUsersTable(users) {
        if (!DOMElements.usersTableBody) return;

        if (users.length === 0) {
            DOMElements.usersTableBody.innerHTML = `
                <tr><td colspan="8" class="no-data">No hay usuarios registrados</td></tr>
            `;
            return;
        }

        DOMElements.usersTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.nombre || 'N/A'}</td>
                <td>${user.apellido || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.telefono || 'N/A'}</td>
                <td>${user.direccion || 'N/A'}</td>
                <td>${user.departamento || 'N/A'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    function setupEventListeners(products, users) {
        // Event listeners para navegación, formularios, etc.
        // (código existente de event listeners)
        
        // Logout
        if (DOMElements.logoutButton) {
            DOMElements.logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabase.auth.signOut();
                window.location.href = 'login.html';
            });
        }
    }

    console.log('🎉 Admin panel con sistema 3FN inicializado');
});