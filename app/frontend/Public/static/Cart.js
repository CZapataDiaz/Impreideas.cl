// Carrito de Compras - ImpreIdeas
// Sistema de gestión del carrito de compras para e-commerce B2B
class ShoppingCart {
    constructor() {
        this.items = []; // Array de productos en el carrito
        this.loadFromStorage(); // Cargar datos guardados
        this.setupEventListeners(); // Configurar eventos
    }

    // Cargar carrito desde almacenamiento local del navegador
    loadFromStorage() {
        const saved = localStorage.getItem('impreIdeas-cart');
        if (saved) {
            this.items = JSON.parse(saved);
        }
        this.updateCartUI(); // Actualizar interfaz
    }

    // Guardar carrito en almacenamiento local del navegador
    saveToStorage() {
        localStorage.setItem('impreIdeas-cart', JSON.stringify(this.items));
        this.updateCartUI(); // Actualizar interfaz
    }

    // Agregar producto al carrito con opciones de personalización
    addItem(productId, quantity = 1, personalization = {}) {
        const product = mockProducts.find(p => p.id === productId);
        if (!product) return false;

        // Verificar si ya existe el producto con la misma personalización
        const existingIndex = this.items.findIndex(item => 
            item.productId === productId && 
            JSON.stringify(item.personalization) === JSON.stringify(personalization)
        );

        if (existingIndex !== -1) {
            // Si existe, aumentar cantidad
            this.items[existingIndex].quantity += quantity;
        } else {
            // Si no existe, agregar nuevo item al carrito
            const newItem = {
                id: Date.now() + Math.random(), // ID único para el item del carrito
                productId: productId,
                product: product,
                quantity: quantity,
                personalization: personalization,
                addedAt: new Date().toISOString() // Fecha de agregado
            };
            this.items.push(newItem);
        }

        this.saveToStorage(); // Guardar cambios
        this.showAddToCartNotification(product.name); // Mostrar notificación
        return true;
    }

