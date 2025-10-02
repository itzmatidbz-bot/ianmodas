// JAVASCRIPT SIMPLE Y EFECTIVO - ADMIN
// Sin complicaciones, directo al grano

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 IAN MODAS Admin - Sistema Simple iniciando...');
    
    await protectPage();
    await loadSimpleData();
    
    // Cargar datos para los selects
    await loadCategorias();
    await loadTelas();
    await loadColores();
    
    console.log('✅ Sistema simple cargado');
});

async function protectPage() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        
        // Verificar si es admin (si tienes esa función)
        try {
            const { data: isAdmin } = await supabase.rpc('is_admin');
            if (!isAdmin) {
                await supabase.auth.signOut();
                window.location.href = 'login.html?error=auth';
                return;
            }
        } catch (e) {
            console.log('Función is_admin no disponible, continuando...');
        }
        
        // Mostrar admin panel
        const loadingScreen = document.getElementById('loading-screen');
        const adminLayout = document.querySelector('.admin-layout');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (adminLayout) adminLayout.style.display = 'block';
        
    } catch (error) {
        console.error('Error protegiendo página:', error);
        window.location.href = 'login.html';
    }
}

async function loadSimpleData() {
    try {
        // Cargar productos
        const { data: products, error: prodError } = await supabase
            .from('vista_productos_completa')
            .select('*');
        
        if (prodError) throw prodError;
        
        // Cargar usuarios
        const { data: users, error: usersError } = await supabase
            .from('usuarios')
            .select('*');
        
        // Actualizar estadísticas
        updateStats(products || [], users || []);
        renderProductsTable(products || []);
        renderUsersTable(users || []);
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// =====================================================
// CARGA DE SELECTS - SUPER SIMPLE
// =====================================================

async function loadCategorias() {
    try {
        const { data: categorias, error } = await supabase.rpc('get_categorias');
        if (!error && categorias) {
            populateSelect('categoria', categorias, 'Selecciona categoría');
            setupCategoriaChange();
        }
    } catch (e) {
        console.log('RPC no disponible, usando fallback');
        loadFallbackCategorias();
    }
}

async function loadTelas() {
    try {
        const { data: telas, error } = await supabase.rpc('get_telas');
        if (!error && telas) {
            populateSelect('tipo-tela', telas, 'Selecciona tela');
        }
    } catch (e) {
        loadFallbackTelas();
    }
}

async function loadColores() {
    try {
        const { data: colores, error } = await supabase.rpc('get_colores');
        if (!error && colores) {
            populateColorSelector(colores);
        }
    } catch (e) {
        loadFallbackColores();
    }
}

// =====================================================
// DEPENDENCIAS SIMPLES
// =====================================================

function setupCategoriaChange() {
    const categoriaSelect = document.getElementById('categoria');
    if (!categoriaSelect) return;
    
    categoriaSelect.addEventListener('change', async (e) => {
        const categoriaNombre = e.target.options[e.target.selectedIndex].text;
        console.log('📦 Categoría seleccionada:', categoriaNombre);
        
        // Cargar tipos de prenda para esta categoría
        await loadTiposPrenda(categoriaNombre);
    });
}

async function loadTiposPrenda(categoriaNombre) {
    const tipoPrendaSelect = document.getElementById('tipo-prenda');
    if (!tipoPrendaSelect) return;
    
    try {
        tipoPrendaSelect.innerHTML = '<option value="">Cargando tipos...</option>';
        
        const { data: tipos, error } = await supabase.rpc('get_tipos_prenda', { cat_nombre: categoriaNombre });
        
        if (!error && tipos && tipos.length > 0) {
            populateSelect('tipo-prenda', tipos, 'Selecciona tipo de prenda');
            setupTipoPrendaChange();
        } else {
            tipoPrendaSelect.innerHTML = '<option value="">Sin tipos disponibles</option>';
        }
    } catch (error) {
        console.error('Error cargando tipos de prenda:', error);
        tipoPrendaSelect.innerHTML = '<option value="">Error cargando tipos</option>';
    }
}

function setupTipoPrendaChange() {
    const tipoPrendaSelect = document.getElementById('tipo-prenda');
    if (!tipoPrendaSelect) return;
    
    tipoPrendaSelect.addEventListener('change', async (e) => {
        const tipoNombre = e.target.options[e.target.selectedIndex].text;
        console.log('👔 Tipo de prenda seleccionado:', tipoNombre);
        
        // Cargar estilos para este tipo
        await loadEstilos(tipoNombre);
    });
}

async function loadEstilos(tipoNombre) {
    const estiloSelect = document.getElementById('estilo');
    if (!estiloSelect) return;
    
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
}

// =====================================================
// HELPERS SIMPLES
// =====================================================

function populateSelect(selectId, options, placeholder) {
    const select = document.getElementById(selectId);
    if (!select || !options) return;
    
    select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.id;
        optionElement.textContent = option.nombre;
        select.appendChild(optionElement);
    });
}

