// Variables globales para el manejo de la aplicación
let filteredProducts = []; // Productos filtrados según búsqueda y categoría
let selectedCategory = 'Todos'; // Categoría seleccionada actualmente
let sortBy = 'name'; // Criterio de ordenamiento actual
let searchQuery = ''; // Término de búsqueda actual

// Inicializar aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado correctamente');
    
    // Esperar un poco para que todos los scripts se carguen
    setTimeout(function() {
        initializeApp();
        setupEventListeners();
        initializeTheme();
    }, 100);
});

// Inicializar la aplicación principal
function initializeApp() {
    console.log('Inicializando aplicación...');
    console.log('¿mockProducts disponible?', typeof mockProducts !== 'undefined');
    console.log('¿mockCategories disponible?', typeof mockCategories !== 'undefined');
    
    // Verificar que los datos estén disponibles
    if (typeof mockProducts === 'undefined') {
        console.error('mockProducts no está definido!');
        return;
    }
    
    if (typeof mockCategories === 'undefined') {
        console.error('mockCategories no está definido!');
        return;
    }
    
    // Renderizar componentes iniciales
    renderCategories();
    filterAndRenderProducts();
}

// Configurar todos los event listeners de la aplicación
function setupEventListeners() {
    // Funcionalidad de búsqueda
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', handleSearch);
    }
    
    // Funcionalidad de ordenamiento
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // Menú móvil hamburguesa
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            if (mobileNav) {
                mobileNav.classList.toggle('active');
            }
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
    
    // Configurar cambio de tema
    setupThemeToggles();
    
    // Modal de productos
    const modalClose = document.getElementById('modalClose');
    const productModal = document.getElementById('productModal');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeModal();
            }
        });
    }
    
    // Botones del hero section
    const catalogBtn = document.querySelector('.btn-primary');
    const quoteBtn = document.querySelector('.btn-outline');
    
    if (catalogBtn) {
        catalogBtn.addEventListener('click', function() {
            const catalog = document.getElementById('catalog');
            if (catalog) {
                catalog.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (quoteBtn) {
        quoteBtn.addEventListener('click', function() {
            alert('¡Gracias por tu interés! El equipo de ImpreIdeas te contactará pronto para tu cotización personalizada.');
        });
    }
}

// Configurar botones de cambio de tema (modo claro/oscuro)
function setupThemeToggles() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
}

// Inicializar tema guardado en localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('impreIdeas-theme') || 'light';
    applyTheme(savedTheme);
}

// Alternar entre tema claro y oscuro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Aplicar tema específico a toda la interfaz
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('impreIdeas-theme', theme);
    
    const isDark = theme === 'dark';
    
    // Actualizar botón de tema en desktop
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon && themeText) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        themeText.textContent = isDark ? 'Claro' : 'Oscuro';
    }
    
    // Actualizar botón de tema en móvil
    const mobileThemeIcon = document.getElementById('mobileThemeIcon');
    const mobileThemeText = document.getElementById('mobileThemeText');
    if (mobileThemeIcon && mobileThemeText) {
        mobileThemeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        mobileThemeText.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
    }
}

// Manejar eventos de búsqueda en tiempo real
function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    
    // Sincronizar ambos campos de búsqueda (desktop y móvil)
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (e.target === searchInput && mobileSearchInput) {
        mobileSearchInput.value = e.target.value;
    } else if (e.target === mobileSearchInput && searchInput) {
        searchInput.value = e.target.value;
    }
    
    filterAndRenderProducts(); // Aplicar filtros y mostrar resultados
}

// Manejar cambio de ordenamiento
function handleSort(e) {
    sortBy = e.target.value;
    filterAndRenderProducts(); // Aplicar ordenamiento y mostrar resultados
}

// Manejar clic en botones de categoría
function handleCategoryClick(categoryName) {
    selectedCategory = categoryName;
    updateCategoryButtons(); // Actualizar estado visual de botones
    filterAndRenderProducts(); // Filtrar y mostrar productos
}

