// JAVASCRIPT FRONTEND ACTUALIZADO PARA SISTEMA 3FN
// Reemplaza el contenido de js/app.js

// Configurar cliente Supabase
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Estado global de la aplicación
let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('ian-modas-cart')) || [];
let selectedCategory = null;
let selectedTipo = null;
let selectedEstilo = null;
let selectedTela = null;
let selectedColor = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛍️ Iniciando IAN MODAS con sistema 3FN');
    
    try {
        await initializeApp();
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        showMessage('Error al cargar la aplicación. Por favor recarga la página.', 'error');
    }
});

async function initializeApp() {
    // Cargar filtros del sistema 3FN
    await loadFilters3FN();
    
    // Cargar productos
    await loadProducts();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar contador del carrito
    updateCartCounter();
    
    // Configurar formulario de registro
    setupRegistrationForm();
}

// ===============================
// CARGA DE FILTROS 3FN
// ===============================

async function loadFilters3FN() {
    console.log('🏷️ Cargando filtros del sistema 3FN...');
    
    try {
        // Cargar categorías
        await loadCategorias();
        
        // Cargar telas
        await loadTelas();
        
        // Cargar colores
        await loadColores();
        
        console.log('✅ Filtros 3FN cargados correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando filtros 3FN:', error);
        loadFallbackFilters();
    }
}

async function loadCategorias() {
    try {
        const { data: categorias, error } = await supabase.rpc('get_categorias');
        
        if (error) throw error;
        
        if (categorias && categorias.length > 0) {
            console.log('✅ Categorías cargadas:', categorias.length);
            populateFilter('categoria-filter', categorias, 'Todas las categorías');
        } else {
            console.log('⚠️ Sin categorías, usando fallback');
            loadFallbackCategorias();
        }
    } catch (e) {
        console.log('⚠️ Función get_categorias no disponible, usando fallback');
        loadFallbackCategorias();
    }
}

async function loadTelas() {
    try {
        const { data: telas, error } = await supabase.rpc('get_telas');
        
        if (error) throw error;
        
        if (telas && telas.length > 0) {
            console.log('✅ Telas cargadas:', telas.length);
            populateFilter('tela-filter', telas, 'Todas las telas');
        } else {
            loadFallbackTelas();
        }
    } catch (e) {
        loadFallbackTelas();
    }
}

async function loadColores() {
    try {
        const { data: colores, error } = await supabase.rpc('get_colores');
        
        if (error) throw error;
        
        if (colores && colores.length > 0) {
            console.log('✅ Colores cargados:', colores.length);
            populateColorFilter(colores);
        } else {
            loadFallbackColores();
        }
    } catch (e) {
        loadFallbackColores();
    }
}