    // Remover producto del carrito completamente
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage(); // Guardar cambios
    }

    // Actualizar cantidad de un producto específico
    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(itemId); // Si cantidad es 0 o menor, eliminar
            return;
        }

        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage(); // Guardar cambios
        }
    }

    // Limpiar carrito completamente
    clearCart() {
        this.items = [];
        this.saveToStorage(); // Guardar cambios
    }

    // Obtener cantidad total de items en el carrito
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Calcular precio total del carrito en CLP
    getTotalPrice() {
        return this.items.reduce((total, item) => {
            let itemPrice = parseFloat(item.product.basePrice) || 0;
            
            // Agregar costo de personalización si existe
            if (item.personalization.area) {
                const area = item.product.personalizationAreas.find(a => a.name === item.personalization.area);
                if (area) {
                    itemPrice += parseFloat(area.price) || 0;
                }
            }
            
            return total + (itemPrice * item.quantity);
        }, 0);
    }

    // Obtener resumen completo del pedido
    getOrderSummary() {
        return {
            items: this.items,
            totalItems: this.getTotalItems(),
            totalPrice: this.getTotalPrice(),
            categories: [...new Set(this.items.map(item => item.product.category))], // Categorías únicas
            companies: this.items.length > 0 ? ['ImpreIdeas'] : []
        };
    }

    // Configurar todos los eventos del carrito
    setupEventListeners() {
        // Evento para abrir el carrito al hacer clic en el botón
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-btn') || e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.openCartModal();
            }
        });

        // Evento para cerrar modal del carrito
        document.addEventListener('click', (e) => {
            if (e.target.matches('#cartModal') || e.target.matches('.cart-close')) {
                this.closeCartModal();
            }
        });

        // Eventos para acciones dentro del carrito
        document.addEventListener('click', (e) => {
            // Botón eliminar producto
            if (e.target.matches('.remove-item')) {
                const itemId = e.target.dataset.itemId;
                this.removeItem(parseFloat(itemId));
            }

            // Botones de aumentar/disminuir cantidad
            if (e.target.matches('.quantity-btn')) {
                const itemId = parseFloat(e.target.dataset.itemId);
                const action = e.target.dataset.action;
                const currentItem = this.items.find(item => item.id === itemId);
                
                if (currentItem) {
                    if (action === 'increase') {
                        this.updateQuantity(itemId, currentItem.quantity + 1);
                    } else if (action === 'decrease') {
                        this.updateQuantity(itemId, currentItem.quantity - 1);
                    }
                }
            }
        });

        // Evento para cambio manual de cantidad en input
        document.addEventListener('change', (e) => {
            if (e.target.matches('.quantity-input')) {
                const itemId = parseFloat(e.target.dataset.itemId);
                const newQuantity = parseInt(e.target.value) || 1;
                this.updateQuantity(itemId, newQuantity);
            }
        });
    }

    // Actualizar contadores visuales del carrito en la interfaz
    updateCartUI() {
        const totalItems = this.getTotalItems();
        
        // Actualizar contador del carrito en versión desktop
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Actualizar contador del carrito en versión móvil
        const mobileCartCount = document.getElementById('mobileCartCount');
        if (mobileCartCount) {
            mobileCartCount.textContent = totalItems;
        }
    }

    // Mostrar notificación temporal cuando se agrega un producto
    showAddToCartNotification(productName) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>Producto agregado: ${productName}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar animación de entrada
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Abrir modal del carrito
    openCartModal() {
        this.renderCartModal(); // Generar contenido
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
        }
    }

    // Cerrar modal del carrito
    closeCartModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    }

    // Renderizar todo el contenido del modal del carrito
    renderCartModal() {
        let modal = document.getElementById('cartModal');
        if (!modal) {
            // Crear modal si no existe
            modal = document.createElement('div');
            modal.id = 'cartModal';
            modal.className = 'modal cart-modal';
            document.body.appendChild(modal);
        }

        const summary = this.getOrderSummary();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const isDark = currentTheme === 'dark';

        modal.innerHTML = `
            <div class="modal-content cart-content">
                <div class="cart-header">
                    <h2 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-shopping-cart"></i>
                        Carrito de Cotización
                    </h2>
                    <button class="cart-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="cart-body">
                    ${this.items.length === 0 ? this.renderEmptyCart(isDark) : this.renderCartItems(isDark)}
                </div>

                ${this.items.length > 0 ? this.renderCartFooter(summary, isDark) : ''}
            </div>
        `;
    }

    // Renderizar estado de carrito vacío
    renderEmptyCart(isDark) {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">Tu carrito está vacío</h3>
                <p style="color: ${isDark ? '#d1d5db' : '#6b7280'};">
                    Explora nuestro catálogo y encuentra los productos perfectos para tu empresa.
                </p>
                <button class="btn-primary" onclick="cart.closeCartModal(); document.getElementById('catalog').scrollIntoView({behavior: 'smooth'})">
                    Ver Catálogo
                </button>
            </div>
        `;
    }

    // Renderizar lista de productos en el carrito
    renderCartItems(isDark) {
        return `
            <div class="cart-items">
                ${this.items.map(item => this.renderCartItem(item, isDark)).join('')}
            </div>
        `;
    }

    // Renderizar un producto individual en el carrito
    renderCartItem(item, isDark) {
        const basePrice = parseFloat(item.product.basePrice) || 0;
        let personalizationPrice = 0;
        
        // Calcular precio de personalización si existe
        if (item.personalization.area) {
            const area = item.product.personalizationAreas.find(a => a.name === item.personalization.area);
            if (area) {
                personalizationPrice = parseFloat(area.price) || 0;
            }
        }
        
        const unitPrice = basePrice + personalizationPrice;
        const totalPrice = unitPrice * item.quantity;
        const minOrder = item.product.minOrder;
        const meetsMinOrder = item.quantity >= minOrder; // Verificar si cumple pedido mínimo

        return `
            <div class="cart-item" style="background: ${isDark ? '#374151' : '#ffffff'}; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'};">
                <div class="item-image">
                    <img src="${item.product.image}" alt="${item.product.name}" />
                    <span class="item-category" style="background: ${isDark ? '#1f2937' : '#f3f4f6'}; color: ${isDark ? '#f9fafb' : '#374151'};">
                        ${item.product.category}
                    </span>
                </div>
                
                <div class="item-details">
                    <h4 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">${item.product.name}</h4>
                    <p style="color: ${isDark ? '#d1d5db' : '#6b7280'};">${item.product.description}</p>
                    
                    ${item.personalization.area ? `
                        <div class="personalization-info" style="background: ${isDark ? '#1f2937' : '#f0f9ff'}; color: ${isDark ? '#93c5fd' : '#1e40af'};">
                            <i class="fas fa-palette"></i>
                            <span>Personalización: ${item.personalization.area}</span>
                            ${item.personalization.color ? `<span>• Color: ${item.personalization.color}</span>` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="price-info">
                        <div class="unit-price" style="color: ${isDark ? '#d1d5db' : '#6b7280'};">
                            Precio unitario: 
                            <span style="color: ${isDark ? '#38bdf8' : '#0ea5e9'}; font-weight: 600;">
                                $${unitPrice.toLocaleString('es-CL')} CLP
                            </span>
                        </div>
                        ${personalizationPrice > 0 ? `
                            <div class="personalization-cost" style="color: ${isDark ? '#d1d5db' : '#6b7280'}; font-size: 0.875rem;">
                                (Base: $${basePrice.toLocaleString('es-CL')} + Personalización: $${personalizationPrice.toLocaleString('es-CL')} CLP)
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="min-order-info ${meetsMinOrder ? 'meets-minimum' : 'below-minimum'}" 
                         style="color: ${meetsMinOrder ? (isDark ? '#86efac' : '#16a34a') : (isDark ? '#fca5a5' : '#dc2626')};">
                        <i class="fas ${meetsMinOrder ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                        <span>Pedido mínimo: ${minOrder} unidades ${meetsMinOrder ? '✓' : `(faltan ${minOrder - item.quantity})`}</span>
                    </div>
                </div>
                
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-item-id="${item.id}" data-action="decrease">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                               data-item-id="${item.id}" style="color: ${isDark ? '#f9fafb' : '#1f2937'}; background: ${isDark ? '#1f2937' : '#ffffff'};">
                        <button class="quantity-btn" data-item-id="${item.id}" data-action="increase">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="item-total" style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        Total: <span style="color: ${isDark ? '#38bdf8' : '#0ea5e9'}; font-weight: 700; font-size: 1.125rem;">$${totalPrice.toLocaleString('es-CL')} CLP</span>
                    </div>
                    
                    <button class="remove-item" data-item-id="${item.id}" style="color: ${isDark ? '#fca5a5' : '#dc2626'};">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    // Renderizar pie del carrito con resumen y botones de acción
    renderCartFooter(summary, isDark) {
        const hasMinOrderIssues = this.items.some(item => item.quantity < item.product.minOrder);
        
        return `
            <div class="cart-footer" style="background: ${isDark ? '#1f2937' : '#f9fafb'}; border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};">
                <div class="cart-summary">
                    <div class="summary-row">
                        <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Total de productos:</span>
                        <span style="color: ${isDark ? '#f9fafb' : '#1f2937'}; font-weight: 600;">${summary.totalItems} unidades</span>
                    </div>
                    <div class="summary-row">
                        <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Categorías:</span>
                        <span style="color: ${isDark ? '#f9fafb' : '#1f2937'};">${summary.categories.join(', ')}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span style="color: ${isDark ? '#f9fafb' : '#1f2937'}; font-size: 1.125rem; font-weight: 600;">Total estimado:</span>
                        <span style="color: ${isDark ? '#38bdf8' : '#0ea5e9'}; font-size: 1.5rem; font-weight: 700;">$${summary.totalPrice.toLocaleString('es-CL')} CLP</span>
                    </div>
                    
                    ${hasMinOrderIssues ? `
                        <div class="min-order-warning" style="background: ${isDark ? '#7f1d1d' : '#fef2f2'}; color: ${isDark ? '#fca5a5' : '#dc2626'}; border: 1px solid ${isDark ? '#dc2626' : '#fecaca'};">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Algunos productos no cumplen el pedido mínimo. Ajusta las cantidades para continuar.</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="cart-actions">
                    <button class="btn-outline" onclick="cart.clearCart()">
                        <i class="fas fa-trash-alt"></i>
                        Vaciar Carrito
                    </button>
                    <button class="btn-primary ${hasMinOrderIssues ? 'disabled' : ''}" 
                            onclick="cart.sendQuoteRequest()" 
                            ${hasMinOrderIssues ? 'disabled' : ''}>
                        <i class="fas fa-paper-plane"></i>
                        Solicitar Cotización
                    </button>
                </div>
                
                <div class="quote-info" style="color: ${isDark ? '#d1d5db' : '#6b7280'};">
                    <i class="fas fa-info-circle"></i>
                    <span>Recibirás una cotización personalizada en las próximas 24 horas</span>
                </div>
            </div>
        `;
    }

    // Enviar solicitud de cotización al equipo de ventas
    sendQuoteRequest() {
        const summary = this.getOrderSummary();
        
        // Verificar que todos los productos cumplan el pedido mínimo
        const hasMinOrderIssues = this.items.some(item => item.quantity < item.product.minOrder);
        if (hasMinOrderIssues) {
            alert('Por favor, verifica que todos los productos cumplan con el pedido mínimo.');
            return;
        }

        // Generar texto detallado para la cotización
        const quoteDetails = this.generateQuoteText();
        
        // Simular envío de cotización (en producción se enviaría a un servidor)
        const success = this.simulateQuoteSending();
        
        if (success) {
            alert(`¡Cotización enviada exitosamente!\n\n${quoteDetails}\n\nEn ImpreIdeas nos comunicaremos contigo en las próximas 24 horas para confirmar los detalles y enviar la cotización final.`);
            
            // Limpiar carrito después del envío exitoso
            this.clearCart();
            this.closeCartModal();
        } else {
            alert('Hubo un error al enviar la cotización. Por favor, intenta nuevamente.');
        }
    }

    // Generar texto detallado de la cotización
    generateQuoteText() {
        const summary = this.getOrderSummary();
        let quoteText = `SOLICITUD DE COTIZACIÓN - IMPREIDEAS\n`;
        quoteText += `==========================================\n\n`;
        quoteText += `Total de productos: ${summary.totalItems} unidades\n`;
        quoteText += `Categorías: ${summary.categories.join(', ')}\n`;
        quoteText += `Precio estimado: $${summary.totalPrice.toLocaleString('es-CL')} CLP\n\n`;
        quoteText += `DETALLE DE PRODUCTOS:\n`;
        quoteText += `---------------------\n`;
        
        this.items.forEach((item, index) => {
            const basePrice = parseFloat(item.product.basePrice) || 0;
            let personalizationPrice = 0;
            
            // Calcular precio de personalización
            if (item.personalization.area) {
                const area = item.product.personalizationAreas.find(a => a.name === item.personalization.area);
                if (area) personalizationPrice = parseFloat(area.price) || 0;
            }
            
            const unitPrice = basePrice + personalizationPrice;
            const totalPrice = unitPrice * item.quantity;
            
            quoteText += `\n${index + 1}. ${item.product.name}\n`;
            quoteText += `   Cantidad: ${item.quantity} unidades\n`;
            quoteText += `   Precio unitario: $${unitPrice.toLocaleString('es-CL')} CLP\n`;
            quoteText += `   Total: $${totalPrice.toLocaleString('es-CL')} CLP\n`;
            
            if (item.personalization.area) {
                quoteText += `   Personalización: ${item.personalization.area}`;
                if (item.personalization.color) {
                    quoteText += ` - Color: ${item.personalization.color}`;
                }
                quoteText += `\n`;
            }
        });
        
        return quoteText;
    }

    // Simular envío de cotización (en producción sería una llamada real al servidor)
    simulateQuoteSending() {
        // Aquí normalmente harías una llamada HTTP a tu backend
        // Por ahora simulamos un envío exitoso con 90% de probabilidad
        return Math.random() > 0.1;
    }
}

// Crear instancia global del carrito para uso en toda la aplicación
const cart = new ShoppingCart();