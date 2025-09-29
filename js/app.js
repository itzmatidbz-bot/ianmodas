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
            const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
            if (error) throw error;
            allProducts = data;
            renderProducts(allProducts);
        } catch (error) {
            if(productGrid) productGrid.innerHTML = '<p>Error al cargar el catálogo. Intente más tarde.</p>';
            console.error('Error fetching products:', error);
        }
    }

    function renderProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        noResultsMessage.style.display = products.length === 0 ? 'block' : 'none';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;
            
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
            // Hacer la tarjeta clickeable para ir al detalle
            card.addEventListener('click', () => {
                window.location.href = `producto.html?id=${product.id}`;
            });
            productGrid.appendChild(card);
        });
    }
    
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
        
        if(document.getElementById('login-form')) {
            setupAuthForms();
        }
        
        // Listeners del Carrito
        cartToggle.addEventListener('click', () => cartModal.classList.add('active'));
        closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
        document.querySelector('.cart-modal__footer').addEventListener('click', handleCartActions);
        cartItemsContainer.addEventListener('click', handleCartActions);
    }

    function setupMobileMenu() {
        if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('active'));
        if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('active'));
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

