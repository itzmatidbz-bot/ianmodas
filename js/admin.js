// Este archivo es casi idéntico al que corregimos, solo cambia las categorías.
document.addEventListener('DOMContentLoaded', () => {
    // --- Selectores del DOM ---
    const DOMElements = {
        sections: document.querySelectorAll('.admin-section'),
        navItems: document.querySelectorAll('.nav-item'),
        sidebar: document.querySelector('.admin-sidebar'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
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
        confirmMessage: document.getElementById('confirm-message'),
        confirmYesBtn: document.getElementById('confirm-yes'),
        confirmNoBtn: document.getElementById('confirm-no'),
        logoutButton: document.getElementById('logout-button')
    };

    let allProducts = [];
    let editingProductId = null;

    // --- INICIALIZACIÓN ---
    async function init() {
        await checkAdmin();
        setupEventListeners();
        await loadInitialData();
        switchSection('dashboard');
    }

    async function checkAdmin() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { // Simple check, en producción se verificaría un rol de admin
            window.location.href = 'login.html';
        }
    }

    function setupEventListeners() {
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
        DOMElements.searchInput.addEventListener('input', debounce(() => renderProductsTable(DOMElements.searchInput.value), 300));
        DOMElements.productForm.addEventListener('submit', handleProductFormSubmit);
        DOMElements.productForm.addEventListener('reset', resetProductForm);
        DOMElements.productsTableBody.addEventListener('click', handleTableActions);
        setupImageUploadListeners();
        DOMElements.confirmNoBtn.addEventListener('click', () => DOMElements.confirmModal.style.display = 'none');
    }

    async function loadInitialData() {
        try {
            const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
            if (error) throw error;
            allProducts = data;
            updateDashboardStats();
            renderProductsTable();
        } catch (error) {
            alert('Error al cargar datos: ' + error.message);
        }
    }

    function toggleMobileMenu() {
        DOMElements.sidebar.classList.toggle('active');
        DOMElements.sidebarOverlay.classList.toggle('active');
    }

    function switchSection(sectionName) {
        if (sectionName === 'new-product') resetProductForm();
        DOMElements.sections.forEach(s => s.classList.toggle('active', s.id === sectionName));
        DOMElements.navItems.forEach(item => item.classList.toggle('active', item.dataset.section === sectionName));
    }

    function updateDashboardStats() {
        DOMElements.totalProducts.textContent = allProducts.length;
        DOMElements.lowStock.textContent = allProducts.filter(p => p.stock > 0 && p.stock < 5).length;
        DOMElements.totalCategories.textContent = new Set(allProducts.map(p => p.categoria)).size;
    }

    function renderProductsTable(searchTerm = '') {
        const filtered = allProducts.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        DOMElements.productsTableBody.innerHTML = filtered.map(product => `
            <tr data-id="${product.id}">
                <td><img src="${product.imagen_url}" alt="${product.nombre}" class="product-table-img"></td>
                <td>${product.nombre}</td><td>${product.categoria}</td>
                <td>$${product.precio.toFixed(2)}</td><td class="${product.stock < 5 ? 'low-stock' : ''}">${product.stock}</td>
                <td>
                    <button class="btn-icon" data-action="edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" data-action="delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    }

    function handleTableActions(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        const productId = parseInt(button.closest('tr').dataset.id);
        if (action === 'edit') openEditForm(productId);
        else if (action === 'delete') confirmDelete(productId);
    }

    function openEditForm(id) {
        const product = allProducts.find(p => p.id === id);
        editingProductId = id;
        DOMElements.formTitle.textContent = 'Editar Producto';
        DOMElements.submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        DOMElements.productForm.nombre.value = product.nombre;
        DOMElements.productForm.descripcion.value = product.descripcion;
        DOMElements.productForm.precio.value = product.precio;
        DOMElements.productForm.stock.value = product.stock;
        DOMElements.productForm.categoria.value = product.categoria;
        DOMElements.imagePreview.src = product.imagen_url;
        DOMElements.imagePreview.style.display = 'block';
        switchSection('new-product');
    }
    
    async function handleProductFormSubmit(e) {
        e.preventDefault();
        DOMElements.submitButton.disabled = true;
        try {
            const formData = new FormData(DOMElements.productForm);
            const productData = Object.fromEntries(formData.entries());
            const file = DOMElements.imageInput.files[0];

            if (file) {
                const filePath = `public/${Date.now()}-${file.name}`;
                await supabase.storage.from('productos').upload(filePath, file);
                const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filePath);
                productData.imagen_url = publicUrl;
            } else if (!editingProductId) {
                throw new Error('Debes seleccionar una imagen para un nuevo producto.');
            }

            const { error } = editingProductId
                ? await supabase.from('productos').update(productData).eq('id', editingProductId)
                : await supabase.from('productos').insert([productData]);
            
            if (error) throw error;
            alert(`Producto ${editingProductId ? 'actualizado' : 'creado'}!`);
            await loadInitialData();
            switchSection('products');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            DOMElements.submitButton.disabled = false;
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

    function setupImageUploadListeners() {
        DOMElements.imageUploadArea.addEventListener('click', () => DOMElements.imageInput.click());
        DOMElements.imageInput.addEventListener('change', e => handleFileSelect(e.target.files));
    }

    function handleFileSelect(files) {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                DOMElements.imagePreview.src = e.target.result;
                DOMElements.imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
    
    function confirmDelete(id) {
        const product = allProducts.find(p => p.id === id);
        DOMElements.confirmMessage.textContent = `¿Seguro que quieres eliminar "${product.nombre}"?`;
        DOMElements.confirmModal.style.display = 'flex';
        DOMElements.confirmYesBtn.onclick = () => deleteProduct(id);
    }
    
    async function deleteProduct(id) {
        try {
            const { error } = await supabase.from('productos').delete().eq('id', id);
            if (error) throw error;
            alert('Producto eliminado.');
            DOMElements.confirmModal.style.display = 'none';
            await loadInitialData();
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    }
    
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    init();
});