function populateColorSelector(colores) {
    const coloresGrid = document.getElementById('colores-grid');
    if (!coloresGrid) return;
    
    coloresGrid.innerHTML = '';
    
    colores.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-option';
        colorDiv.innerHTML = `
            <input type="checkbox" id="color-${color.id}" value="${color.id}">
            <div class="color-swatch" style="background-color: ${color.codigo_hex}"></div>
            <span>${color.nombre}</span>
        `;
        
        colorDiv.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const checkbox = colorDiv.querySelector('input');
                checkbox.checked = !checkbox.checked;
            }
            colorDiv.classList.toggle('selected', colorDiv.querySelector('input').checked);
            updateSelectedColors();
        });
        
        coloresGrid.appendChild(colorDiv);
    });
}

function updateSelectedColors() {
    const selectedIds = Array.from(document.querySelectorAll('#colores-grid input:checked'))
        .map(input => input.value);
    
    const hiddenInput = document.getElementById('colores-selected');
    if (hiddenInput) {
        hiddenInput.value = selectedIds.join(',');
    }
}

// =====================================================
// FALLBACKS SIMPLES
// =====================================================

function loadFallbackCategorias() {
    const fallback = [
        { id: 1, nombre: 'Tops' }, { id: 2, nombre: 'Pantalones' }, { id: 3, nombre: 'Vestidos' },
        { id: 4, nombre: 'Calzado' }, { id: 5, nombre: 'Ropa Interior' }
    ];
    populateSelect('categoria', fallback, 'Selecciona categoría');
}

function loadFallbackTelas() {
    const fallback = [
        { id: 1, nombre: 'Algodón' }, { id: 2, nombre: 'Jean' }, { id: 3, nombre: 'Seda' },
        { id: 4, nombre: 'Lycra' }, { id: 5, nombre: 'Encaje' }
    ];
    populateSelect('tipo-tela', fallback, 'Selecciona tela');
}

function loadFallbackColores() {
    const fallback = [
        { id: 1, nombre: 'Negro', codigo_hex: '#000000' },
        { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
        { id: 3, nombre: 'Azul', codigo_hex: '#0066CC' },
        { id: 4, nombre: 'Rosa', codigo_hex: '#FFC0CB' },
        { id: 5, nombre: 'Verde', codigo_hex: '#008000' }
    ];
    populateColorSelector(fallback);
}

// =====================================================
// RENDERIZADO SIMPLE
// =====================================================

function updateStats(products, users) {
    const totalUsers = document.getElementById('total-users');
    const totalProducts = document.getElementById('total-products');
    const totalColors = document.getElementById('total-colors');
    
    if (totalUsers) totalUsers.textContent = users.length;
    if (totalProducts) totalProducts.textContent = products.length;
    if (totalColors) totalColors.textContent = '30+'; // Hardcode simple
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.imagen_url || '/placeholder.jpg'}" alt="${product.nombre}" class="product-thumb"></td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>$${product.precio}</td>
            <td><span class="available-badge">✅ Disponible</span></td>
            <td>
                <button class="btn-edit" onclick="editarProducto(${product.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarProducto(${product.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay usuarios</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.nombre || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.telefono || 'N/A'}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
        </tr>  
    `).join('');
}

// Funciones de producto (placeholder)
function editarProducto(id) {
    console.log('Editar producto:', id);
}

function eliminarProducto(id) {
    console.log('Eliminar producto:', id);
}

console.log('🎉 JavaScript simple cargado');