function populateFilter(filterId, options, defaultText) {
    const select = document.getElementById(filterId);
    if (!select) return;
    
    select.innerHTML = `<option value="">${defaultText}</option>`;
    
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

function populateColorFilter(colores) {
    const colorFilter = document.getElementById('color-filter');
    if (!colorFilter) return;
    
    colorFilter.innerHTML = `
        <option value="">Todos los colores</option>
        ${colores.map(color => `
            <option value="${color.id}" style="background-color: ${color.codigo_hex}; color: ${getContrastColor(color.codigo_hex)}">
                ${color.nombre}
            </option>
        `).join('')}
    `;
}

function getContrastColor(hexColor) {
    // Convertir hex a RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Fallbacks si las RPC functions no funcionan
function loadFallbackFilters() {
    loadFallbackCategorias();
    loadFallbackTelas();
    loadFallbackColores();
}

function loadFallbackCategorias() {
    const fallback = [
        { id: 1, nombre: 'Ropa Interior' },
        { id: 2, nombre: 'Calzado' },
        { id: 3, nombre: 'Tops' },
        { id: 4, nombre: 'Pantalones' },
        { id: 5, nombre: 'Vestidos' }
    ];
    populateFilter('categoria-filter', fallback, 'Todas las categorías');
}

function loadFallbackTelas() {
    const fallback = [
        { id: 1, nombre: 'Algodón' },
        { id: 2, nombre: 'Jean' },
        { id: 3, nombre: 'Seda' },
        { id: 4, nombre: 'Lycra' }
    ];
    populateFilter('tela-filter', fallback, 'Todas las telas');
}

function loadFallbackColores() {
    const fallback = [
        { id: 1, nombre: 'Negro', codigo_hex: '#000000' },
        { id: 2, nombre: 'Blanco', codigo_hex: '#ffffff' },
        { id: 3, nombre: 'Azul', codigo_hex: '#0066cc' },
        { id: 4, nombre: 'Rosa', codigo_hex: '#ff69b4' }
    ];
    populateColorFilter(fallback);
}

// ===============================
// CARGA DE PRODUCTOS
// ===============================

async function loadProducts(filters = {}) {
    console.log('📦 Cargando productos con filtros:', filters);
    
    try {
        // Usar la nueva vista que ya tiene todos los datos relacionados
        let query = supabase
            .from('vista_productos_completa')
            .select('*');
        
        // Aplicar filtros
        if (filters.categoria_id) {
            query = query.eq('categoria_id', filters.categoria_id);
        }
        if (filters.tipo_prenda_id) {
            query = query.eq('tipo_prenda_id', filters.tipo_prenda_id);
        }
        if (filters.estilo_id) {
            query = query.eq('estilo_id', filters.estilo_id);
        }
        if (filters.tela_id) {
            query = query.eq('tela_id', filters.tela_id);
        }
        if (filters.color_id) {
            query = query.eq('color_id', filters.color_id);
        }
        
        const { data: products, error } = await query.order('nombre', { ascending: true });
        
        if (error) throw error;
        
        currentProducts = products || [];
        console.log(`✅ ${currentProducts.length} productos cargados`);
        
        renderProducts(currentProducts);
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showMessage('Error al cargar los productos', 'error');
        currentProducts = [];
        renderProducts([]);
    }
}

function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros de búsqueda.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const images = product.imagenes ? JSON.parse(product.imagenes) : [];
    const mainImage = images.length > 0 ? images[0] : '/placeholder-image.jpg';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${mainImage}" alt="${product.nombre}" loading="lazy">
                ${images.length > 1 ? `<span class="image-count">${images.length} fotos</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.nombre}</h3>
                <p class="product-category">${product.categoria} - ${product.tipo_prenda}${product.estilo ? ` - ${product.estilo}` : ''}</p>
                <p class="product-details">
                    <span class="product-fabric">${product.tela}</span>
                    <span class="product-color" style="background-color: ${product.color_hex}; color: ${getContrastColor(product.color_hex)}">${product.color}</span>
                </p>
                <div class="product-price">$${parseFloat(product.precio).toFixed(2)}</div>
                <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;
}

// ===============================
// SISTEMA DE CARRITO MEJORADO
// ===============================

function addToCart(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) {
        showMessage('Producto no encontrado', 'error');
        return;
    }
    
    // En el nuevo sistema, cada combinación de color/tela es un producto único
    const existingItem = cart.find(item => 
        item.id === product.id && 
        item.color_id === product.color_id && 
        item.tela_id === product.tela_id
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen_url: product.imagen_url,
            categoria: product.categoria,
            tipo_prenda: product.tipo_prenda,
            estilo: product.estilo,
            tela: product.tela,
            tela_id: product.tela_id,
            color: product.color,
            color_id: product.color_id,
            color_hex: product.color_hex,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCounter();
    showMessage(`${product.nombre} agregado al carrito`, 'success');
}

function saveCart() {
    localStorage.setItem('ian-modas-cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imagen_url || '/placeholder-image.jpg'}" alt="${item.nombre}">
            <div class="cart-item-info">
                <h4>${item.nombre}</h4>
                <p class="cart-item-details">
                    ${item.categoria} - ${item.tipo_prenda}${item.estilo ? ` - ${item.estilo}` : ''}
                </p>
                <p class="cart-item-specs">
                    <span class="fabric-spec">${item.tela}</span>
                    <span class="color-spec" style="background-color: ${item.color_hex}; color: ${getContrastColor(item.color_hex)}">${item.color}</span>
                </p>
                <div class="cart-item-price">$${parseFloat(item.precio).toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${item.id}, ${item.color_id}, ${item.tela_id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.color_id}, ${item.tela_id}, 1)">+</button>
                <button class="remove-item" onclick="removeFromCart(${item.id}, ${item.color_id}, ${item.tela_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateQuantity(productId, colorId, telaId, change) {
    const item = cart.find(item => 
        item.id === productId && 
        item.color_id === colorId && 
        item.tela_id === telaId
    );
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId, colorId, telaId);
        } else {
            saveCart();
            updateCartCounter();
            renderCartItems();
        }
    }
}

function removeFromCart(productId, colorId, telaId) {
    cart = cart.filter(item => 
        !(item.id === productId && 
          item.color_id === colorId && 
          item.tela_id === telaId)
    );
    
    saveCart();
    updateCartCounter();
    renderCartItems();
    showMessage('Producto eliminado del carrito', 'info');
}

// ===============================
// CHECKOUT MEJORADO CON SEPARACIÓN POR COLOR/TELA
// ===============================

function checkoutToWhatsApp() {
    if (cart.length === 0) {
        showMessage('El carrito está vacío', 'warning');
        return;
    }
    
    const phoneNumber = '59899123456'; // Número de WhatsApp
    let message = '🛍️ *PEDIDO IAN MODAS*\n\n';
    
    // Agrupar productos por especificaciones para mejor legibilidad
    const groupedItems = groupCartItemsBySpecs();
    
    Object.keys(groupedItems).forEach(key => {
        const items = groupedItems[key];
        const firstItem = items[0];
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
        
        message += `📦 *${firstItem.nombre}*\n`;
        message += `   Categoría: ${firstItem.categoria} - ${firstItem.tipo_prenda}${firstItem.estilo ? ` - ${firstItem.estilo}` : ''}\n`;
        message += `   Tela: ${firstItem.tela}\n`;
        message += `   Color: ${firstItem.color}\n`;
        message += `   Cantidad: ${totalQuantity}\n`;
        message += `   Precio: $${totalPrice.toFixed(2)}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    message += `💰 *Total: $${total.toFixed(2)}*\n\n`;
    message += '📞 Confirma tu pedido y coordinamos la entrega.';
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function groupCartItemsBySpecs() {
    const grouped = {};
    
    cart.forEach(item => {
        const key = `${item.id}-${item.color_id}-${item.tela_id}`;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(item);
    });
    
    return grouped;
}

// ===============================
// EVENT LISTENERS Y UTILIDADES
// ===============================

function setupEventListeners() {
    // Filtros
    const categoriaFilter = document.getElementById('categoria-filter');
    const telaFilter = document.getElementById('tela-filter');
    const colorFilter = document.getElementById('color-filter');
    
    if (categoriaFilter) {
        categoriaFilter.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            applyFilters();
        });
    }
    
    if (telaFilter) {
        telaFilter.addEventListener('change', (e) => {
            selectedTela = e.target.value;
            applyFilters();
        });
    }
    
    if (colorFilter) {
        colorFilter.addEventListener('change', (e) => {
            selectedColor = e.target.value;
            applyFilters();
        });
    }
    
    // Botón de carrito
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }
    
    // Botón de checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkoutToWhatsApp);
    }
    
    // Cerrar carrito
    const closeCart = document.getElementById('close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            document.getElementById('cart-sidebar').classList.remove('active');
        });
    }
}

