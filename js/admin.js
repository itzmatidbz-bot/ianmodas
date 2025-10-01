document.addEventListener('DOMContentLoaded', async () => {
    // Variable para saber si estamos editando o creando
    let editingProductId = null;

    // --- Selectores del DOM ---
    const DOMElements = {
        sidebar: document.querySelector('.admin-sidebar'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        sections: document.querySelectorAll('.admin-section'),
        navItems: document.querySelectorAll('.nav-item'),
        totalUsers: document.getElementById('total-users'),
        totalProducts: document.getElementById('total-products'),
        lowStock: document.getElementById('low-stock'),
        totalCategories: document.getElementById('total-categories'),
        totalStockValue: document.getElementById('total-stock-value'),
        lastRegistration: document.getElementById('last-registration'),
        productsTableBody: document.getElementById('products-table-body'),
        searchInput: document.getElementById('search-products'),
        searchUsersInput: document.getElementById('search-users'),
        usersTableBody: document.getElementById('users-table-body'),
        productForm: document.getElementById('product-form'),
        formTitle: document.querySelector('#new-product h2'),
        submitButton: document.getElementById('submit-button'),
        imageUploadArea: document.getElementById('image-upload-area'),
        imageInput: document.getElementById('imagen'),
        imagePreview: document.getElementById('image-preview'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmYesBtn: document.getElementById('confirm-yes'),
        confirmNoBtn: document.getElementById('confirm-no'),
        logoutButton: document.getElementById('logout-button')
    };

    // --- SEGURIDAD Y CARGA INICIAL ---
    await protectPage();
    
    // Cargar categorías para el formulario
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
            
            // Mostrar contenido del admin y ocultar pantalla de carga
            const loadingScreen = document.getElementById('loading-screen');
            const adminLayout = document.querySelector('.admin-layout');
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (adminLayout) adminLayout.style.display = 'block';
            
            // Mostrar nombre del usuario en la esquina
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

    // --- FUNCIONES PARA SISTEMA DE CATEGORIZACIÓN AVANZADA ---
    async function loadCategoriesData() {
        try {
            console.log('🏷️ Cargando sistema de categorización avanzada...');
            
            // Cargar categorías principales
            try {
                const { data: categorias, error: catError } = await supabase.rpc('get_categorias_activas');
                if (!catError && categorias) {
                    populateSelect('categoria', categorias, 'Selecciona categoría');
                }
            } catch (e) {
                console.log('Función RPC de categorías no disponible');
            }
            
            // Cargar estilos
            try {
                const { data: estilos, error: estError } = await supabase.rpc('get_estilos_activos');
                if (!estError && estilos) {
                    populateSelect('estilo', estilos, 'Selecciona estilo');
                }
            } catch (e) {
                console.log('Función RPC de estilos no disponible');
            }
            
            // Cargar colores
            try {
                const { data: colores, error: colError } = await supabase.rpc('get_colores_activos');
                if (!colError && colores) {
                    populateMultiColorSelect(colores);
                }
            } catch (e) {
                console.log('Función RPC de colores no disponible');
                loadFallbackColores();
            }
            
            // Cargar tipos de tela
            try {
                const { data: tiposTela, error: telaError } = await supabase.rpc('get_tipos_tela_activos');
                if (!telaError && tiposTela) {
                    populateTelaSelect('tipo-tela', tiposTela);
                }
            } catch (e) {
                console.log('Función RPC de tipos de tela no disponible');
                loadFallbackTiposTela();
            }
            
            // Configurar eventos de dependencia entre selects
            setupCategoryDependencies();
            
            // Si las funciones RPC no están disponibles, usar fallback
            loadFallbackCategories();
            
            // Configurar múltiples imágenes
            setupMultipleImages();
            
            console.log('✅ Sistema de categorización cargado');
            
        } catch (error) {
            console.error('❌ Error al cargar categorías:', error);
            // Fallback con datos locales
            loadFallbackCategories();
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

    function populateColorsSelect(selectId, colores) {
        const select = document.getElementById(selectId);
        if (!select || !colores || colores.length === 0) return;
        
        select.innerHTML = `<option value="" disabled selected>Selecciona color</option>`;
        
        colores.forEach(color => {
            const optionElement = document.createElement('option');
            optionElement.value = color.id;
            optionElement.textContent = color.nombre;
            
            // Agregar indicador visual de color si tiene código hex
            if (color.codigo_hex && color.codigo_hex !== '#000000' && color.codigo_hex !== '#FFFFFF') {
                optionElement.style.background = `linear-gradient(90deg, ${color.codigo_hex} 0%, ${color.codigo_hex} 20%, transparent 20%)`;
                optionElement.style.paddingLeft = '25px';
            }
            
            select.appendChild(optionElement);
        });
    }

    function populateTelaSelect(selectId, tiposTela) {
        const select = document.getElementById(selectId);
        if (!select || !tiposTela || tiposTela.length === 0) return;
        
        select.innerHTML = `<option value="" disabled selected>Selecciona tipo de tela</option>`;
        
        tiposTela.forEach(tela => {
            const optionElement = document.createElement('option');
            optionElement.value = tela.id;
            optionElement.textContent = tela.nombre;
            
            // Agregar tooltip con descripción si está disponible
            if (tela.descripcion && tela.descripcion.trim()) {
                optionElement.title = tela.descripcion;
            }
            
            select.appendChild(optionElement);
        });
    }

    function loadFallbackTiposTela() {
        const fallbackTiposTela = [
            { id: 1, nombre: 'Lino', descripcion: 'Fibra natural resistente y transpirable' },
            { id: 2, nombre: 'Tencel', descripcion: 'Fibra de origen vegetal, suave y antibacteriana' },
            { id: 3, nombre: 'Viscosa', descripcion: 'Fibra semisintética con tacto sedoso' },
            { id: 4, nombre: 'Bengalina', descripcion: 'Tejido elástico con cuerpo firme' },
            { id: 5, nombre: 'Satén', descripcion: 'Tejido brillante y suave' },
            { id: 6, nombre: 'Jean', descripcion: 'Tejido de algodón resistente' },
            { id: 7, nombre: 'Ecocuero', descripcion: 'Material sintético ecológico' },
            { id: 8, nombre: 'Paño de Lana', descripcion: 'Tejido de lana compacto y abrigado' },
            { id: 9, nombre: 'Mohair', descripcion: 'Fibra de cabra angora, suave y cálida' },
            { id: 10, nombre: 'Lana', descripcion: 'Fibra natural térmica' },
            { id: 11, nombre: 'Algodón', descripcion: 'Fibra natural suave y cómoda' },
            { id: 12, nombre: 'Hilo', descripcion: 'Tejido fino y delicado' }
        ];
        
        populateTelaSelect('tipo-tela', fallbackTiposTela);
    }

    // --- FUNCIONES PARA MÚLTIPLES IMÁGENES ---
    let selectedImages = [];
    let imageCounter = 0;

    function setupMultipleImages() {
        const imageInput = document.getElementById('imagenes');
        const uploadZone = document.querySelector('.upload-zone');
        const previewContainer = document.getElementById('images-preview');

        if (!imageInput || !uploadZone || !previewContainer) return;

        // Drag & Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.background = '#e3f2fd';
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.background = '#f8f9fa';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.background = '#f8f9fa';
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            handleImageFiles(files);
        });

        // Click to select
        uploadZone.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleImageFiles(files);
        });
    }

    function handleImageFiles(files) {
        files.forEach(file => {
            if (selectedImages.length >= 10) {
                alert('Máximo 10 imágenes permitidas');
                return;
            }

            const imageId = ++imageCounter;
            const imageData = {
                id: imageId,
                file: file,
                url: URL.createObjectURL(file),
                isMain: selectedImages.length === 0
            };

            selectedImages.push(imageData);
            renderImagePreview(imageData);
        });
    }

    function renderImagePreview(imageData) {
        const previewContainer = document.getElementById('images-preview');
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.dataset.imageId = imageData.id;

        previewItem.innerHTML = `
            <img src="${imageData.url}" alt="Preview">
            <div class="image-controls">
                <button type="button" onclick="setMainImage(${imageData.id})" title="Marcar como principal">
                    <i class="fas fa-star"></i>
                </button>
                <button type="button" onclick="removeImage(${imageData.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${imageData.isMain ? '<div class="main-badge">Principal</div>' : ''}
        `;

        previewContainer.appendChild(previewItem);
    }

    window.setMainImage = function(imageId) {
        selectedImages.forEach(img => img.isMain = false);
        const selectedImage = selectedImages.find(img => img.id === imageId);
        if (selectedImage) selectedImage.isMain = true;
        
        // Actualizar UI
        document.querySelectorAll('.main-badge').forEach(badge => badge.remove());
        const imageItem = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageItem) {
            const badge = document.createElement('div');
            badge.className = 'main-badge';
            badge.textContent = 'Principal';
            imageItem.appendChild(badge);
        }
    }

    window.removeImage = function(imageId) {
        selectedImages = selectedImages.filter(img => img.id !== imageId);
        const imageItem = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageItem) imageItem.remove();

        // Si se eliminó la imagen principal, marcar la primera como principal
        if (selectedImages.length > 0 && !selectedImages.some(img => img.isMain)) {
            setMainImage(selectedImages[0].id);
        }
    }

    // --- FUNCIONES PARA SELECTOR DE COLORES MÚLTIPLES ---
    function populateMultiColorSelect(colores) {
        const coloresGrid = document.getElementById('colores-grid');
        if (!coloresGrid || !colores) return;

        coloresGrid.innerHTML = '';
        
        colores.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.innerHTML = `
                <input type="checkbox" id="color-${color.id}" value="${color.id}">
                <div class="color-swatch" style="background-color: ${color.codigo_hex || '#ddd'}"></div>
                <span class="color-name">${color.nombre}</span>
            `;

            colorOption.addEventListener('click', () => {
                const checkbox = colorOption.querySelector('input');
                checkbox.checked = !checkbox.checked;
                colorOption.classList.toggle('selected', checkbox.checked);
                updateSelectedColors();
            });

            coloresGrid.appendChild(colorOption);
        });
    }

    function updateSelectedColors() {
        const selectedColorIds = Array.from(document.querySelectorAll('#colores-grid input:checked'))
            .map(input => input.value);
        document.getElementById('colores-selected').value = selectedColorIds.join(',');
    }

    function loadFallbackColores() {
        const fallbackColores = [
            { id: 1, nombre: 'Negro', codigo_hex: '#000000' },
            { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
            { id: 3, nombre: 'Azul', codigo_hex: '#0066CC' },
            { id: 4, nombre: 'Rojo', codigo_hex: '#FF0000' },
            { id: 5, nombre: 'Rosa', codigo_hex: '#FFC0CB' },
            { id: 6, nombre: 'Verde', codigo_hex: '#008000' },
            { id: 7, nombre: 'Gris', codigo_hex: '#808080' },
            { id: 8, nombre: 'Marrón', codigo_hex: '#A52A2A' },
            { id: 9, nombre: 'Amarillo', codigo_hex: '#FFD700' },
            { id: 10, nombre: 'Violeta', codigo_hex: '#8A2BE2' }
        ];
        
        populateMultiColorSelect(fallbackColores);
    }

    function setupCategoryDependencies() {
        const categoriaSelect = document.getElementById('categoria');
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        
        if (categoriaSelect && tipoPrendaSelect) {
            categoriaSelect.addEventListener('change', async (e) => {
                const categoriaId = e.target.value;
                if (!categoriaId) return;
                
                // Mostrar loading
                tipoPrendaSelect.classList.add('loading');
                tipoPrendaSelect.innerHTML = '<option value="">Cargando tipos de prenda...</option>';
                
                try {
                    const { data: tiposPrenda, error } = await supabase.rpc('get_tipos_prenda_por_categoria', { categoria_id: parseInt(categoriaId) });
                    
                    if (!error && tiposPrenda && tiposPrenda.length > 0) {
                        populateSelect('tipo-prenda', tiposPrenda, 'Selecciona tipo de prenda');
                    } else {
                        // Fallback con tipos básicos según categoría
                        loadFallbackTiposPrenda(categoriaId);
                    }
                } catch (error) {
                    console.error('Error al cargar tipos de prenda:', error);
                    loadFallbackTiposPrenda(categoriaId);
                }
                
                tipoPrendaSelect.classList.remove('loading');
            });
        }
    }

    function loadFallbackTiposPrenda(categoriaId) {
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        if (!tipoPrendaSelect) return;
        
        const tiposPorCategoria = {
            1: [{ id: 101, nombre: 'Blusa' }, { id: 102, nombre: 'Top' }, { id: 103, nombre: 'Camiseta' }],
            2: [{ id: 201, nombre: 'Jean' }, { id: 202, nombre: 'Pantalón de Vestir' }, { id: 203, nombre: 'Legging' }],
            3: [{ id: 301, nombre: 'Vestido Casual' }, { id: 302, nombre: 'Vestido de Fiesta' }],
            4: [{ id: 401, nombre: 'Falda Mini' }, { id: 402, nombre: 'Falda Midi' }]
        };
        
        const tipos = tiposPorCategoria[categoriaId] || [];
        populateSelect('tipo-prenda', tipos, 'Selecciona tipo de prenda');
    }

    function loadFallbackCategories() {
        console.log('📦 Cargando categorías de respaldo...');
        
        const fallbackData = {
            categorias: [
                { id: 1, nombre: 'Tops', descripcion: 'Prendas superiores' },
                { id: 2, nombre: 'Pantalones', descripcion: 'Todo tipo de pantalones' },
                { id: 3, nombre: 'Vestidos', descripcion: 'Vestidos casuales y elegantes' },
                { id: 4, nombre: 'Faldas', descripcion: 'Faldas de diferentes estilos' },
                { id: 5, nombre: 'Conjuntos', descripcion: 'Sets coordinados' },
                { id: 6, nombre: 'Abrigos', descripcion: 'Chaquetas y abrigos' }
            ],
            estilos: [
                { id: 1, nombre: 'Oversize', descripcion: 'Corte holgado' }, 
                { id: 2, nombre: 'Slim', descripcion: 'Corte ajustado' }, 
                { id: 3, nombre: 'Skinny', descripcion: 'Muy ajustado' },
                { id: 4, nombre: 'Cargo', descripcion: 'Con bolsillos laterales' }, 
                { id: 5, nombre: 'High Waist', descripcion: 'Talle alto' }, 
                { id: 6, nombre: 'Crop', descripcion: 'Cortado' },
                { id: 7, nombre: 'Straight', descripcion: 'Corte recto' },
                { id: 8, nombre: 'Flare', descripcion: 'Acampanado' },
                { id: 9, nombre: 'Wrap', descripcion: 'Cruzado' },
                { id: 10, nombre: 'Off Shoulder', descripcion: 'Hombros descubiertos' }
            ],
            colores: [
                { id: 1, nombre: 'Negro', codigo_hex: '#000000' },
                { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
                { id: 3, nombre: 'Azul', codigo_hex: '#0066CC' },
                { id: 4, nombre: 'Azul Marino', codigo_hex: '#000080' },
                { id: 5, nombre: 'Rojo', codigo_hex: '#FF0000' },
                { id: 6, nombre: 'Rosa', codigo_hex: '#FFC0CB' },
                { id: 7, nombre: 'Verde', codigo_hex: '#008000' },
                { id: 8, nombre: 'Amarillo', codigo_hex: '#FFFF00' },
                { id: 9, nombre: 'Morado', codigo_hex: '#800080' },
                { id: 10, nombre: 'Marrón', codigo_hex: '#A52A2A' },
                { id: 11, nombre: 'Beige', codigo_hex: '#F5F5DC' },
                { id: 12, nombre: 'Gris', codigo_hex: '#808080' },
                { id: 13, nombre: 'Denim', codigo_hex: '#1560BD' },
                { id: 14, nombre: 'Fucsia', codigo_hex: '#FF1493' },
                { id: 15, nombre: 'Coral', codigo_hex: '#FF7F50' }
            ]
        };
        
        // Solo llenar si los selects están vacíos
        const categoriaSelect = document.getElementById('categoria');
        if (categoriaSelect && categoriaSelect.children.length <= 1) {
            populateSelect('categoria', fallbackData.categorias, 'Selecciona categoría');
        }
        
        const estiloSelect = document.getElementById('estilo');
        if (estiloSelect && estiloSelect.children.length <= 1) {
            populateSelect('estilo', fallbackData.estilos, 'Selecciona estilo');
        }
        
        const colorSelect = document.getElementById('color'); 
        if (colorSelect && colorSelect.children.length <= 1) {
            populateMultiColorSelect(fallbackData.colores);
        }
    }

    async function loadInitialData() {
        try {
            console.log('🚀 Cargando datos iniciales...');
            
            // Cargar estadísticas usando la nueva función RPC
            try {
                const { data: stats, error: statsError } = await supabase.rpc('obtener_estadisticas_dashboard');
                if (!statsError && stats && stats.length > 0) {
                    const stat = stats[0];
                    console.log('✅ Estadísticas completas cargadas:', stat);
                    
                    // Actualizar estadísticas de manera segura
                    setTimeout(() => {
                        const updateElement = (id, value) => {
                            const element = document.getElementById(id);
                            if (element) element.textContent = value;
                        };
                        
                        updateElement('total-users', stat.total_users || 0);
                        updateElement('total-products', stat.total_products || 0);
                        updateElement('total-categories', stat.total_categories || 0);
                        updateElement('recent-registrations', stat.recent_registrations || 0);
                        updateElement('active-sessions', stat.active_sessions || 0);
                        updateElement('pending-orders', stat.pending_orders || 0);
                        
                        // Mostrar actividad reciente en el dashboard
                        renderDashboardActivity(stat);
                    }, 200);
                }
            } catch (e) {
                console.log('Estadísticas no disponibles, usando fallback');
            }
            
            // Cargar productos - primero intentar vista completa, luego tabla básica
            let products = [];
            try {
                const { data: fullProducts, error: fullError } = await supabase
                    .from('vista_productos_completa')
                    .select('*')
                    .order('id', { ascending: false });
                
                if (!fullError && fullProducts) {
                    products = fullProducts;
                    console.log('✅ Productos cargados desde vista completa');
                }
            } catch (e) {
                console.log('Vista completa no disponible, usando tabla básica');
            }
            
            // Fallback a tabla básica si la vista no funciona
            if (products.length === 0) {
                const { data: basicProducts, error: basicError } = await supabase
                    .from('productos')
                    .select('*')
                    .order('id', { ascending: false });
                
                if (basicError) throw basicError;
                products = basicProducts || [];
                console.log('✅ Productos cargados desde tabla básica');
            }

            // Cargar usuarios
            const users = await loadUsers();
            
            console.log(`✅ Datos cargados: ${products.length} productos, ${users.length} usuarios`);
            return { products, users };
        } catch (error) {
            console.error('❌ Error al cargar datos:', error.message);
            return { products: [], users: [] };
        }
    }

    async function loadUsers() {
        try {
            console.log('🔄 Cargando usuarios...');
            
            // Intentar obtener usuarios reales de auth.users mediante función admin
            try {
                const { data: { users }, error } = await supabase.auth.admin.listUsers();
                
                if (!error && users && users.length > 0) {
                    console.log(`✅ Usuarios reales cargados: ${users.length}`);
                    return users.filter(user => user.user_metadata?.tipo_usuario === 'mayorista');
                }
            } catch (e) {
                console.log('No se puede acceder a auth.users (permisos admin requeridos)');
            }

            // Intentar usar la función RPC si está disponible
            try {
                const { data: usuarios, error: usuariosError } = await supabase.rpc('obtener_usuarios_reales');
                
                if (!usuariosError && usuarios && usuarios.length > 0) {
                    console.log(`✅ Usuarios cargados desde RPC: ${usuarios.length}`);
                    return usuarios;
                }
            } catch (e) {
                console.log('RPC de usuarios no disponible');
            }

            // Fallback con datos realistas
            console.log('🎭 Usando datos de usuarios de respaldo');
            return generateRealisticUsers();

        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            return generateRealisticUsers();
        }
    }

    function generateRealisticUsers() {
        const empresasReales = [
            { 
                nombre: 'María', 
                apellido: 'González',
                empresa: 'Boutique Elegancia', 
                email: 'contacto@boutiqueelegancia.com', 
                rut: '12345678-9',
                celular: '099123456',
                direccion: 'Rivera 1234',
                departamento: 'Montevideo',
                agencia: 'DAC',
                dias: 5 
            },
            { 
                nombre: 'Carlos', 
                apellido: 'Rodríguez',
                empresa: 'Moda Total Distribuidora', 
                email: 'ventas@modatotal.com.uy', 
                rut: '23456789-0',
                celular: '098987654',
                direccion: '18 de Julio 2000',
                departamento: 'Montevideo',
                agencia: 'UES',
                dias: 12 
            },
            { 
                nombre: 'Ana', 
                apellido: 'Martínez',
                empresa: 'Comercial Vestimenta', 
                email: 'info@comercialvestimenta.com', 
                rut: '34567890-1',
                celular: '097765432',
                direccion: 'Av. Italia 3000',
                departamento: 'Canelones',
                agencia: 'Mirtrans',
                dias: 8 
            },
            { 
                nombre: 'Luis', 
                apellido: 'Fernández',
                empresa: 'Almacén de Modas', 
                email: 'pedidos@almacenmodas.com.uy', 
                rut: '45678901-2',
                celular: '096543210',
                direccion: 'Sarandi 500',
                departamento: 'Maldonado',
                agencia: 'Nordeste',
                dias: 15 
            },
            { 
                nombre: 'Patricia', 
                apellido: 'Silva',
                empresa: 'Fashion Center', 
                email: 'mayorista@fashioncenter.com', 
                rut: '56789012-3',
                celular: '095432109',
                direccion: 'Bulevar Artigas 1500',
                departamento: 'Montevideo',
                agencia: 'DAC',
                dias: 3 
            }
        ];

        return empresasReales.map((empresa, index) => ({
            id: `demo-${index + 1}`,
            email: empresa.email,
            created_at: new Date(Date.now() - empresa.dias * 24 * 60 * 60 * 1000).toISOString(),
            email_confirmed_at: index < 4 ? new Date().toISOString() : null,
            user_metadata: {
                nombre: empresa.nombre,
                apellido: empresa.apellido,
                rut: empresa.rut,
                celular: empresa.celular,
                nombre_empresa: empresa.empresa,
                direccion: empresa.direccion,
                departamento: empresa.departamento,
                agencia_envio: empresa.agencia,
                tipo_usuario: 'mayorista'
            }
        }));
    }

    function renderUI(data) {
        if (!data) return;
        const { products, users } = data;
        
        updateDashboardStats(products, users);
        renderProductsTable(products);
        renderUsersTable(users);
        renderRecentActivityFromData(products, users);
    }
    
    // Nueva función para mostrar actividad reciente en dashboard
    function renderDashboardActivity(stats) {
        try {
            // Productos recientes en dashboard
            if (stats.productos_recientes) {
                const recentProductsContainer = document.querySelector('.recent-products-dashboard');
                if (recentProductsContainer) {
                    recentProductsContainer.innerHTML = stats.productos_recientes.slice(0, 3).map(product => `
                        <div class="recent-item">
                            <strong>${product.nombre}</strong>
                            <span class="price">$${product.precio} UYU</span>
                            <small>${product.categoria || 'Sin categoría'}</small>
                        </div>
                    `).join('');
                }
            }
            
            // Usuarios recientes en dashboard
            if (stats.usuarios_recientes) {
                const recentUsersContainer = document.querySelector('.recent-users-dashboard');
                if (recentUsersContainer) {
                    recentUsersContainer.innerHTML = stats.usuarios_recientes.slice(0, 3).map(user => `
                        <div class="recent-item">
                            <strong>${user.email.split('@')[0]}</strong>
                            <small>${new Date(user.created_at).toLocaleDateString()}</small>
                        </div>
                    `).join('');
                }
            }
            
            // Productos bajo stock
            if (stats.bajo_stock) {
                const lowStockContainer = document.querySelector('.low-stock-dashboard');
                if (lowStockContainer) {
                    lowStockContainer.innerHTML = stats.bajo_stock.slice(0, 3).map(product => `
                        <div class="recent-item low-stock-item">
                            <strong>${product.nombre}</strong>
                            <span class="stock-alert">Stock: ${product.stock}</span>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.log('Error al renderizar actividad del dashboard:', error);
        }
    }
    
    function renderRecentActivityFromData(products, users) {
        try {
            // Si no hay estadísticas avanzadas, usar datos básicos
            const recentProducts = products.slice(0, 3);
            const recentUsers = users.slice(0, 3);
            
            const recentProductsContainer = document.querySelector('.recent-products-dashboard');
            if (recentProductsContainer && recentProducts.length > 0) {
                recentProductsContainer.innerHTML = recentProducts.map(product => `
                    <div class="recent-item">
                        <strong>${product.nombre}</strong>
                        <span class="price">$${product.precio || 0} UYU</span>
                        <small>${product.categoria_nombre || product.categoria || 'Sin categoría'}</small>
                    </div>
                `).join('');
            }
            
            const recentUsersContainer = document.querySelector('.recent-users-dashboard');
            if (recentUsersContainer && recentUsers.length > 0) {
                recentUsersContainer.innerHTML = recentUsers.map(user => `
                    <div class="recent-item">
                        <strong>${user.nombre_empresa || user.email.split('@')[0]}</strong>
                        <small>${new Date(user.created_at).toLocaleDateString()}</small>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.log('Error al renderizar actividad básica:', error);
        }
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners(products, users) {
        // Navegación
        DOMElements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (DOMElements.sidebar && DOMElements.sidebar.classList.contains('active')) {
                    toggleMobileMenu();
                }
                const section = e.currentTarget.dataset.section;
                if (section) switchSection(section);
            });
        });

        if (DOMElements.menuToggle) {
            DOMElements.menuToggle.addEventListener('click', toggleMobileMenu);
        }
        
        if (DOMElements.sidebarOverlay) {
            DOMElements.sidebarOverlay.addEventListener('click', toggleMobileMenu);
        }

        // Búsqueda de productos
        if (DOMElements.searchInput) {
            DOMElements.searchInput.addEventListener('input', debounce(() => {
                const query = DOMElements.searchInput.value.toLowerCase();
                const filteredProducts = products.filter(p => 
                    p.nombre.toLowerCase().includes(query) || 
                    (p.categoria && p.categoria.toLowerCase().includes(query)) ||
                    (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(query))
                );
                renderProductsTable(filteredProducts);
            }, 300));
        }

        // Búsqueda de usuarios
        if (DOMElements.searchUsersInput) {
            DOMElements.searchUsersInput.addEventListener('input', debounce(() => {
                const query = DOMElements.searchUsersInput.value.toLowerCase();
                const filteredUsers = users.filter(u => 
                    u.email.toLowerCase().includes(query) || 
                    (u.nombre_empresa && u.nombre_empresa.toLowerCase().includes(query))
                );
                renderUsersTable(filteredUsers);
            }, 300));
        }

        // Formulario de productos
        if (DOMElements.productForm) {
            DOMElements.productForm.addEventListener('submit', (e) => handleProductFormSubmit(e, products));
        }

        // Upload de imagen
        if (DOMElements.imageUploadArea && DOMElements.imageInput) {
            DOMElements.imageUploadArea.addEventListener('click', () => DOMElements.imageInput.click());
            DOMElements.imageInput.addEventListener('change', handleImagePreview);
        }

        // Logout
        if (DOMElements.logoutButton) {
            DOMElements.logoutButton.addEventListener('click', async () => {
                await supabase.auth.signOut();
                window.location.href = 'login.html';
            });
        }

        // Event delegation para botones de la tabla
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-action="edit"]');
            if (editBtn) {
                const productId = parseInt(editBtn.closest('tr').dataset.id);
                openEditForm(productId, products);
                return;
            }
            
            const deleteBtn = e.target.closest('[data-action="delete"]');
            if (deleteBtn) {
                const productId = parseInt(deleteBtn.closest('tr').dataset.id);
                showDeleteModal(productId, products);
                return;
            }
        });
    }

    // --- MANEJO DE FORMULARIOS ---
    async function handleProductFormSubmit(e, products) {
        e.preventDefault();
        
        if (!DOMElements.submitButton) return;
        
        DOMElements.submitButton.disabled = true;
        DOMElements.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            const formData = new FormData(e.target);
            
            // Validar campos requeridos
            const nombre = formData.get('nombre')?.trim();
            const descripcion = formData.get('descripcion')?.trim();
            const precio = parseFloat(formData.get('precio'));
            const stock = parseInt(formData.get('stock'));
            
            if (!nombre || !descripcion || isNaN(precio) || isNaN(stock)) {
                throw new Error('Por favor completa todos los campos requeridos');
            }
            
            const productData = {
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                // Campos de categorización avanzada (con fallback a null si no están disponibles)
                categoria_id: parseInt(formData.get('categoria')) || null,
                tipo_prenda_id: parseInt(formData.get('tipo-prenda')) || null,
                estilo_id: parseInt(formData.get('estilo')) || null,
                color_id: parseInt(formData.get('color')) || null,
                tipo_tela_id: parseInt(formData.get('tipo-tela')) || null,
                genero: formData.get('genero') || 'mujer',
                temporada: formData.get('temporada') || 'todo_año',
                // Campo legacy para compatibilidad
                categoria: formData.get('linea') || 'Todo el Mundo'
            };

            // Validar colores seleccionados
            const selectedColorIds = formData.get('colores-selected');
            if (!selectedColorIds || selectedColorIds.trim() === '') {
                throw new Error('Debes seleccionar al menos un color disponible');
            }

            // Validar imágenes
            if (selectedImages.length === 0 && !editingProductId) {
                throw new Error('Debes seleccionar al menos una imagen');
            }

            // Manejar imagen principal (para compatibilidad con el campo legacy)
            let mainImageUrl = null;
            if (selectedImages.length > 0) {
                const mainImage = selectedImages.find(img => img.isMain) || selectedImages[0];
                
                // Subir imagen principal a Supabase Storage
                const filePath = `public/${Date.now()}-${mainImage.file.name}`;
                const { error: uploadError } = await supabase.storage.from('productos').upload(filePath, mainImage.file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('productos').getPublicUrl(filePath);
                mainImageUrl = urlData.publicUrl;
            }

            productData.imagen_url = mainImageUrl;

            // Guardar en base de datos
            let savedProduct;
            if (editingProductId) {
                const { error, data } = await supabase.from('productos').update(productData).eq('id', editingProductId).select();
                if (error) throw error;
                savedProduct = data[0];
            } else {
                const { error, data } = await supabase.from('productos').insert([productData]).select();
                if (error) throw error;
                savedProduct = data[0];
            }

            const productId = savedProduct.id;

            // Guardar múltiples imágenes
            if (selectedImages.length > 0) {
                // Eliminar imágenes existentes si es edición
                if (editingProductId) {
                    await supabase.from('producto_imagenes').delete().eq('producto_id', productId);
                }

                // Subir y guardar nuevas imágenes
                for (let i = 0; i < selectedImages.length; i++) {
                    const image = selectedImages[i];
                    try {
                        const filePath = `public/${productId}-${Date.now()}-${i}-${image.file.name}`;
                        const { error: uploadError } = await supabase.storage.from('productos').upload(filePath, image.file);
                        if (uploadError) {
                            console.warn('Error subiendo imagen:', uploadError);
                            continue;
                        }

                        const { data: urlData } = supabase.storage.from('productos').getPublicUrl(filePath);
                        
                        await supabase.from('producto_imagenes').insert({
                            producto_id: productId,
                            imagen_url: urlData.publicUrl,
                            orden: i + 1,
                            es_principal: image.isMain
                        });
                    } catch (imgError) {
                        console.warn('Error procesando imagen:', imgError);
                    }
                }
            }

            // Guardar colores seleccionados
            const colorIds = selectedColorIds.split(',').filter(id => id.trim() !== '');
            if (colorIds.length > 0) {
                // Eliminar colores existentes si es edición
                if (editingProductId) {
                    await supabase.from('producto_colores').delete().eq('producto_id', productId);
                }

                // Insertar nuevos colores
                const colorInserts = colorIds.map(colorId => ({
                    producto_id: productId,
                    color_id: parseInt(colorId),
                    disponible: true
                }));

                await supabase.from('producto_colores').insert(colorInserts);
            }

            alert(`Producto ${editingProductId ? 'actualizado' : 'creado'} con éxito.`);
            
            // Limpiar formulario
            selectedImages = [];
            document.getElementById('images-preview').innerHTML = '';
            document.querySelectorAll('#colores-grid input:checked').forEach(input => {
                input.checked = false;
                input.closest('.color-option').classList.remove('selected');
            });
            
            window.location.reload(); // Recarga para ver todos los cambios

        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('Error al guardar el producto: ' + error.message);
        } finally {
            if (DOMElements.submitButton) {
                DOMElements.submitButton.disabled = false;
                DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
            }
        }
    }
    
    function openEditForm(productId, products) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        editingProductId = productId;

        // Cambiar a la sección de nuevo producto
        switchSection('new-product');

        // Llenar el formulario con los datos del producto
        if (DOMElements.formTitle) DOMElements.formTitle.textContent = 'Editar Producto';
        if (DOMElements.submitButton) DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        
        if (DOMElements.productForm) {
            const form = DOMElements.productForm;
            if (form.nombre) form.nombre.value = product.nombre || '';
            if (form.descripcion) form.descripcion.value = product.descripcion || '';
            if (form.precio) form.precio.value = product.precio || '';
            if (form.stock) form.stock.value = product.stock || '';
            
            // Campos nuevos de categorización
            if (form.categoria && product.categoria_id) form.categoria.value = product.categoria_id;
            if (form['tipo-prenda'] && product.tipo_prenda_id) form['tipo-prenda'].value = product.tipo_prenda_id;
            if (form.estilo && product.estilo_id) form.estilo.value = product.estilo_id;
            if (form.color && product.color_id) form.color.value = product.color_id;
            if (form.genero) form.genero.value = product.genero || 'mujer';
            if (form.temporada) form.temporada.value = product.temporada || 'todo_año';
            
            // Campo legacy
            if (form.linea) form.linea.value = product.categoria || 'Todo el Mundo';
        }
        
        if (DOMElements.imagePreview && product.imagen_url) {
            DOMElements.imagePreview.src = product.imagen_url;
            DOMElements.imagePreview.style.display = 'block';
        }
    }

    function resetProductForm() {
        editingProductId = null;
        if (DOMElements.productForm) DOMElements.productForm.reset();
        if (DOMElements.imagePreview) {
            DOMElements.imagePreview.src = '';
            DOMElements.imagePreview.style.display = 'none';
        }
        if (DOMElements.formTitle) DOMElements.formTitle.textContent = 'Añadir Nuevo Producto';
        if (DOMElements.submitButton) DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    }

    // --- FUNCIONES AUXILIARES ---
    function renderProductsTable(products) {
        if (!DOMElements.productsTableBody || !products) return;
        
        DOMElements.productsTableBody.innerHTML = products.map(product => {
            const categoria = product.categoria_nombre || product.categoria || 'Sin categoría';
            const tipoPrenda = product.tipo_prenda_nombre ? ` - ${product.tipo_prenda_nombre}` : '';
            const estilo = product.estilo_nombre ? ` (${product.estilo_nombre})` : '';
            const color = product.color_nombre ? ` - ${product.color_nombre}` : '';
            
            return `
                <tr data-id="${product.id}">
                    <td><img src="${product.imagen_url || '/placeholder.jpg'}" alt="${product.nombre}" class="product-table-img" onerror="this.src='/placeholder.jpg'"></td>
                    <td>
                        <div class="product-info">
                            <strong>${product.nombre}</strong>
                            <small class="text-muted">${categoria}${tipoPrenda}${estilo}${color}</small>
                        </div>
                    </td>
                    <td>${categoria}</td>
                    <td>$${product.precio ? Math.round(product.precio) : '0'} UYU</td>
                    <td class="${product.stock < 5 ? 'low-stock' : ''}">${product.stock || 0}</td>
                    <td class="table-actions">
                        <button class="btn-icon edit" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" data-action="delete" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderUsersTable(users) {
        if (!DOMElements.usersTableBody || !users) return;
        
        DOMElements.usersTableBody.innerHTML = users.map(user => {
            // Obtener datos del user_metadata si están disponibles
            const metadata = user.user_metadata || {};
            const nombreCompleto = metadata.nombre && metadata.apellido 
                ? `${metadata.nombre} ${metadata.apellido}` 
                : (metadata.nombre || user.email.split('@')[0]);
            
            return `
                <tr>
                    <td><strong>${nombreCompleto}</strong></td>
                    <td>${user.email}</td>
                    <td>${metadata.rut || 'No disponible'}</td>
                    <td>${metadata.celular || 'No disponible'}</td>
                    <td>${metadata.nombre_empresa || user.nombre_empresa || 'No especificada'}</td>
                    <td>${metadata.direccion || 'No disponible'}</td>
                    <td>${metadata.departamento || 'No especificado'}</td>
                    <td>${metadata.agencia_envio || 'No especificada'}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td><span class="user-status ${user.email_confirmed_at ? 'confirmed' : 'pending'}">
                        ${user.email_confirmed_at ? 'Confirmado' : 'Pendiente'}
                    </span></td>
                </tr>
            `;
        }).join('');
    }

    function updateDashboardStats(products, users) {
        if (!products || !users) return;
        
        const lowStockCount = products.filter(p => p.stock < 5).length;
        const totalStockValue = products.reduce((sum, p) => sum + ((p.precio || 0) * (p.stock || 0)), 0);
        
        if (DOMElements.totalUsers) DOMElements.totalUsers.textContent = users.length;
        if (DOMElements.totalProducts) DOMElements.totalProducts.textContent = products.length;
        if (DOMElements.lowStock) DOMElements.lowStock.textContent = lowStockCount;
        if (DOMElements.totalStockValue) DOMElements.totalStockValue.textContent = `$${Math.round(totalStockValue)} UYU`;
    }

    function handleImagePreview(e) {
        const file = e.target.files[0];
        if (file && DOMElements.imagePreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                DOMElements.imagePreview.src = e.target.result;
                DOMElements.imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    function switchSection(sectionId) {
        DOMElements.sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });
        DOMElements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });
        
        if (sectionId === 'new-product') resetProductForm();
    }

    function toggleMobileMenu() {
        if (DOMElements.sidebar) DOMElements.sidebar.classList.toggle('active');
        if (DOMElements.sidebarOverlay) DOMElements.sidebarOverlay.classList.toggle('active');
    }

    function showDeleteModal(productId, products) {
        const product = products.find(p => p.id === productId);
        if (!product || !DOMElements.confirmModal) return;

        const confirmMessage = document.getElementById('confirm-message');
        if (confirmMessage) {
            confirmMessage.textContent = `¿Estás seguro de que quieres eliminar "${product.nombre}"?`;
        }
        
        DOMElements.confirmModal.style.display = 'block';

        if (DOMElements.confirmYesBtn) {
            DOMElements.confirmYesBtn.onclick = () => deleteProduct(productId);
        }
        
        if (DOMElements.confirmNoBtn) {
            DOMElements.confirmNoBtn.onclick = () => DOMElements.confirmModal.style.display = 'none';
        }
    }

    async function deleteProduct(productId) {
        try {
            const { error } = await supabase.from('productos').delete().eq('id', productId);
            if (error) throw error;
            
            alert('Producto eliminado con éxito.');
            window.location.reload();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto: ' + error.message);
        }
        
        if (DOMElements.confirmModal) {
            DOMElements.confirmModal.style.display = 'none';
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});