// Renderizar botones de categorías
function renderCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) {
        console.error('Contenedor de categorías no encontrado');
        return;
    }
    
    if (typeof mockCategories === 'undefined') {
        console.error('mockCategories no disponible');
        return;
    }
    
    console.log('Renderizando categorías:', mockCategories.length);
    
    categoriesContainer.innerHTML = mockCategories.map(category => `
        <button class="category-btn ${selectedCategory === category.name ? 'active' : ''}" 
                onclick="handleCategoryClick('${category.name}')">
            ${category.name}
            <span class="category-count">${category.count}</span>
        </button>
    `).join('');
}

// Actualizar estado visual de botones de categoría
function updateCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        const categoryName = btn.textContent.split(/\d+/)[0].trim();
        btn.classList.toggle('active', selectedCategory === categoryName);
    });
}

// Filtrar y renderizar productos según criterios actuales
function filterAndRenderProducts() {
    if (typeof mockProducts === 'undefined') {
        console.error('mockProducts no disponible para filtrar');
        return;
    }
    
    console.log('Filtrando productos. Total:', mockProducts.length);
    
    // Aplicar filtros
    filteredProducts = mockProducts.filter(product => {
        // Filtro por categoría
        const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
        
        // Filtro por búsqueda
        const searchMatch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery);
            
        return categoryMatch && searchMatch;
    });
    
    console.log('Productos filtrados:', filteredProducts.length);
    
    // Aplicar ordenamiento
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.basePrice - b.basePrice;
            case 'price-high':
                return b.basePrice - a.basePrice;
            case 'min-order':
                return a.minOrder - b.minOrder;
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    updateResultsCount(); // Actualizar contador de resultados
    renderProducts(); // Mostrar productos en la grilla
}

// Actualizar contador de resultados de búsqueda
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (!resultsCount) return;
    
    const countText = `Mostrando ${filteredProducts.length} productos`;
    const searchText = searchQuery ? ` para "${searchQuery}"` : '';
    resultsCount.textContent = countText + searchText;
}