function applyFilters() {
    const filters = {};
    
    if (selectedCategory) filters.categoria_id = parseInt(selectedCategory);
    if (selectedTela) filters.tela_id = parseInt(selectedTela);
    if (selectedColor) filters.color_id = parseInt(selectedColor);
    
    loadProducts(filters);
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
        if (cartSidebar.classList.contains('active')) {
            renderCartItems();
        }
    }
}

function showMessage(message, type = 'info') {
    // Crear notificación toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar y ocultar
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function setupRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const userData = Object.fromEntries(formData.entries());
        
        try {
            // Registrar usuario con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password
            });
            
            if (authError) throw authError;
            
            // Guardar datos adicionales en la tabla usuarios
            const { error: profileError } = await supabase
                .from('usuarios')
                .insert([{
                    auth_user_id: authData.user.id,
                    nombre: userData.nombre,
                    apellido: userData.apellido,
                    email: userData.email,
                    telefono: userData.telefono,
                    direccion: userData.direccion,
                    ciudad: userData.ciudad,
                    departamento: userData.departamento,
                    codigo_postal: userData.codigo_postal
                }]);
            
            if (profileError) throw profileError;
            
            showMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.', 'success');
            registerForm.reset();
            
        } catch (error) {
            console.error('Error en registro:', error);
            showMessage(error.message || 'Error al registrar usuario', 'error');
        }
    });
}

console.log('🎉 IAN MODAS con sistema 3FN inicializado correctamente');