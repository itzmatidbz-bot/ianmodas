document.addEventListener('DOMContentLoaded', async () => {
    let editingProductId = null;

    const DOMElements = {
        sidebar: document.querySelector('.admin-sidebar'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        sections: document.querySelectorAll('.admin-section'),
        navItems: document.querySelectorAll('.nav-item'),
        totalProducts: document.getElementById('total-products'),
        lowStock: document.getElementById('low-stock'),
        totalWholesalers: document.getElementById('total-wholesalers'), // Nuevo
        productsTableBody: document.getElementById('products-table-body'),
        wholesalersTableBody: document.getElementById('wholesalers-table-body'), // Nuevo
        searchInput: document.getElementById('search-input'),
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

    await protectPage();
    const { products, wholesalers } = await loadInitialData();
    if (products && wholesalers) {
        renderUI(products, wholesalers);
        setupEventListeners(products);
    }

    async function protectPage() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return window.location.href = 'login.html';
        const { data: isAdmin, error } = await supabase.rpc('is_admin');
        if (error || !isAdmin) {
            await supabase.auth.signOut();
            return window.location.href = 'login.html?error=auth';
        }
    }

    async function loadInitialData() {
        try {
            const [productsRes, wholesalersRes] = await Promise.all([
                supabase.from('productos').select('*').order('id', { ascending: true }),
                supabase.from('mayoristas').select('*, user:auth_users(email, created_at)')
            ]);
            
            if (productsRes.error) throw productsRes.error;
            if (wholesalersRes.error) throw wholesalersRes.error;
            
            return { products: productsRes.data, wholesalers: wholesalersRes.data };
        } catch (error) {
            alert('Error al cargar datos: ' + error.message);
            return { products: null, wholesalers: null };
        }
    }
    
    function renderUI(products, wholesalers) {
        updateDashboardStats(products, wholesalers);
        renderProductsTable(products);
        renderWholesalersTable(wholesalers);
    }

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
            const currentSection = document.querySelector('.admin-section.active').id;
            if (currentSection === 'products') {
                 const searchTerm = DOMElements.searchInput.value.toLowerCase();
                 const filtered = products.filter(p => p.nombre.toLowerCase().includes(searchTerm));
                 renderProductsTable(filtered);
            }
        }, 300));
        
        DOMElements.productForm.addEventListener('submit', (e) => handleProductFormSubmit(e, products));
        DOMElements.productForm.addEventListener('reset', resetProductForm);
        
        DOMElements.productsTableBody.addEventListener('click', (e) => handleTableActions(e, products));
        
        setupImageUploadListeners();

        DOMElements.confirmNoBtn.addEventListener('click', () => DOMElements.confirmModal.style.display = 'none');
    }

    async function handleProductFormSubmit(e, products) {
        e.preventDefault();
        DOMElements.submitButton.disabled = true;
        DOMElements.submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando...`;
        try {
            // ... (resto de la lógica del formulario de producto sin cambios)
        } catch (error) {
            // ...
        }
    }
    
    function resetProductForm() {
        editingProductId = null;
        DOMElements.productForm.reset();
        DOMElements.imagePreview.src = '';
        DOMElements.imagePreview.style.display = 'none';
        DOMElements.formTitle.textContent = 'Añadir Nuevo Producto';
        DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    }

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

    // --- NUEVAS FUNCIONES PARA MAYORISTAS ---
    function renderWholesalersTable(wholesalers) {
        DOMElements.wholesalersTableBody.innerHTML = wholesalers.map(w => {
            const registeredDate = new Date(w.user.created_at).toLocaleDateString();
            return `
                <tr>
                    <td>${w.nombre_empresa}</td>
                    <td>${w.user.email}</td>
                    <td>${registeredDate}</td>
                    <td>-</td> 
                </tr>
            `;
        }).join('');
    }
    
    function updateDashboardStats(products, wholesalers) {
        DOMElements.totalProducts.textContent = products.length;
        DOMElements.lowStock.textContent = products.filter(p => p.stock > 0 && p.stock < 5).length;
        DOMElements.totalWholesalers.textContent = wholesalers.length; // Nuevo
    }
    
    function handleTableActions(e, products) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const productId = parseInt(button.closest('tr').dataset.id);
        if (action === 'edit') openEditForm(productId, products);
        else if (action === 'delete') confirmDelete(productId, products);
    }
    
    function openEditForm(productId, products) {
        // ... (sin cambios)
    }

    function confirmDelete(productId, products) {
        // ... (sin cambios)
    }

    function setupImageUploadListeners() {
        // ... (sin cambios)
    }

    function toggleMobileMenu() {
        DOMElements.sidebar.classList.toggle('active');
        DOMElements.sidebarOverlay.classList.toggle('active');
    }

    function switchSection(sectionName) {
        if (sectionName === 'new-product') resetProductForm();
        DOMElements.sections.forEach(s => s.classList.toggle('active', s.id === sectionName));
        DOMElements.navItems.forEach(item => item.classList.toggle('active', item.dataset.section === sectionName));
        // Ajustar placeholder del buscador
        DOMElements.searchInput.placeholder = sectionName === 'wholesalers' ? 'Buscar mayoristas...' : 'Buscar productos...';
    }

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});

