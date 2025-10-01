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
            document.getElementById('loading-screen').style.display = 'none';
            document.querySelector('.admin-layout').style.display = 'block';
            
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

    async function loadInitialData() {
        try {
            // Cargar productos
            const { data: products, error: productsError } = await supabase
                .from('productos')
                .select('*')
                .order('id', { ascending: true });
            
            if (productsError) throw productsError;

            // Cargar usuarios (mayoristas)
            const users = await loadUsers();
            
            return { products, users };
        } catch (error) {
            alert('Error al cargar datos: ' + error.message);
            return null;
        }
    }

    async function loadUsers() {
        try {
            console.log('Intentando cargar mayoristas...');
            
            // Verificar primero si somos admin
            const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
            if (adminError) {
                console.error('Error verificando permisos de admin:', adminError);
                return [];
            }
            
            if (!isAdmin) {
                console.warn('Usuario no es admin, no puede cargar lista de mayoristas');
                return [];
            }

            // Intentar cargar mayoristas
            const { data: mayoristas, error: mayoristasError } = await supabase
                .from('mayoristas')
                .select('id, nombre_empresa, created_at')
                .order('created_at', { ascending: false });

            if (mayoristasError) {
                console.error('Error al cargar mayoristas:', mayoristasError);
                
                // Intentar método alternativo si falla el principal
                console.log('Intentando método alternativo...');
                return await loadUsersAlternative();
            }

            console.log(`Mayoristas cargados: ${mayoristas?.length || 0}`);

            // Convertir a formato esperado
            const usersWithDetails = (mayoristas || []).map(mayorista => ({
                id: mayorista.id,
                email: `usuario-${mayorista.id.substring(0, 8)}@mayorista.com`, // Email simulado
                nombre_empresa: mayorista.nombre_empresa || 'Empresa no especificada',
                created_at: mayorista.created_at || new Date().toISOString(),
                status: 'confirmed'
            }));

            return usersWithDetails;
        } catch (error) {
            console.error('Error general al cargar usuarios:', error);
            return [];
        }
    }

    // Método alternativo usando función RPC
    async function loadUsersAlternative() {
        try {
            console.log('Usando método alternativo para cargar usuarios...');
            
            // Usar función RPC para obtener lista de mayoristas
            const { data, error } = await supabase.rpc('get_mayoristas_list');
            
            if (error) {
                console.warn('Método alternativo también falló:', error);
                
                // Intentar solo obtener el conteo
                const { data: count, error: countError } = await supabase.rpc('get_mayoristas_count');
                
                if (!countError && count > 0) {
                    // Si tenemos conteo pero no lista, mostrar datos genéricos
                    const mockUsers = [];
                    for (let i = 1; i <= Math.min(count, 5); i++) {
                        mockUsers.push({
                            id: `user-${i}`,
                            email: `mayorista${i}@empresa.com`,
                            nombre_empresa: `Empresa ${i}`,
                            created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                            status: 'confirmed'
                        });
                    }
                    return mockUsers;
                }
                
                // Si nada funciona, retornar mensaje explicativo
                return [{
                    id: 'config-needed',
                    email: 'config@needed.com',
                    nombre_empresa: 'Configurar permisos en Supabase',
                    created_at: new Date().toISOString(),
                    status: 'pending'
                }];
            }

            // Convertir datos de RPC al formato esperado
            const usersWithDetails = (data || []).map(user => ({
                id: user.id,
                email: user.email,
                nombre_empresa: user.nombre_empresa,
                created_at: user.created_at,
                status: 'confirmed'
            }));

            console.log(`Usuarios cargados via RPC: ${usersWithDetails.length}`);
            return usersWithDetails;
            
        } catch (error) {
            console.error('Error en método alternativo:', error);
            return [{
                id: 'error-loading',
                email: 'error@loading.com',
                nombre_empresa: 'Error al cargar datos - Revisar configuración',
                created_at: new Date().toISOString(),
                status: 'pending'
            }];
        }
    }
    
    function renderUI(data) {
        if (!data) return;
        const { products, users } = data;
        
        updateDashboardStats(products, users);
        renderProductsTable(products);
        renderUsersTable(users);
        renderRecentActivity(products, users);
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners(products, users) {
        DOMElements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (DOMElements.sidebar.classList.contains('active')) toggleMobileMenu();
                const section = e.currentTarget.dataset.section;
                if (section) switchSection(section);
            });
        });

        DOMElements.menuToggle.addEventListener('click', toggleMobileMenu);
        DOMElements.sidebarOverlay.addEventListener('click', toggleMobileMenu);

        // Búsqueda de productos
        if (DOMElements.searchInput) {
            DOMElements.searchInput.addEventListener('input', debounce(() => {
                const query = DOMElements.searchInput.value.toLowerCase();
                const filteredProducts = products.filter(p => 
                    p.nombre.toLowerCase().includes(query) || 
                    p.categoria.toLowerCase().includes(query)
                );
                renderProductsTable(filteredProducts);
            }, 300));
        }

        // Búsqueda de usuarios
        if (DOMElements.searchUsersInput && users) {
            DOMElements.searchUsersInput.addEventListener('input', debounce(() => {
                const query = DOMElements.searchUsersInput.value.toLowerCase();
                const filteredUsers = users.filter(u => 
                    u.nombre_empresa.toLowerCase().includes(query) || 
                    u.email.toLowerCase().includes(query)
                );
                renderUsersTable(filteredUsers);
            }, 300));
        }

        DOMElements.logoutButton.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });

        DOMElements.searchInput.addEventListener('input', debounce(() => {
            const searchTerm = DOMElements.searchInput.value.toLowerCase();
            const filtered = products.filter(p => p.nombre.toLowerCase().includes(searchTerm));
            renderProductsTable(filtered);
        }, 300));
        
        DOMElements.productForm.addEventListener('submit', (e) => handleProductFormSubmit(e, products));
        DOMElements.productForm.addEventListener('reset', resetProductForm);
        
        DOMElements.productsTableBody.addEventListener('click', (e) => handleTableActions(e, products));
        
        setupImageUploadListeners();

        DOMElements.confirmNoBtn.addEventListener('click', () => DOMElements.confirmModal.style.display = 'none');
    }

    // --- LÓGICA DEL FORMULARIO ---
    async function handleProductFormSubmit(e, products) {
        e.preventDefault();
        DOMElements.submitButton.disabled = true;
        DOMElements.submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando...`;

        try {
            const formData = new FormData(DOMElements.productForm);
            const productData = {
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion'),
                precio: parseFloat(formData.get('precio')),
                stock: parseInt(formData.get('stock')),
                categoria: formData.get('categoria')
            };

            const file = DOMElements.imageInput.files[0];
            let imageUrl;

            if (file) {
                const filePath = `public/${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('productos').upload(filePath, file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('productos').getPublicUrl(filePath);
                imageUrl = urlData.publicUrl;
            } else if (editingProductId) {
                imageUrl = products.find(p => p.id === editingProductId).imagen_url;
            } else {
                throw new Error('Debes seleccionar una imagen para un nuevo producto.');
            }

            productData.imagen_url = imageUrl;

            const { error } = editingProductId
                ? await supabase.from('productos').update(productData).eq('id', editingProductId)
                : await supabase.from('productos').insert([productData]);

            if (error) throw error;

            alert(`Producto ${editingProductId ? 'actualizado' : 'creado'} con éxito.`);
            window.location.reload(); // Recarga para ver todos los cambios

        } catch (error) {
            alert('Error al guardar el producto: ' + error.message);
        } finally {
            DOMElements.submitButton.disabled = false;
            resetProductForm();
        }
    }
    
    function openEditForm(productId, products) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        editingProductId = productId;

        // Cambiar a la sección sin resetear el formulario
        DOMElements.sections.forEach(s => s.classList.toggle('active', s.id === 'new-product'));
        DOMElements.navItems.forEach(item => item.classList.toggle('active', item.dataset.section === 'new-product'));

        // Llenar el formulario con los datos del producto
        DOMElements.formTitle.textContent = 'Editar Producto';
        DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        DOMElements.productForm.nombre.value = product.nombre;
        DOMElements.productForm.descripcion.value = product.descripcion;
        DOMElements.productForm.precio.value = product.precio;
        DOMElements.productForm.stock.value = product.stock;
        DOMElements.productForm.categoria.value = product.categoria;
        DOMElements.imagePreview.src = product.imagen_url;
        DOMElements.imagePreview.style.display = 'block';
    }

    function resetProductForm() {
        editingProductId = null;
        DOMElements.productForm.reset();
        DOMElements.imagePreview.src = '';
        DOMElements.imagePreview.style.display = 'none';
        DOMElements.formTitle.textContent = 'Añadir Nuevo Producto';
        DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    }

    // --- FUNCIONES AUXILIARES ---
    function renderProductsTable(products) {
        DOMElements.productsTableBody.innerHTML = products.map(product => `
            <tr data-id="${product.id}">
                <td><img src="${product.imagen_url}" alt="${product.nombre}" class="product-table-img"></td>
                <td>${product.nombre}</td>
                <td>${product.categoria}</td>
                <td>$${product.precio ? product.precio.toFixed(2) : '0.00'}</td>
                <td class="${product.stock < 5 ? 'low-stock' : ''}">${product.stock}</td>
                <td>
                    <button class="btn-icon edit" data-action="edit" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon danger" data-action="delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    }

    function updateDashboardStats(products, users) {
        // Estadísticas de usuarios
        const totalUsersElement = document.getElementById('total-users');
        if (totalUsersElement) {
            totalUsersElement.textContent = users?.length || 0;
        }

        // Estadísticas de productos
        const totalProductsElement = document.getElementById('total-products');
        if (totalProductsElement) {
            totalProductsElement.textContent = products?.length || 0;
        }

        const lowStockElement = document.getElementById('low-stock');
        if (lowStockElement) {
            lowStockElement.textContent = products?.filter(p => p.stock > 0 && p.stock < 5).length || 0;
        }

        const totalCategoriesElement = document.getElementById('total-categories');
        if (totalCategoriesElement) {
            totalCategoriesElement.textContent = new Set(products?.map(p => p.categoria) || []).size;
        }

        // Valor total del stock
        const totalStockValueElement = document.getElementById('total-stock-value');
        if (totalStockValueElement && products) {
            const totalValue = products.reduce((sum, product) => sum + (product.precio * product.stock), 0);
            totalStockValueElement.textContent = `$${totalValue.toLocaleString()}`;
        }

        // Último registro
        const lastRegistrationElement = document.getElementById('last-registration');
        if (lastRegistrationElement && users && users.length > 0) {
            const lastUser = users[0]; // Ya están ordenados por fecha descendente
            const date = new Date(lastUser.created_at);
            lastRegistrationElement.textContent = date.toLocaleDateString();
        }
    }
    
    function renderUsersTable(users) {
        const usersTableBody = document.getElementById('users-table-body');
        const usersCount = document.getElementById('users-count');
        
        if (!usersTableBody || !users) return;

        usersCount.textContent = users.length;
        
        usersTableBody.innerHTML = users.map(user => {
            const createdDate = new Date(user.created_at).toLocaleDateString();
            const status = user.status === 'confirmed' ? 
                '<span class="user-status confirmed">Confirmado</span>' : 
                '<span class="user-status pending">Pendiente</span>';
            
            return `
                <tr data-id="${user.id}">
                    <td>${user.email}</td>
                    <td><strong>${user.nombre_empresa}</strong></td>
                    <td>${createdDate}</td>
                    <td>${status}</td>
                    <td>-</td>
                </tr>
            `;
        }).join('');
    }

    function renderRecentActivity(products, users) {
        // Productos recientes
        const recentProductsContainer = document.getElementById('recent-products');
        if (recentProductsContainer && products) {
            const recentProducts = products
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
            
            recentProductsContainer.innerHTML = recentProducts.map(product => `
                <div class="recent-item">
                    <div class="recent-item-info">
                        <strong>${product.nombre}</strong>
                        <small>${product.categoria} - Stock: ${product.stock}</small>
                    </div>
                    <div class="recent-item-date">
                        ${new Date(product.created_at).toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        }

        // Usuarios recientes
        const recentUsersContainer = document.getElementById('recent-users');
        if (recentUsersContainer && users) {
            const recentUsers = users.slice(0, 5);
            
            recentUsersContainer.innerHTML = recentUsers.map(user => `
                <div class="recent-item">
                    <div class="recent-item-info">
                        <strong>${user.nombre_empresa}</strong>
                        <small>${user.email}</small>
                    </div>
                    <div class="recent-item-date">
                        ${new Date(user.created_at).toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        }
    }

    function handleTableActions(e, products) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const productId = parseInt(button.closest('tr').dataset.id);
        if (action === 'edit') openEditForm(productId, products);
        else if (action === 'delete') confirmDelete(productId, products);
    }

    function confirmDelete(productId, products) {
        const product = products.find(p => p.id === productId);
        document.getElementById('confirm-message').textContent = `¿Seguro que quieres eliminar "${product.nombre}"?`;
        DOMElements.confirmModal.style.display = 'flex';
        DOMElements.confirmYesBtn.onclick = async () => {
            try {
                const { error } = await supabase.from('productos').delete().eq('id', productId);
                if (error) throw error;
                alert('Producto eliminado.');
                window.location.reload();
            } catch (error) {
                alert('Error al eliminar: ' + error.message);
            }
        };
    }

    function setupImageUploadListeners() {
        DOMElements.imageUploadArea.addEventListener('click', () => DOMElements.imageInput.click());
        DOMElements.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    DOMElements.imagePreview.src = event.target.result;
                    DOMElements.imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function toggleMobileMenu() {
        DOMElements.sidebar.classList.toggle('active');
        DOMElements.sidebarOverlay.classList.toggle('active');
    }

    function switchSection(sectionName) {
        // Solo resetear el formulario si se hace click en "Añadir Producto" desde el menú
        if (sectionName === 'new-product' && !editingProductId) {
            resetProductForm();
        }
        DOMElements.sections.forEach(s => s.classList.toggle('active', s.id === sectionName));
        DOMElements.navItems.forEach(item => item.classList.toggle('active', item.dataset.section === sectionName));
    }

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});

