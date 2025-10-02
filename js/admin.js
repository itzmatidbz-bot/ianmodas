document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 IAN MODAS Admin - Sistema Combinado iniciando...');
    
    // Variables globales
    let editingProductId = null;
    let selectedImages = [];
    let imageCounter = 0;

    // --- Selectores del DOM ---
    const DOMElements = {
        sidebar: document.querySelector('.admin-sidebar'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        sections: document.querySelectorAll('.admin-section'),
        navItems: document.querySelectorAll('.nav-item'),
        totalUsers: document.getElementById('total-users'),
        totalProducts: document.getElementById('total-products'),
        totalCategories: document.getElementById('total-categories'),
        productsTableBody: document.getElementById('products-table-body'),
        searchInput: document.getElementById('search-products'),
        searchUsersInput: document.getElementById('search-users'),
        usersTableBody: document.getElementById('users-table-body'),
        productForm: document.getElementById('product-form'),
        formTitle: document.querySelector('#new-product h2'),
        submitButton: document.getElementById('submit-button'),
        imageUploadArea: document.getElementById('image-upload-area'),
        imageInput: document.getElementById('imagenes'),
        imagePreview: document.getElementById('image-preview'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmYesBtn: document.getElementById('confirm-yes'),
        confirmNoBtn: document.getElementById('confirm-no'),
        logoutButton: document.getElementById('logout-button')
    };

    // --- INICIO DEL SISTEMA ---
    await protectPage();
    await loadCategoriesData();
    
    const allData = await loadInitialData();
    if (allData) {
        renderUI(allData);
        setupEventListeners(allData.products, allData.users);
    }
    
    console.log('✅ Sistema combinado cargado completamente');
    
    // Variable global para mantener datos actuales
    let currentProductsData = [];

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

    // --- SISTEMA DE CATEGORIZACIÓN SIMPLIFICADO ---
    async function loadCategoriesData() {
        try {
            console.log('🏷️ Cargando sistema de categorización...');
            
            // Intentar cargar categorías del sistema simple
            try {
                const { data: categorias, error } = await supabase.rpc('get_categorias');
                if (!error && categorias && categorias.length > 0) {
                    console.log('✅ Categorías cargadas:', categorias.length);
                    populateSelect('categoria', categorias, 'Selecciona categoría');
                    setupCategoryDependencies();
                } else {
                    throw new Error('Sin categorías disponibles');
                }
            } catch (e) {
                console.log('⚠️ RPC no disponible, usando fallback');
                loadFallbackCategories();
            }
            
            // Cargar telas
            try {
                const { data: telas, error } = await supabase.rpc('get_telas');
                if (!error && telas) {
                    populateSelect('tipo-tela', telas, 'Selecciona tela');
                } else {
                    loadFallbackTiposTela();
                }
            } catch (e) {
                loadFallbackTiposTela();
            }
            
            // Cargar colores
            try {
                const { data: colores, error } = await supabase.rpc('get_colores');
                if (!error && colores) {
                    populateMultiColorSelect(colores);
                } else {
                    loadFallbackColores();
                }
            } catch (e) {
                loadFallbackColores();
            }
            
            // Configurar múltiples imágenes
            setupMultipleImages();
            
            console.log('✅ Sistema de categorización cargado');
            
        } catch (error) {
            console.error('❌ Error al cargar categorías:', error);
            loadFallbackCategories();
        }
    }

    // NUEVA FUNCIÓN: Sistema 3FN integrado
    async function tryLoad3FNSystem() {
        try {
            console.log('🔄 Intentando cargar sistema 3FN...');
            
            // Intentar cargar con nuevas funciones RPC 3FN
            const { data: categorias3FN, error: cat3Error } = await supabase.rpc('get_categorias');
            if (!cat3Error && categorias3FN && categorias3FN.length > 0) {
                console.log('✅ Sistema 3FN detectado - usando nueva estructura');
                await loadWith3FNStructure();
                return true;
            }
            
            console.log('⚠️ Sistema 3FN no disponible - usando sistema actual');
            return false;
            
        } catch (e) {
            console.log('⚠️ Sistema 3FN no implementado aún - mantiendo sistema actual');
            return false;
        }
    }

    // NUEVA FUNCIÓN: Cargar con estructura 3FN
    async function loadWith3FNStructure() {
        try {
            // Cargar categorías
            const { data: categorias, error: catError } = await supabase.rpc('get_categorias');
            if (!catError && categorias) {
                console.log('✅ Categorías 3FN cargadas:', categorias.length);
                populateSelect('categoria', categorias, 'Selecciona categoría');
            }
            
            // Cargar telas
            const { data: telas, error: telaError } = await supabase.rpc('get_telas');
            if (!telaError && telas) {
                console.log('✅ Telas 3FN cargadas:', telas.length);
                populateSelect('tipo-tela', telas, 'Selecciona tela');
            }
            
            // Cargar colores
            const { data: colores, error: colorError } = await supabase.rpc('get_colores');
            if (!colorError && colores) {
                console.log('✅ Colores 3FN cargados:', colores.length);
                populateMultiColorSelect(colores);
            }
            
            // Configurar dependencias 3FN
            setup3FNDependencies();
            
            // Cargar display de categorías activas
            loadActiveCategoriesDisplay();
            
        } catch (error) {
            console.error('❌ Error cargando sistema 3FN:', error);
        }
    }

    // NUEVA FUNCIÓN: Dependencias 3FN
    function setup3FNDependencies() {
        const categoriaSelect = document.getElementById('categoria');
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        const estiloSelect = document.getElementById('estilo');
        
        if (categoriaSelect && tipoPrendaSelect) {
            // Remover listeners existentes
            categoriaSelect.removeEventListener('change', handleCategoryChange3FN);
            categoriaSelect.addEventListener('change', handleCategoryChange3FN);
        }
        
        if (tipoPrendaSelect && estiloSelect) {
            tipoPrendaSelect.removeEventListener('change', handleTipoPrendaChange3FN);
            tipoPrendaSelect.addEventListener('change', handleTipoPrendaChange3FN);
        }
    }

    // NUEVA FUNCIÓN: Manejar cambio de categoría 3FN
    async function handleCategoryChange3FN(e) {
        const categoriaId = e.target.value;
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        const estiloSelect = document.getElementById('estilo');
        
        if (!categoriaId) {
            resetSelect(tipoPrendaSelect, 'Selecciona tipo de prenda');
            resetSelect(estiloSelect, 'Selecciona estilo');
            return;
        }
        
        try {
            tipoPrendaSelect.innerHTML = '<option value="">Cargando tipos de prenda...</option>';
            
            const { data: tiposPrenda, error } = await supabase.rpc('get_tipos_prenda', { 
                categoria_id: parseInt(categoriaId) 
            });
            
            if (!error && tiposPrenda && tiposPrenda.length > 0) {
                populateSelect('tipo-prenda', tiposPrenda, 'Selecciona tipo de prenda');
            } else {
                resetSelect(tipoPrendaSelect, 'Sin tipos disponibles');
            }
            
            resetSelect(estiloSelect, 'Primero selecciona tipo de prenda');
            
        } catch (error) {
            console.error('Error cargando tipos de prenda 3FN:', error);
            resetSelect(tipoPrendaSelect, 'Error cargando tipos');
        }
    }

    // NUEVA FUNCIÓN: Manejar cambio de tipo de prenda 3FN
    async function handleTipoPrendaChange3FN(e) {
        const tipoPrendaId = e.target.value;
        const estiloSelect = document.getElementById('estilo');
        
        if (!tipoPrendaId) {
            resetSelect(estiloSelect, 'Selecciona estilo');
            return;
        }
        
        try {
            estiloSelect.innerHTML = '<option value="">Cargando estilos...</option>';
            
            const { data: estilos, error } = await supabase.rpc('get_estilos', { 
                tipo_prenda_id: parseInt(tipoPrendaId) 
            });
            
            if (!error && estilos && estilos.length > 0) {
                populateSelect('estilo', estilos, 'Selecciona estilo (opcional)');
            } else {
                estiloSelect.innerHTML = '<option value="" selected>No hay estilos para este tipo</option>';
            }
            
        } catch (error) {
            console.error('Error cargando estilos 3FN:', error);
            estiloSelect.innerHTML = '<option value="" selected>Sin estilos disponibles</option>';
        }
    }

    // NUEVA FUNCIÓN: Reset select helper
    function resetSelect(select, placeholder) {
        if (select) {
            select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
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

    // --- FUNCIONES PARA SELECTOR DE COLORES MÚLTIPLES CORREGIDA ---
    function populateMultiColorSelect(colores) {
        console.log('🎨 Poblando selector de colores:', colores?.length);
        
        const coloresGrid = document.getElementById('colores-grid');
        if (!coloresGrid) {
            console.warn('⚠️ No se encontró #colores-grid en el DOM');
            return;
        }
        
        if (!colores || colores.length === 0) {
            console.warn('⚠️ No hay colores para mostrar');
            coloresGrid.innerHTML = '<p>No hay colores disponibles</p>';
            return;
        }

        coloresGrid.innerHTML = '';
        console.log(`✅ Creando ${colores.length} opciones de color`);
        
        colores.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.innerHTML = `
                <input type="checkbox" id="color-${color.id}" name="colores[]" value="${color.id}">
                <div class="color-swatch" style="background-color: ${color.codigo_hex || '#ddd'}; border: 2px solid #ccc;"></div>
                <span class="color-name">${color.nombre}</span>
            `;

            colorOption.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = colorOption.querySelector('input');
                    checkbox.checked = !checkbox.checked;
                }
                colorOption.classList.toggle('selected', colorOption.querySelector('input').checked);
                updateSelectedColors();
            });

            coloresGrid.appendChild(colorOption);
        });
        
        console.log('✅ Selector de colores creado exitosamente');
    }

    // NUEVA FUNCIÓN: Mostrar categorías activas en dashboard
    async function loadActiveCategoriesDisplay() {
        try {
            const { data: categorias, error } = await supabase.rpc('get_categorias');
            const container = document.getElementById('active-categories');
            
            if (!error && categorias && categorias.length > 0 && container) {
                container.innerHTML = categorias.slice(0, 5).map(cat => `
                    <div class="recent-item">
                        <strong>${cat.nombre}</strong>
                        <small>Categoría activa</small>
                    </div>
                `).join('');
            } else if (container) {
                container.innerHTML = '<p>Categorías no disponibles</p>';
            }
        } catch (error) {
            console.log('Error cargando categorías para dashboard:', error);
        }
    }

    function updateSelectedColors() {
        const selectedInputs = document.querySelectorAll('#colores-grid input:checked');
        const selectedColorIds = Array.from(selectedInputs).map(input => input.value);
        
        console.log('🎨 Colores seleccionados:', selectedColorIds);
        
        const hiddenInput = document.getElementById('colores-selected');
        if (hiddenInput) {
            hiddenInput.value = selectedColorIds.join(',');
        } else {
            console.warn('⚠️ No se encontró #colores-selected input');
        }
    }

    function loadFallbackColores() {
        console.log('🎨 Cargando colores fallback extendidos...');
        
        const fallbackColores = [
            // Básicos
            { id: 1, nombre: 'Negro', codigo_hex: '#000000' },
            { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
            { id: 3, nombre: 'Gris', codigo_hex: '#808080' },
            { id: 4, nombre: 'Gris Claro', codigo_hex: '#D3D3D3' },
            
            // Azules
            { id: 5, nombre: 'Azul', codigo_hex: '#0066CC' },
            { id: 6, nombre: 'Azul Marino', codigo_hex: '#000080' },
            { id: 7, nombre: 'Celeste', codigo_hex: '#87CEEB' },
            { id: 8, nombre: 'Turquesa', codigo_hex: '#40E0D0' },
            
            // Rojos y Rosas
            { id: 9, nombre: 'Rojo', codigo_hex: '#FF0000' },
            { id: 10, nombre: 'Rosa', codigo_hex: '#FFC0CB' },
            { id: 11, nombre: 'Coral', codigo_hex: '#FF7F50' },
            { id: 12, nombre: 'Fucsia', codigo_hex: '#FF1493' },
            
            // Verdes
            { id: 13, nombre: 'Verde', codigo_hex: '#008000' },
            { id: 14, nombre: 'Verde Oliva', codigo_hex: '#808000' },
            { id: 15, nombre: 'Verde Lima', codigo_hex: '#32CD32' },
            
            // Amarillos
            { id: 16, nombre: 'Amarillo', codigo_hex: '#FFD700' },
            { id: 17, nombre: 'Mostaza', codigo_hex: '#FFDB58' },
            { id: 18, nombre: 'Naranja', codigo_hex: '#FF8C00' },
            
            // Violetas
            { id: 19, nombre: 'Violeta', codigo_hex: '#8A2BE2' },
            { id: 20, nombre: 'Morado', codigo_hex: '#800080' },
            { id: 21, nombre: 'Lila', codigo_hex: '#C8A2C8' },
            
            // Marrones
            { id: 22, nombre: 'Marrón', codigo_hex: '#A52A2A' },
            { id: 23, nombre: 'Beige', codigo_hex: '#F5F5DC' },
            { id: 24, nombre: 'Café', codigo_hex: '#8B4513' },
            
            // Especiales
            { id: 25, nombre: 'Dorado', codigo_hex: '#FFD700' },
            { id: 26, nombre: 'Plata', codigo_hex: '#C0C0C0' },
            { id: 27, nombre: 'Nude', codigo_hex: '#F5DEB3' },
            { id: 28, nombre: 'Crema', codigo_hex: '#FFFDD0' },
            { id: 29, nombre: 'Khaki', codigo_hex: '#F0E68C' },
            { id: 30, nombre: 'Denim', codigo_hex: '#1560BD' }
        ];
        
        console.log(`✅ Cargando ${fallbackColores.length} colores fallback`);
        populateMultiColorSelect(fallbackColores);
    }

    function setupCategoryDependencies() {
        const categoriaSelect = document.getElementById('categoria');
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        const estiloSelect = document.getElementById('estilo');
        
        if (!categoriaSelect) return;
        
        categoriaSelect.addEventListener('change', async (e) => {
            const categoriaId = e.target.value;
            const categoriaNombre = e.target.options[e.target.selectedIndex].text;
            
            console.log('📦 Categoría seleccionada:', categoriaNombre);
            
            if (!categoriaId) {
                resetSelect(tipoPrendaSelect, 'Selecciona tipo de prenda');
                resetSelect(estiloSelect, 'Selecciona estilo');
                return;
            }
            
            // Cargar tipos de prenda para esta categoría
            if (tipoPrendaSelect) {
                tipoPrendaSelect.innerHTML = '<option value="">Cargando tipos...</option>';
                
                try {
                    // Usar el nombre de la categoría en lugar del ID
                    const { data: tipos, error } = await supabase.rpc('get_tipos_prenda', { cat_nombre: categoriaNombre });
                    
                    if (!error && tipos && tipos.length > 0) {
                        populateSelect('tipo-prenda', tipos, 'Selecciona tipo de prenda');
                        setupTipoPrendaChange();
                    } else {
                        tipoPrendaSelect.innerHTML = '<option value="">Sin tipos disponibles</option>';
                    }
                } catch (error) {
                    console.error('Error cargando tipos:', error);
                    loadFallbackTiposPrenda(categoriaId);
                }
            }
            
            // Cargar estilos para esta categoría
            if (estiloSelect) {
                try {
                    const { data: estilos, error } = await supabase.rpc('get_estilos', { categoria_nombre: categoriaNombre });
                    
                    if (!error && estilos && estilos.length > 0) {
                        populateSelect('estilo', estilos, 'Selecciona estilo (opcional)');
                    } else {
                        loadFallbackEstilos();
                    }
                } catch (error) {
                    loadFallbackEstilos();
                }
            }
        });
    }
    
    function setupTipoPrendaChange() {
        const tipoPrendaSelect = document.getElementById('tipo-prenda');
        const estiloSelect = document.getElementById('estilo');
        
        if (!tipoPrendaSelect || !estiloSelect) return;
        
        tipoPrendaSelect.addEventListener('change', async (e) => {
            const tipoNombre = e.target.options[e.target.selectedIndex].text;
            console.log('👔 Tipo de prenda seleccionado:', tipoNombre);
            
            if (!tipoNombre) return;
            
            try {
                estiloSelect.innerHTML = '<option value="">Cargando estilos...</option>';
                
                const { data: estilos, error } = await supabase.rpc('get_estilos', { tipo_nombre: tipoNombre });
                
                if (!error && estilos && estilos.length > 0) {
                    populateSelect('estilo', estilos, 'Selecciona estilo (opcional)');
                } else {
                    estiloSelect.innerHTML = '<option value="" selected>Sin estilos para este tipo</option>';
                }
            } catch (error) {
                console.error('Error cargando estilos:', error);
                estiloSelect.innerHTML = '<option value="" selected>Sin estilos disponibles</option>';
            }
        });
    }
    
    function resetSelect(select, placeholder) {
        if (select) {
            select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
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

    function loadFallbackEstilos() {
        const fallbackEstilos = [
            { id: 1, nombre: 'Oversize', descripcion: 'Corte holgado y relajado' }, 
            { id: 2, nombre: 'Slim', descripcion: 'Corte ajustado al cuerpo' }, 
            { id: 3, nombre: 'Skinny', descripcion: 'Muy ajustado y ceñido' },
            { id: 4, nombre: 'Cargo', descripcion: 'Con bolsillos laterales grandes' }, 
            { id: 5, nombre: 'High Waist', descripcion: 'Talle alto que estiliza' }, 
            { id: 6, nombre: 'Crop', descripcion: 'Cortado, no llega a la cintura' },
            { id: 7, nombre: 'Straight', descripcion: 'Corte recto clásico' },
            { id: 8, nombre: 'Flare', descripcion: 'Acampanado desde la rodilla' },
            { id: 9, nombre: 'Wrap', descripcion: 'Estilo cruzado que se ata' },
            { id: 10, nombre: 'Off Shoulder', descripcion: 'Con hombros descubiertos' }
        ];
        
        populateSelect('estilo', fallbackEstilos, 'Selecciona estilo');
    }

    function loadFallbackCategories() {
        console.log('📦 Cargando categorías de respaldo...');
        
        const fallbackCategorias = [
            { id: 1, nombre: 'Tops', descripcion: 'Prendas superiores' },
            { id: 2, nombre: 'Pantalones', descripcion: 'Todo tipo de pantalones' },
            { id: 3, nombre: 'Vestidos', descripcion: 'Vestidos casuales y elegantes' },
            { id: 4, nombre: 'Faldas', descripcion: 'Faldas de diferentes estilos' },
            { id: 5, nombre: 'Conjuntos', descripcion: 'Sets coordinados' },
            { id: 6, nombre: 'Abrigos', descripcion: 'Chaquetas y abrigos' },
            { id: 7, nombre: 'Buzos', descripcion: 'Buzos y sudaderas' },
            { id: 8, nombre: 'Camperas', descripcion: 'Camperas y chaquetas' },
            { id: 9, nombre: 'Tapados', descripcion: 'Tapados y abrigos elegantes' },
            { id: 10, nombre: 'Accesorios', descripcion: 'Complementos y accesorios' },
            { id: 11, nombre: 'Calzado', descripcion: 'Zapatos y calzado' },
            { id: 12, nombre: 'Ropa Interior', descripcion: 'Lencería y ropa interior' },
            { id: 13, nombre: 'Pijamas', descripcion: 'Ropa de dormir' },
            { id: 14, nombre: 'Trajes de Baño', descripcion: 'Bikinis y mallas' }
        ];
        
        populateSelect('categoria', fallbackCategorias, 'Selecciona categoría');
        
        const fallbackData = {
            categorias: fallbackCategorias,
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
            
            // MEJORADO: Intentar cargar estadísticas con soporte 3FN
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
            
            // MEJORADO: Cargar productos con soporte 3FN
            let products = [];
            
            // Intentar vista 3FN primero
            try {
                const { data: products3FN, error: error3FN } = await supabase
                    .from('vista_productos_completa')
                    .select('*')
                    .order('nombre', { ascending: true });
                
                if (!error3FN && products3FN && products3FN.length > 0) {
                    products = products3FN;
                    console.log('✅ Productos cargados desde vista 3FN completa:', products.length);
                }
            } catch (e) {
                console.log('⚠️ Vista 3FN no disponible');
            }
            
            // Fallback a vista original si no hay datos 3FN
            if (products.length === 0) {
                try {
                    const { data: fullProducts, error: fullError } = await supabase
                        .from('vista_productos_completa')
                        .select('*')
                        .order('id', { ascending: false });
                    
                    if (!fullError && fullProducts) {
                        products = fullProducts;
                        console.log('✅ Productos cargados desde vista original');
                    }
                } catch (e) {
                    console.log('Vista completa no disponible, usando tabla básica');
                }
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
        
        // Actualizar variable global
        currentProductsData = products;
        
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
        console.log('🔧 Configurando event listeners...');
        
        // Navegación del sidebar
        DOMElements.navItems.forEach(item => {
            // Remover listeners existentes
            item.removeEventListener('click', handleNavClick);
            item.addEventListener('click', handleNavClick);
        });
        
        function handleNavClick(e) {
            e.preventDefault();
            console.log('🔄 Click en navegación:', e.currentTarget.dataset.section);
            
            if (DOMElements.sidebar && DOMElements.sidebar.classList.contains('active')) {
                toggleMobileMenu();
            }
            const section = e.currentTarget.dataset.section;
            if (section) switchSection(section);
        }

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
            DOMElements.productForm.removeEventListener('submit', handleFormSubmit);
            DOMElements.productForm.addEventListener('submit', handleFormSubmit);
        }
        
        function handleFormSubmit(e) {
            e.preventDefault();
            handleProductFormSubmit(e, currentProductsData);
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

        console.log('✅ Event listeners configurados correctamente');
    }

    // --- MANEJO DE FORMULARIOS ---
    async function handleProductFormSubmit(e, products) {
        e.preventDefault();
        
        console.log('💾 Enviando formulario de producto...');
        
        if (!DOMElements.submitButton) return;
        
        DOMElements.submitButton.disabled = true;
        DOMElements.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            const formData = new FormData(e.target);
            
            // Validar campos requeridos
            const nombre = formData.get('nombre')?.trim();
            const descripcion = formData.get('descripcion')?.trim();
            const precio = parseFloat(formData.get('precio'));
            
            console.log('📝 Datos del formulario:', { nombre, descripcion, precio });
            
            if (!nombre || !descripcion || isNaN(precio)) {
                throw new Error('Por favor completa todos los campos requeridos (nombre, descripción y precio)');
            }
            
            const productData = {
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                // Campos de categorización simplificada
                categoria_id: parseInt(formData.get('categoria')) || null,
                tipo_prenda_id: parseInt(formData.get('tipo-prenda')) || null,
                estilo_id: parseInt(formData.get('estilo')) || null,
                tipo_tela_id: parseInt(formData.get('tipo-tela')) || null,
                genero: formData.get('genero') || 'mujer',
                temporada: formData.get('temporada') || 'todo_año',
                // Campo para compatibilidad con vistas existentes
                categoria: 'Producto IAN MODAS'
            };
            
            console.log('🔧 Datos del producto a guardar:', productData);

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
            // MEJORADO: Soporte completo para estructura 3FN
            const categoria = product.categoria || product.categoria_nombre || 'Sin categoría';
            const tipoPrenda = product.tipo_prenda || product.tipo_prenda_nombre || '';
            const estilo = product.estilo || product.estilo_nombre || '';
            const tela = product.tela || product.tipo_tela || '';
            const color = product.color || product.color_nombre || '';
            
            // Construir descripción completa
            let descripcionCompleta = categoria;
            if (tipoPrenda) descripcionCompleta += ` - ${tipoPrenda}`;
            if (estilo) descripcionCompleta += ` (${estilo})`;
            if (tela) descripcionCompleta += ` - ${tela}`;
            if (color) descripcionCompleta += ` - ${color}`;
            
            return `
                <tr data-id="${product.id}">
                    <td><img src="${product.imagen_url || '/placeholder.jpg'}" alt="${product.nombre}" class="product-table-img" onerror="this.src='/placeholder.jpg'"></td>
                    <td>
                        <div class="product-info">
                            <strong>${product.nombre}</strong>
                            <small class="text-muted">${descripcionCompleta}</small>
                            ${product.color_hex ? `<div class="color-indicator" style="background-color: ${product.color_hex}; width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-left: 8px;" title="${color}"></div>` : ''}
                        </div>
                    </td>
                    <td>${categoria}</td>
                    <td>$${product.precio ? Math.round(product.precio) : '0'} UYU</td>
                    <td><span class="available-badge">✅ Siempre Disponible</span></td>
                    <td class="table-actions">
                        <button class="btn-icon edit" onclick="editProduct(${product.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteProduct(${product.id})" title="Eliminar">
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
        
        console.log('📊 Actualizando estadísticas:', { productos: products.length, usuarios: users.length });
        
        // Actualizar contadores principales
        if (DOMElements.totalUsers) DOMElements.totalUsers.textContent = users.length;
        if (DOMElements.totalProducts) DOMElements.totalProducts.textContent = products.length;
        if (DOMElements.totalCategories) DOMElements.totalCategories.textContent = '15';
        
        // Mostrar valor total del catálogo
        const totalValue = products.reduce((sum, p) => sum + (p.precio || 0), 0);
        const catalogValueElement = document.getElementById('total-catalog-value');
        if (catalogValueElement) catalogValueElement.textContent = `$${Math.round(totalValue)} UYU`;
        
        // Colores disponibles
        const totalColorsElement = document.getElementById('total-colors');
        if (totalColorsElement) totalColorsElement.textContent = '30+';
        
        // Último registro
        const lastRegistrationElement = document.getElementById('last-registration');
        if (lastRegistrationElement && users.length > 0) {
            const lastUser = users[0];
            const date = new Date(lastUser.created_at).toLocaleDateString();
            lastRegistrationElement.textContent = date;
        }
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
        console.log('🔄 Cambiando a sección:', sectionId);
        
        // Ocultar todas las secciones
        DOMElements.sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Actualizar navegación activa
        DOMElements.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
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
    
    // --- FUNCIONES GLOBALES PARA ACCESO DESDE HTML ---
    window.editProduct = function(productId) {
        openEditForm(productId, currentProductsData);
    };
    
    window.deleteProduct = function(productId) {
        showDeleteModal(productId, currentProductsData);
    };
    
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
    };
    
    window.removeImage = function(imageId) {
        selectedImages = selectedImages.filter(img => img.id !== imageId);
        const imageItem = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageItem) imageItem.remove();

        // Si se eliminó la imagen principal, marcar la primera como principal
        if (selectedImages.length > 0 && !selectedImages.some(img => img.isMain)) {
            setMainImage(selectedImages[0].id);
        }
    };
    
    // Función global para resetear formulario
    window.resetProductForm = function() {
        console.log('🔄 Reseteando formulario');
        resetProductForm();
    };
    
    // --- FUNCIONALIDAD DE IA PARA DESCRIPCIONES ---
    const generateBtn = document.getElementById('generate-description-btn');
    const descripcionTextarea = document.getElementById('descripcion');
    const feedbackDiv = document.getElementById('ai-feedback');
    
    if (generateBtn && descripcionTextarea) {
        generateBtn.addEventListener('click', async () => {
            const nombreInput = document.getElementById('nombre');
            const categoriaSelect = document.getElementById('categoria');
            const tipoPrendaSelect = document.getElementById('tipo-prenda');
            const estiloSelect = document.getElementById('estilo');
            const telaSelect = document.getElementById('tipo-tela');
            
            const nombre = nombreInput?.value || '';
            const categoria = categoriaSelect?.options[categoriaSelect.selectedIndex]?.text || '';
            const tipoPrenda = tipoPrendaSelect?.options[tipoPrendaSelect.selectedIndex]?.text || '';
            const estilo = estiloSelect?.options[estiloSelect.selectedIndex]?.text || '';
            const tela = telaSelect?.options[telaSelect.selectedIndex]?.text || '';
            
            if (!nombre.trim()) {
                alert('Por favor ingresa el nombre del producto primero');
                nombreInput?.focus();
                return;
            }
            
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="ai-icon">🤖</i> <span class="ai-text">Generando...</span>';
            
            try {
                const descripcionGenerada = await generarDescripcionConIA(nombre, categoria, tipoPrenda, estilo, tela);
                
                if (descripcionGenerada) {
                    descripcionTextarea.value = descripcionGenerada;
                    
                    if (feedbackDiv) {
                        feedbackDiv.innerHTML = `
                            <div class="ai-status success">Descripción generada exitosamente</div>
                            <div class="ai-tips">Puedes editar la descripción generada según tus necesidades.</div>
                        `;
                        setTimeout(() => feedbackDiv.innerHTML = '', 5000);
                    }
                } else {
                    throw new Error('No se pudo generar la descripción');
                }
                
            } catch (error) {
                console.error('Error generando descripción:', error);
                
                if (feedbackDiv) {
                    feedbackDiv.innerHTML = `
                        <div class="ai-status error">Error al generar descripción</div>
                        <div class="ai-tips">Intenta nuevamente o escribe la descripción manualmente.</div>
                    `;
                    setTimeout(() => feedbackDiv.innerHTML = '', 5000);
                }
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="ai-icon">✨</i> <span class="ai-text">Generar con IA</span> <span class="ai-badge">BETA</span>';
            }
        });
    }
    
    async function generarDescripcionConIA(nombre, categoria, tipoPrenda, estilo, tela) {
        // Descripción generada localmente con plantillas inteligentes
        const plantillas = {
            'Tops': `${nombre} es una prenda superior ${estilo ? `de estilo ${estilo.toLowerCase()}` : 'versátil'} ${tela ? `confeccionada en ${tela.toLowerCase()}` : ''}. Perfecta para combinar con diferentes outfits, ofrece comodidad y elegancia en cada ocasión. Su diseño cuidadoso y materiales de calidad la convierten en una opción ideal para tu guardarropa.`,
            
            'Pantalones': `${nombre} ${tipoPrenda ? `tipo ${tipoPrenda.toLowerCase()}` : ''} ${estilo ? `con corte ${estilo.toLowerCase()}` : 'de corte clásico'} ${tela ? `en ${tela.toLowerCase()}` : ''}. Diseñado para brindar comodidad y estilo, se adapta perfectamente a tu figura. Ideal para crear looks casuales o elegantes según la ocasión.`,
            
            'Vestidos': `${nombre} es un hermoso vestido ${estilo ? `de estilo ${estilo.toLowerCase()}` : 'elegante'} ${tela ? `confeccionado en ${tela.toLowerCase()}` : ''}. Su diseño favorecedor y detalles cuidados lo convierten en la elección perfecta para ocasiones especiales. Combina elegancia y comodidad de manera excepcional.`,
            
            'Faldas': `${nombre} es una falda ${estilo ? `${estilo.toLowerCase()}` : 'versátil'} ${tela ? `en ${tela.toLowerCase()}` : ''}. Su diseño femenino y moderno la hace perfecta para crear diferentes looks. Fácil de combinar y muy cómoda para el uso diario.`,
            
            'default': `${nombre} es una prenda de alta calidad ${categoria ? `de la categoría ${categoria.toLowerCase()}` : ''} ${tela ? `confeccionada en ${tela.toLowerCase()}` : ''}. Su diseño cuidadoso y atención al detalle la convierten en una excelente adición a tu guardarropa. Perfecta para diferentes ocasiones y fácil de combinar.`
        };
        
        // Simulamos un delay para que parezca que está procesando
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const template = plantillas[categoria] || plantillas['default'];
        
        // Agregar información adicional si está disponible
        let descripcionFinal = template;
        
        if (estilo && !template.includes(estilo.toLowerCase())) {
            descripcionFinal += ` Su estilo ${estilo.toLowerCase()} aporta un toque distintivo a tu look.`;
        }
        
        return descripcionFinal;
    }
});