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
            // Cargar producto principal
            const { data, error } = await supabase
                .from('vista_productos_completa')
                .select('*')
                .eq('id', productId)
                .single();

            if (error || !data) throw error;
            
            currentProduct = data;
            
            // 🖼️ CARGAR TODAS LAS IMÁGENES DEL PRODUCTO
            const { data: imagenes, error: imagenesError } = await supabase
                .from('producto_imagenes')
                .select('*')
                .eq('producto_id', productId)
                .order('orden', { ascending: true });
            
            if (!imagenesError && imagenes && imagenes.length > 0) {
                currentProduct.imagenes = imagenes.map(img => ({
                    url: img.imagen_url,
                    es_principal: img.es_principal,
                    orden: img.orden
                }));
                console.log(`🖼️ Cargadas ${imagenes.length} imágenes para el producto`);
            } else {
                console.log('🖼️ No se encontraron imágenes adicionales, usando imagen principal');
            }
            
            // Cargar colores disponibles del producto
            const { data: colores, error: colorsError } = await supabase
                .from('producto_colores')
                .select(`
                    color_id,
                    disponible,
                    colores (id, nombre, codigo_hex)
                `)
                .eq('producto_id', productId)
                .eq('disponible', true);
            
            if (!colorsError && colores) {
                currentProduct.colores_disponibles = colores.map(pc => pc.colores);
            }
            
            document.title = `${currentProduct.nombre} - Ian Modas`;
            renderProductDetails();
            loadRelatedProducts(currentProduct.categoria_nombre || currentProduct.categoria, currentProduct.id);

        } catch (error) {
            console.error('Error al cargar el producto:', error);
            productDetailContainer.innerHTML = '<p class="error-message">No se pudo cargar el producto. Intente más tarde.</p>';
        }
    }

    function renderProductDetails() {
        // Procesar imágenes
        let images = [];
        if (currentProduct.imagenes && Array.isArray(currentProduct.imagenes)) {
            images = currentProduct.imagenes.sort((a, b) => a.orden - b.orden);
        } else if (currentProduct.imagen_url) {
            images = [{ url: currentProduct.imagen_url, es_principal: true }];
        } else {
            images = [{ url: 'https://placehold.co/600x800/eee/ccc?text=IanModas', es_principal: true }];
        }

        // Procesar colores disponibles
        let coloresHTML = '';
        if (currentProduct.colores_disponibles && Array.isArray(currentProduct.colores_disponibles)) {
            coloresHTML = `
                <div class="product-colors">
                    <h4><i class="fas fa-palette"></i> Colores Disponibles:</h4>
                    <div class="colors-grid">
                        ${currentProduct.colores_disponibles.map(color => `
                            <div class="color-option" data-color-id="${color.id}" title="${color.nombre}">
                                <div class="color-swatch" style="background-color: ${color.codigo_hex || '#ddd'}"></div>
                                <span class="color-name">${color.nombre}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Información adicional del producto
        let infoAdicional = '';
        if (currentProduct.categoria_nombre || currentProduct.tipo_prenda_nombre || currentProduct.tipo_tela_nombre) {
            infoAdicional = `
                <div class="product-specs">
                    <h4><i class="fas fa-info-circle"></i> Información del Producto:</h4>
                    <ul class="specs-list">
                        ${currentProduct.categoria_nombre ? `<li><strong>Categoría:</strong> ${currentProduct.categoria_nombre}</li>` : ''}
                        ${currentProduct.tipo_prenda_nombre ? `<li><strong>Tipo:</strong> ${currentProduct.tipo_prenda_nombre}</li>` : ''}
                        ${currentProduct.estilo_nombre ? `<li><strong>Estilo:</strong> ${currentProduct.estilo_nombre}</li>` : ''}
                        ${currentProduct.tipo_tela_nombre ? `<li><strong>Tela:</strong> ${currentProduct.tipo_tela_nombre}</li>` : ''}
                        ${currentProduct.genero ? `<li><strong>Género:</strong> ${currentProduct.genero}</li>` : ''}
                        ${currentProduct.temporada ? `<li><strong>Temporada:</strong> ${currentProduct.temporada}</li>` : ''}
                    </ul>
                </div>
            `;
        }

        let priceAndActionsHTML = '';
        if (currentUser) {
            const precio = parseFloat(currentProduct.precio) || 0;
            priceAndActionsHTML = `
                <div class="product-detail__price-box">
                    <span class="price">$UYU ${precio.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    <span class="stock-status in-stock">Disponible</span>
                </div>
                ${coloresHTML}
                <div class="product-detail__actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <input type="number" id="quantity-input" value="1" min="1">
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>
                    <button id="add-to-cart-btn" class="btn">
                        <i class="fas fa-plus"></i> AÑADIR AL PEDIDO
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
                    <div class="main-image-container">
                        <img id="main-product-image" src="${images[0].url}" alt="${currentProduct.nombre}">
                        ${images.length > 1 ? `
                            <button class="gallery-nav prev" onclick="changeImage(-1)">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="gallery-nav next" onclick="changeImage(1)">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        ` : ''}
                    </div>
                    ${images.length > 1 ? `
                        <div class="thumbnail-container">
                            ${images.map((img, index) => `
                                <img class="thumbnail ${index === 0 ? 'active' : ''}" 
                                     src="${img.url}" 
                                     alt="Imagen ${index + 1}"
                                     onclick="setMainImage(${index})">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="product-detail__info">
                    <span class="category">${currentProduct.categoria_nombre || currentProduct.categoria || 'Sin categoría'}</span>
                    <h1>${currentProduct.nombre}</h1>
                    <p class="description">${currentProduct.descripcion}</p>
                    ${infoAdicional}
                    ${priceAndActionsHTML}
                </div>
            </div>
        `;

        // Guardar imágenes globalmente para navegación
        window.productImages = images;
        window.currentImageIndex = 0;

        if (currentUser) {
            document.getElementById('add-to-cart-btn').addEventListener('click', handleAddToCart);
            document.querySelector('.quantity-selector').addEventListener('click', handleQuantityChange);
            
            // Event listeners para colores
            document.querySelectorAll('.color-option').forEach(colorOption => {
                colorOption.addEventListener('click', function() {
                    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }
    }

    // Funciones globales para navegación de imágenes
    window.changeImage = function(direction) {
        const images = window.productImages;
        if (!images || images.length <= 1) return;
        
        window.currentImageIndex += direction;
        if (window.currentImageIndex >= images.length) window.currentImageIndex = 0;
        if (window.currentImageIndex < 0) window.currentImageIndex = images.length - 1;
        
        updateMainImage();
    }

    window.setMainImage = function(index) {
        window.currentImageIndex = index;
        updateMainImage();
    }

    function updateMainImage() {
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        if (mainImage && window.productImages) {
            mainImage.src = window.productImages[window.currentImageIndex].url;
            
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === window.currentImageIndex);
            });
        }
    }
    
    async function loadRelatedProducts(categoria, currentId) {
        const { data, error } = await supabase
            .from('vista_productos_completa')
            .select('*')
            .eq('categoria_nombre', categoria)
            .neq('id', currentId)
            .limit(4);

        if (error) {
            console.error('Error al cargar productos relacionados:', error);
            return;
        }

        if (data && data.length > 0) {
            relatedProductsGrid.innerHTML = data.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.imagen_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlOWVjZWYiIHN0cm9rZT0iI2RlZTJlNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHRleHQgeD0iMTUwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmM3NTdkIj5TaW4gSW1hZ2VuPC90ZXh0PgogIDx0ZXh0IHg9IjE1MCIgeT0iMTE1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNhZGI1YmQiPlBsYWNlaG9sZGVyPC90ZXh0Pgo8L3N2Zz4K'}" alt="${product.nombre}" class="product-card__image">
                    <div class="product-card__content">
                        <p class="product-card__category">${product.categoria_nombre || 'Sin categoría'}</p>
                        <h3 class="product-card__title">${product.nombre}</h3>
                    </div>
                </div>
            `).join('');
        } else {
            relatedProductsGrid.innerHTML = '<p class="no-related">No hay productos relacionados disponibles.</p>';
        }
        
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
        const selectedColor = document.querySelector('.color-option.selected');
        
        if (quantity > 0) {
            let productToAdd = { ...currentProduct, quantity };
            
            // Si hay color seleccionado, agregarlo al producto
            if (selectedColor) {
                const colorId = selectedColor.dataset.colorId;
                const colorName = selectedColor.querySelector('.color-name').textContent;
                productToAdd.selectedColor = {
                    id: colorId,
                    nombre: colorName
                };
                productToAdd.cartId = `${currentProduct.id}-${colorId}`; // ID único para carrito
            } else {
                productToAdd.cartId = currentProduct.id.toString();
            }
            
            const existingItem = cart.find(item => item.cartId === productToAdd.cartId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push(productToAdd);
            }
            
            saveCart();
            updateCartUI();
            cartModal.classList.add('active');
            
            // Mostrar mensaje de confirmación
            const addBtn = document.getElementById('add-to-cart-btn');
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = '<i class="fas fa-check"></i> ¡AGREGADO!';
            addBtn.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                addBtn.innerHTML = originalText;
                addBtn.style.backgroundColor = '';
            }, 2000);
        }
    }
    
    function handleQuantityChange(e) {
        const action = e.target.dataset.action;
        const quantityInput = document.getElementById('quantity-input');
        let currentValue = parseInt(quantityInput.value);
        
        if (action === 'increase' && currentValue < 99) { // Límite máximo de 99 unidades
            quantityInput.value = currentValue + 1;
        } else if (action === 'decrease' && currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
        
        console.log(`🔢 Cantidad actualizada: ${quantityInput.value}`);
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
            <div class="cart-item" data-cart-id="${item.cartId}">
                <img src="${item.imagen_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlOWVjZWYiIHN0cm9rZT0iI2RlZTJlNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHRleHQgeD0iMTUwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmM3NTdkIj5TaW4gSW1hZ2VuPC90ZXh0PgogIDx0ZXh0IHg9IjE1MCIgeT0iMTE1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNhZGI1YmQiPlBsYWNlaG9sZGVyPC90ZXh0Pgo8L3N2Zz4K'}" alt="${item.nombre}" class="cart-item__image">
                <div class="cart-item__info">
                    <p class="cart-item__title">${item.nombre}</p>
                    ${item.selectedColor ? `<p class="cart-item__color">Color: ${item.selectedColor.nombre}</p>` : ''}
                    <p class="cart-item__price">$${parseFloat(item.precio).toFixed(0)} UYU</p>
                    <div class="cart-item__quantity">
                        <span>Cantidad: ${item.quantity}</span>
                    </div>
                </div>
                <button class="cart-item__remove" data-cart-id="${item.cartId}">&times;</button>
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
            const cartId = e.target.dataset.cartId;
            cart = cart.filter(item => item.cartId !== cartId);
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
            if (item.selectedColor) {
                message += `  - Color: ${item.selectedColor.nombre}\n`;
            }
            message += `  - Cantidad: ${item.quantity}\n`;
            message += `  - Precio unitario: $${parseFloat(item.precio).toFixed(0)} UYU\n\n`;
        });

        const total = cart.reduce((sum, item) => sum + parseFloat(item.precio) * item.quantity, 0);
        message += `*Total del Pedido: $${total.toFixed(0)} UYU*\n\n`;
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

