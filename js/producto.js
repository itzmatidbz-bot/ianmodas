document.addEventListener('DOMContentLoaded', () => {

    const productDetailContainer = document.getElementById('product-detail-container');
    const relatedProductsGrid = document.getElementById('related-products-grid');

    // --- Elementos del Carrito ---
    const cartModal = document.getElementById('cart-modal');
    const cartToggle = document.getElementById('cart-toggle');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const userSessionLink = document.getElementById('user-session');


    // --- Estado ---
    let cart = JSON.parse(localStorage.getItem('ianModasCart')) || [];
    let currentProduct = null;
    let currentUser = null;

    async function init() {
        await checkUserStatus();
        await loadProduct();
        updateCartUI();
        setupEventListeners();
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

    async function loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            productDetailContainer.innerHTML = '<p class="error-message">Producto no encontrado.</p>';
            return;
        }

        try {
            const { data, error } = await supabase
                .from('productos')
                .select('*')
                .eq('id', productId)
                .single();

            if (error || !data) throw error;
            
            currentProduct = data;
            document.title = `${currentProduct.nombre} - Ian Modas`;
            renderProductDetails();
            loadRelatedProducts(currentProduct.categoria, currentProduct.id);

        } catch (error) {
            console.error('Error al cargar el producto:', error);
            productDetailContainer.innerHTML = '<p class="error-message">No se pudo cargar el producto. Intente más tarde.</p>';
        }
    }

    function renderProductDetails() {
        let priceAndActionsHTML = '';

        if (currentUser) {
            priceAndActionsHTML = `
                <div class="product-detail__price-box">
                    <span class="price">$${currentProduct.precio.toFixed(2)}</span>
                    ${currentProduct.stock > 0 ? `<span class="stock-status in-stock">En Stock (${currentProduct.stock})</span>` : '<span class="stock-status out-of-stock">Agotado</span>'}
                </div>
                <div class="product-detail__actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <input type="number" id="quantity-input" value="1" min="1" max="${currentProduct.stock}">
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>
                    <button id="add-to-cart-btn" class="btn" ${currentProduct.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i> Añadir al Pedido
                    </button>
                </div>
            `;
        } else {
            priceAndActionsHTML = `
                <div class="login-prompt">
                    <a href="login.html">Inicia sesión como mayorista</a> para ver precios y armar tu pedido.
                </div>
            `;
        }
        
        productDetailContainer.innerHTML = `
            <div class="product-detail">
                <div class="product-detail__gallery">
                    <img src="${currentProduct.imagen_url || 'https://placehold.co/600x800/eee/ccc?text=IanModas'}" alt="${currentProduct.nombre}">
                </div>
                <div class="product-detail__info">
                    <span class="category">${currentProduct.categoria}</span>
                    <h1>${currentProduct.nombre}</h1>
                    <p class="description">${currentProduct.descripcion}</p>
                    ${priceAndActionsHTML}
                </div>
            </div>
        `;

        if (currentUser) {
            document.getElementById('add-to-cart-btn').addEventListener('click', handleAddToCart);
            document.querySelector('.quantity-selector').addEventListener('click', handleQuantityChange);
        }
    }
    
    async function loadRelatedProducts(categoria, currentId) {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .neq('id', currentId)
            .limit(4);

        if (error) {
            console.error('Error al cargar productos relacionados:', error);
            return;
        }

        relatedProductsGrid.innerHTML = data.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.imagen_url || 'https://placehold.co/600x400/eee/ccc?text=IanModas'}" alt="${product.nombre}" class="product-card__image">
                <div class="product-card__content">
                    <p class="product-card__category">${product.categoria}</p>
                    <h3 class="product-card__title">${product.nombre}</h3>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.related-products .product-card').forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = `producto.html?id=${card.dataset.id}`;
            });
        });
    }

    // --- Lógica del Carrito/Pedido ---

    function handleAddToCart() {
        const quantityInput = document.getElementById('quantity-input');
        const quantity = parseInt(quantityInput.value);

        if (quantity > 0) {
            const existingItem = cart.find(item => item.id === currentProduct.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ ...currentProduct, quantity });
            }
            saveCart();
            updateCartUI();
            cartModal.classList.add('active');
        }
    }
    
    function handleQuantityChange(e) {
        const action = e.target.dataset.action;
        const quantityInput = document.getElementById('quantity-input');
        let currentValue = parseInt(quantityInput.value);
        
        if (action === 'increase' && currentValue < currentProduct.stock) {
            quantityInput.value = currentValue + 1;
        } else if (action === 'decrease' && currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    }
    
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

    function setupEventListeners() {
        cartToggle.addEventListener('click', () => cartModal.classList.add('active'));
        closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
        document.querySelector('.cart-modal__footer').addEventListener('click', handleCartActions);
        cartItemsContainer.addEventListener('click', handleCartActions);
    }
    
    init();
});

