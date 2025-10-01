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
        totalProducts: document.getElementById('total-products'),
        lowStock: document.getElementById('low-stock'),
        totalCategories: document.getElementById('total-categories'),
        productsTableBody: document.getElementById('products-table-body'),
        searchInput: document.getElementById('search-products'),
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
    const allProducts = await loadInitialData();
    if (allProducts) {
        renderUI(allProducts);
        setupEventListeners(allProducts);
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
            const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
            if (error) throw error;
            return data;
        } catch (error) {
            alert('Error al cargar productos: ' + error.message);
            return null;
        }
    }
    
    function renderUI(products) {
        updateDashboardStats(products);
        renderProductsTable(products);
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners(products) {
        DOMElements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (DOMElements.sidebar.classList.contains('active')) toggleMobileMenu();
                const section = e.currentTarget.dataset.section;
                if (section) switchSection(section);
            });
        });

        DOMElements.menuToggle.addEventListener('click', toggleMobileMenu);
        DOMElements.sidebarOverlay.addEventListener('click', toggleMobileMenu);

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

    function updateDashboardStats(products) {
        DOMElements.totalProducts.textContent = products.length;
        DOMElements.lowStock.textContent = products.filter(p => p.stock > 0 && p.stock < 5).length;
        DOMElements.totalCategories.textContent = new Set(products.map(p => p.categoria)).size;
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