// Renderizar grilla de productos
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!productsGrid || !emptyState) {
        console.error('Grilla de productos o estado vacío no encontrado');
        return;
    }
    
    console.log('Renderizando productos:', filteredProducts.length);
    
    // Mostrar estado vacío si no hay productos
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    productsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Generar HTML para cada producto
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-item">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-category">${product.category}</div>
                <div class="product-details-overlay">
                    <button class="view-details-btn" onclick="showProductModal(${product.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                </div>
            </div>
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-info">
                    <div class="product-price">
                        <span class="price">$${product.basePrice.toLocaleString('es-CL')} CLP</span>
                        <span class="price-unit">por unidad</span>
                    </div>
                    <div class="min-order">
                        <strong>Pedido mínimo:</strong> ${product.minOrder} unidades
                    </div>
                    <div class="product-colors">
                        ${product.availableColors.slice(0, 4).map(color => `
                            <span class="color-badge">${color}</span>
                        `).join('')}
                        ${product.availableColors.length > 4 ? `
                            <span class="color-badge">+${product.availableColors.length - 4}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="quote-btn personalize-btn" data-product-id="${product.id}">
                        <i class="fas fa-palette"></i>
                        Personalizar
                    </button>
                    <button class="quote-btn" onclick="handleAddToCart(${product.id})" style="background: var(--accent-secondary); margin-top: 0.5rem;">
                        <i class="fas fa-shopping-cart"></i>
                        Agregar Rápido
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Productos renderizados exitosamente');
}

// Mostrar modal detallado de un producto (versión simplificada)
function showProductModal(productId) {
    if (typeof mockProducts === 'undefined') return;
    
    const product = mockProducts.find(p => p.id === productId);
    const modalBody = document.getElementById('modalBody');
    const productModal = document.getElementById('productModal');
    
    if (!product || !modalBody || !productModal) return;
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';
    
    // Generar contenido del modal simplificado
    modalBody.innerHTML = `
        <div style="padding: 2rem; color: ${isDark ? '#f9fafb' : '#1f2937'};">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 100%; height: 300px; object-fit: cover; border-radius: 0.5rem;">
                </div>
                <div>
                    <div style="background: ${isDark ? '#374151' : '#dbeafe'}; color: ${isDark ? '#38bdf8' : '#1e40af'}; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem; font-weight: 500; display: inline-block; margin-bottom: 1rem;">
                        ${product.category}
                    </div>
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: ${isDark ? '#f9fafb' : '#1f2937'}; margin-bottom: 1rem;">
                        ${product.name}
                    </h2>
                    <p style="color: ${isDark ? '#d1d5db' : '#6b7280'}; margin-bottom: 1.5rem; line-height: 1.6;">
                        ${product.description}
                    </p>
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-size: 2rem; font-weight: 700; color: #0ea5e9;">$${product.basePrice.toLocaleString('es-CL')} CLP</span>
                            <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">por unidad</span>
                        </div>
                        <p style="color: ${isDark ? '#d1d5db' : '#6b7280'}; font-size: 0.875rem;">
                            <strong style="color: ${isDark ? '#f9fafb' : '#374151'};">Pedido mínimo:</strong> ${product.minOrder} unidades
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-weight: 500; color: ${isDark ? '#f9fafb' : '#374151'}; margin-bottom: 0.5rem;">Colores disponibles:</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${product.availableColors.map(color => `
                                <span style="background: ${isDark ? '#374151' : '#f3f4f6'}; color: ${isDark ? '#f9fafb' : '#374151'}; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'};">
                                    ${color}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-weight: 500; color: ${isDark ? '#f9fafb' : '#374151'}; margin-bottom: 0.5rem;">Áreas de personalización:</h4>
                        ${product.personalizationAreas.map(area => `
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 0.375rem; margin-bottom: 0.5rem;">
                                <span style="color: ${isDark ? '#f9fafb' : '#374151'};">${area.name}</span>
                                <span style="color: #0ea5e9; font-weight: 500;">+$${area.price.toLocaleString('es-CL')} CLP</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div style="border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; padding-top: 1.5rem;">
                <div style="display: flex; gap: 1rem;">
                    <button onclick="personalization.openPersonalizationModal(${product.id}); closeModal();" 
                            style="flex: 2; background: #0ea5e9; color: white; border: none; padding: 1rem; border-radius: 0.5rem; font-size: 1.125rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background-color 0.3s;"
                            onmouseover="this.style.background='#0284c7'" 
                            onmouseout="this.style.background='#0ea5e9'">
                        <i class="fas fa-palette"></i>
                        Personalizar Producto
                    </button>
                    <button onclick="handleAddToCart(${product.id}); closeModal();" 
                            style="flex: 1; background: transparent; color: #0ea5e9; border: 2px solid #0ea5e9; padding: 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s;"
                            onmouseover="this.style.background='#f0f9ff'" 
                            onmouseout="this.style.background='transparent'">
                        <i class="fas fa-shopping-cart"></i>
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
}

// Cerrar modal de producto
function closeModal() {
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }
}

// Agregar producto al carrito con cantidad mínima (función rápida)
function handleAddToCart(productId) {
    if (typeof cart === 'undefined') {
        console.error('El carrito no está disponible');
        return;
    }
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Agregar con cantidad mínima y sin personalización
    cart.addItem(productId, product.minOrder, {});
}

// Manejar scroll suave para enlaces ancla
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

// Cerrar menú móvil al hacer clic en enlaces de navegación
document.addEventListener('click', function(e) {
    if (e.target.matches('.nav-mobile a')) {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            mobileNav.classList.remove('active');
        }
    }
});

// Manejar tecla Escape para cerrar modal
document.addEventListener('keydown', function(e) {
    const productModal = document.getElementById('productModal');
    if (e.key === 'Escape' && productModal && productModal.classList.contains('active')) {
        closeModal();
    }
});