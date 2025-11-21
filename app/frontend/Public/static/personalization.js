// Sistema de Personalización - ImpreIdeas
// Manejo completo de personalización de productos para clientes B2B

class PersonalizationSystem {
    constructor() {
        this.currentProduct = null; // Producto siendo personalizado
        this.selectedOptions = {
            color: '',
            logoPosition: '',
            logoSize: '',
            printMethod: '',
            quantity: 1,
            logoFile: null,
            logoText: '',
            additionalNotes: ''
        };
        this.setupEventListeners();
    }

    // Configurar eventos del sistema de personalización
    setupEventListeners() {
        // Eventos para botones de personalización
        document.addEventListener('click', (e) => {
            if (e.target.matches('.personalize-btn') || e.target.closest('.personalize-btn')) {
                e.preventDefault();
                const productId = parseInt(e.target.dataset.productId);
                this.openPersonalizationModal(productId);
            }

            if (e.target.matches('#personalizationClose') || e.target.matches('#personalizationModal')) {
                this.closePersonalizationModal();
            }
        });

        // Eventos para selección de opciones
        document.addEventListener('change', (e) => {
            if (e.target.matches('#productColorSelect')) {
                this.updateColor(e.target.value);
            }
            if (e.target.matches('#logoPositionSelect')) {
                this.updateLogoPosition(e.target.value);
            }
            if (e.target.matches('#logoSizeSelect')) {
                this.updateLogoSize(e.target.value);
            }
            if (e.target.matches('#printMethodSelect')) {
                this.updatePrintMethod(e.target.value);
            }
            if (e.target.matches('#personalizationQuantity')) {
                this.updateQuantity(e.target.value);
            }
            if (e.target.matches('#logoFileInput')) {
                this.handleLogoUpload(e.target.files[0]);
            }
        });

        // Eventos para texto del logo
        document.addEventListener('input', (e) => {
            if (e.target.matches('#logoTextInput')) {
                this.updateLogoText(e.target.value);
            }
            if (e.target.matches('#additionalNotesInput')) {
                this.updateAdditionalNotes(e.target.value);
            }
        });

        // Eventos para botones de colores
        document.addEventListener('click', (e) => {
            if (e.target.matches('.color-option')) {
                const color = e.target.dataset.color;
                this.selectColor(color);
            }
            if (e.target.matches('.position-option')) {
                const position = e.target.dataset.position;
                this.selectLogoPosition(position);
            }
        });
    }

    // Abrir modal de personalización para un producto específico
    openPersonalizationModal(productId) {
        const product = mockProducts.find(p => p.id === productId);
        if (!product) return;

        this.currentProduct = product;
        this.resetSelectedOptions();
        this.renderPersonalizationModal();

        const modal = document.getElementById('personalizationModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Cerrar modal de personalización
    closePersonalizationModal() {
        const modal = document.getElementById('personalizationModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        this.currentProduct = null;
        this.resetSelectedOptions();
    }

    // Resetear opciones seleccionadas
    resetSelectedOptions() {
        this.selectedOptions = {
            color: '',
            logoPosition: '',
            logoSize: '',
            printMethod: '',
            quantity: this.currentProduct ? this.currentProduct.minOrder : 1,
            logoFile: null,
            logoText: '',
            additionalNotes: ''
        };
    }

    // Renderizar modal completo de personalización
    renderPersonalizationModal() {
        if (!this.currentProduct) return;

        let modal = document.getElementById('personalizationModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'personalizationModal';
            modal.className = 'modal personalization-modal';
            document.body.appendChild(modal);
        }

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const isDark = currentTheme === 'dark';

        modal.innerHTML = `
            <div class="modal-content personalization-content">
                ${this.renderPersonalizationHeader(isDark)}
                <div class="personalization-body">
                    <div class="personalization-layout">
                        <div class="product-preview">
                            ${this.renderProductPreview(isDark)}
                        </div>
                        <div class="customization-options">
                            ${this.renderCustomizationOptions(isDark)}
                        </div>
                    </div>
                </div>
                ${this.renderPersonalizationFooter(isDark)}
            </div>
        `;
    }

    // Renderizar header del modal
    renderPersonalizationHeader(isDark) {
        return `
            <div class="personalization-header" style="background: ${isDark ? '#1f2937' : '#ffffff'}; border-bottom: 1px solid ${isDark ? '#374151' : '#e5e7eb'};">
                <div class="header-content">
                    <div class="product-info">
                        <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}" class="product-thumb">
                        <div>
                            <h2 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">${this.currentProduct.name}</h2>
                            <p style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Personaliza tu producto</p>
                        </div>
                    </div>
                    <button id="personalizationClose" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Renderizar preview del producto
    renderProductPreview(isDark) {
        const selectedColor = this.selectedOptions.color || this.currentProduct.availableColors[0];
        
        return `
            <div class="preview-container" style="background: ${isDark ? '#374151' : '#f9fafb'};">
                <div class="preview-header" style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                    <i class="fas fa-eye"></i>
                    <span>Vista Previa</span>
                </div>
                
                <div class="product-preview-image">
                    <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}" id="previewImage">
                    ${this.renderLogoPreview()}
                    <div class="color-indicator" style="background: ${this.getColorHex(selectedColor)};">
                        <span style="color: ${isDark ? '#f9fafb' : '#1f2937'};">${selectedColor || 'Color base'}</span>
                    </div>
                </div>
                
                <div class="preview-details" style="color: ${isDark ? '#d1d5db' : '#6b7280'};">
                    <div class="detail-item">
                        <i class="fas fa-palette"></i>
                        <span>Color: ${selectedColor || 'No seleccionado'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Posición logo: ${this.selectedOptions.logoPosition || 'No seleccionada'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-expand-arrows-alt"></i>
                        <span>Tamaño logo: ${this.selectedOptions.logoSize || 'No seleccionado'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar opciones de personalización
    renderCustomizationOptions(isDark) {
        return `
            <div class="customization-container" style="background: ${isDark ? '#374151' : '#ffffff'};">
                
                <!-- Selección de Color -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-palette"></i>
                        Color del Producto
                    </h3>
                    <div class="color-grid">
                        ${this.currentProduct.availableColors.map(color => `
                            <div class="color-option ${this.selectedOptions.color === color ? 'selected' : ''}"
                                 data-color="${color}"
                                 style="background: ${this.getColorHex(color)};"
                                 title="${color}">
                                <span class="color-name">${color}</span>
                                ${this.selectedOptions.color === color ? '<i class="fas fa-check"></i>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Posición del Logo -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-crosshairs"></i>
                        Posición del Logo
                    </h3>
                    <div class="position-grid">
                        ${mockPersonalizationOptions.logoPositions.map(position => `
                            <div class="position-option ${this.selectedOptions.logoPosition === position.name ? 'selected' : ''}"
                                 data-position="${position.name}"
                                 style="background: ${isDark ? '#1f2937' : '#f3f4f6'}; border: 2px solid ${this.selectedOptions.logoPosition === position.name ? '#0ea5e9' : (isDark ? '#4b5563' : '#e5e7eb')};">
                                <div class="position-visual">
                                    ${this.getPositionIcon(position.name)}
                                </div>
                                <span style="color: ${isDark ? '#f9fafb' : '#374151'};">${position.name}</span>
                                <small style="color: ${isDark ? '#d1d5db' : '#6b7280'};">${position.description}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Tamaño del Logo -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-expand-arrows-alt"></i>
                        Tamaño del Logo
                    </h3>
                    <div class="size-options">
                        ${mockPersonalizationOptions.logoSizes.map(size => `
                            <label class="size-option ${this.selectedOptions.logoSize === size.name ? 'selected' : ''}"
                                   style="background: ${isDark ? '#1f2937' : '#f9fafb'}; border: 2px solid ${this.selectedOptions.logoSize === size.name ? '#0ea5e9' : (isDark ? '#4b5563' : '#e5e7eb')};">
                                <input type="radio" name="logoSize" value="${size.name}" 
                                       ${this.selectedOptions.logoSize === size.name ? 'checked' : ''}
                                       onchange="personalization.updateLogoSize('${size.name}')">
                                <div class="size-visual" style="width: ${this.getSizeWidth(size.name)}; height: ${this.getSizeWidth(size.name)};">
                                    <i class="fas fa-image"></i>
                                </div>
                                <div>
                                    <span style="color: ${isDark ? '#f9fafb' : '#374151'}; font-weight: 600;">${size.name}</span>
                                    <small style="color: ${isDark ? '#d1d5db' : '#6b7280'}; display: block;">${size.size}</small>
                                    <small style="color: #0ea5e9; display: block;">+$${size.price.toLocaleString('es-CL')} CLP</small>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Método de Impresión -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-print"></i>
                        Método de Impresión
                    </h3>
                    <select id="printMethodSelect" style="background: ${isDark ? '#1f2937' : '#ffffff'}; color: ${isDark ? '#f9fafb' : '#374151'}; border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};">
                        <option value="">Seleccionar método</option>
                        ${mockPersonalizationOptions.printingMethods.map(method => `
                            <option value="${method.name}" ${this.selectedOptions.printMethod === method.name ? 'selected' : ''}>
                                ${method.name} - ${method.description} (Mín: ${method.minOrder} unidades)
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Logo/Diseño -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-image"></i>
                        Tu Logo/Diseño
                    </h3>
                    <div class="logo-input-section">
                        <div class="input-tabs">
                            <button class="tab-btn active" onclick="personalization.switchLogoTab('file')">
                                <i class="fas fa-upload"></i>
                                Subir Archivo
                            </button>
                            <button class="tab-btn" onclick="personalization.switchLogoTab('text')">
                                <i class="fas fa-font"></i>
                                Solo Texto
                            </button>
                        </div>
                        
                        <div id="logoFileTab" class="logo-tab active">
                            <div class="file-upload-area" style="border: 2px dashed ${isDark ? '#4b5563' : '#d1d5db'}; background: ${isDark ? '#1f2937' : '#f9fafb'};">
                                <input type="file" id="logoFileInput" accept=".jpg,.jpeg,.png,.svg,.pdf" style="display: none;">
                                <div onclick="document.getElementById('logoFileInput').click();" style="cursor: pointer; padding: 2rem; text-align: center;">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: ${isDark ? '#6b7280' : '#9ca3af'}; margin-bottom: 1rem;"></i>
                                    <p style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Haz clic para subir tu logo</p>
                                    <small style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Formatos: JPG, PNG, SVG, PDF (Máx: 5MB)</small>
                                </div>
                                <div id="uploadedFile" style="display: none; padding: 1rem; background: ${isDark ? '#374151' : '#e5e7eb'}; margin-top: 1rem; border-radius: 0.5rem;">
                                    <i class="fas fa-file"></i>
                                    <span id="fileName"></span>
                                    <button onclick="personalization.removeLogoFile()" style="color: #dc2626; border: none; background: none; float: right;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="logoTextTab" class="logo-tab" style="display: none;">
                            <textarea id="logoTextInput" 
                                      placeholder="Ingresa el texto para tu logo (nombre de empresa, eslogan, etc.)"
                                      style="width: 100%; height: 100px; padding: 1rem; border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; border-radius: 0.5rem; background: ${isDark ? '#1f2937' : '#ffffff'}; color: ${isDark ? '#f9fafb' : '#374151'}; resize: vertical;"
                                      maxlength="100"></textarea>
                            <small style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Máximo 100 caracteres</small>
                        </div>
                    </div>
                </div>

                <!-- Cantidad -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-calculator"></i>
                        Cantidad
                    </h3>
                    <div class="quantity-section">
                        <div class="quantity-input-group">
                            <button type="button" onclick="personalization.changeQuantity(-1)" class="quantity-btn">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" 
                                   id="personalizationQuantity" 
                                   value="${this.selectedOptions.quantity}" 
                                   min="${this.currentProduct.minOrder}"
                                   style="background: ${isDark ? '#1f2937' : '#ffffff'}; color: ${isDark ? '#f9fafb' : '#374151'}; border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};">
                            <button type="button" onclick="personalization.changeQuantity(1)" class="quantity-btn">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="quantity-info" style="color: ${isDark ? '#d1d5db' : '#6b7280'};">
                            <small>Pedido mínimo: ${this.currentProduct.minOrder} unidades</small>
                            ${this.selectedOptions.quantity < this.currentProduct.minOrder ? 
                                `<div style="color: #dc2626; font-weight: 500; margin-top: 0.5rem;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    No cumple el pedido mínimo
                                </div>` : 
                                `<div style="color: #16a34a; font-weight: 500; margin-top: 0.5rem;">
                                    <i class="fas fa-check-circle"></i>
                                    Cumple el pedido mínimo
                                </div>`
                            }
                        </div>
                    </div>
                </div>

                <!-- Notas Adicionales -->
                <div class="option-section">
                    <h3 style="color: ${isDark ? '#f9fafb' : '#1f2937'};">
                        <i class="fas fa-sticky-note"></i>
                        Notas Adicionales
                    </h3>
                    <textarea id="additionalNotesInput" 
                              placeholder="Instrucciones especiales, referencias de color, detalles específicos..."
                              style="width: 100%; height: 80px; padding: 1rem; border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; border-radius: 0.5rem; background: ${isDark ? '#1f2937' : '#ffffff'}; color: ${isDark ? '#f9fafb' : '#374151'}; resize: vertical;"
                              maxlength="500"></textarea>
                    <small style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Máximo 500 caracteres</small>
                </div>
            </div>
        `;
    }

    // Renderizar footer con resumen y botones
    renderPersonalizationFooter(isDark) {
        const basePrice = parseFloat(this.currentProduct.basePrice) || 0;
        const logoSizePrice = this.getLogoSizePrice();
        const unitPrice = basePrice + logoSizePrice;
        const totalPrice = unitPrice * this.selectedOptions.quantity;
        const isValidOrder = this.selectedOptions.quantity >= this.currentProduct.minOrder;

        return `
            <div class="personalization-footer" style="background: ${isDark ? '#1f2937' : '#f9fafb'}; border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};">
                <div class="price-summary">
                    <div class="price-breakdown">
                        <div class="price-row">
                            <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Precio base:</span>
                            <span style="color: ${isDark ? '#f9fafb' : '#374151'};">$${basePrice.toLocaleString('es-CL')} CLP</span>
                        </div>
                        ${logoSizePrice > 0 ? `
                            <div class="price-row">
                                <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Personalización:</span>
                                <span style="color: ${isDark ? '#f9fafb' : '#374151'};">+$${logoSizePrice.toLocaleString('es-CL')} CLP</span>
                            </div>
                        ` : ''}
                        <div class="price-row">
                            <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Precio unitario:</span>
                            <span style="color: ${isDark ? '#38bdf8' : '#0ea5e9'}; font-weight: 600;">$${unitPrice.toLocaleString('es-CL')} CLP</span>
                        </div>
                        <div class="price-row">
                            <span style="color: ${isDark ? '#d1d5db' : '#6b7280'};">Cantidad:</span>
                            <span style="color: ${isDark ? '#f9fafb' : '#374151'};">${this.selectedOptions.quantity} unidades</span>
                        </div>
                        <div class="price-row total-row">
                            <span style="color: ${isDark ? '#f9fafb' : '#1f2937'}; font-size: 1.125rem; font-weight: 600;">Total:</span>
                            <span style="color: ${isDark ? '#38bdf8' : '#0ea5e9'}; font-size: 1.5rem; font-weight: 700;">$${totalPrice.toLocaleString('es-CL')} CLP</span>
                        </div>
                    </div>
                </div>
                
                <div class="footer-actions">
                    <button onclick="personalization.savePersonalization()" 
                            class="btn-outline" style="flex: 1;">
                        <i class="fas fa-save"></i>
                        Guardar Configuración
                    </button>
                    <button onclick="personalization.addToCartWithPersonalization()" 
                            class="btn-primary ${!isValidOrder ? 'disabled' : ''}" 
                            style="flex: 2;"
                            ${!isValidOrder ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        Agregar al Carrito
                    </button>
                </div>
                
                ${!isValidOrder ? `
                    <div class="validation-warning" style="background: ${isDark ? '#7f1d1d' : '#fef2f2'}; color: ${isDark ? '#fca5a5' : '#dc2626'}; border: 1px solid ${isDark ? '#dc2626' : '#fecaca'};">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>La cantidad debe ser mínimo ${this.currentProduct.minOrder} unidades</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Métodos de actualización de opciones
    updateColor(color) {
        this.selectedOptions.color = color;
        this.refreshPreview();
    }

    selectColor(color) {
        this.selectedOptions.color = color;
        this.updatePersonalizationModal();
    }

    updateLogoPosition(position) {
        this.selectedOptions.logoPosition = position;
        this.refreshPreview();
    }

    selectLogoPosition(position) {
        this.selectedOptions.logoPosition = position;
        this.updatePersonalizationModal();
    }

    updateLogoSize(size) {
        this.selectedOptions.logoSize = size;
        this.refreshPreview();
        this.updatePriceSummary();
    }

    updatePrintMethod(method) {
        this.selectedOptions.printMethod = method;
    }

    updateQuantity(quantity) {
        this.selectedOptions.quantity = Math.max(1, parseInt(quantity) || 1);
        this.updatePriceSummary();
    }

    changeQuantity(change) {
        const newQuantity = this.selectedOptions.quantity + change;
        if (newQuantity >= 1) {
            this.updateQuantity(newQuantity);
            document.getElementById('personalizationQuantity').value = newQuantity;
        }
    }

    updateLogoText(text) {
        this.selectedOptions.logoText = text;
        this.refreshPreview();
    }

    updateAdditionalNotes(notes) {
        this.selectedOptions.additionalNotes = notes;
    }

    // Manejo de archivos de logo
    handleLogoUpload(file) {
        if (!file) return;

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB permitido.');
            return;
        }

        // Validar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Tipo de archivo no permitido. Use JPG, PNG, SVG o PDF.');
            return;
        }

        this.selectedOptions.logoFile = file;
        
        // Mostrar archivo subido
        const uploadedFileDiv = document.getElementById('uploadedFile');
        const fileNameSpan = document.getElementById('fileName');
        if (uploadedFileDiv && fileNameSpan) {
            fileNameSpan.textContent = file.name;
            uploadedFileDiv.style.display = 'block';
        }

        this.refreshPreview();
    }

    removeLogoFile() {
        this.selectedOptions.logoFile = null;
        const uploadedFileDiv = document.getElementById('uploadedFile');
        const fileInput = document.getElementById('logoFileInput');
        
        if (uploadedFileDiv) uploadedFileDiv.style.display = 'none';
        if (fileInput) fileInput.value = '';
        
        this.refreshPreview();
    }

    switchLogoTab(tab) {
        // Actualizar tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.logo-tab').forEach(tab => tab.style.display = 'none');
        
        event.target.classList.add('active');
        document.getElementById(`logo${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).style.display = 'block';
    }

    // Métodos auxiliares
    getColorHex(colorName) {
        const colorMap = {
            'Blanco': '#ffffff',
            'Negro': '#000000',
            'Azul': '#3b82f6',
            'Rojo': '#ef4444',
            'Verde': '#22c55e',
            'Amarillo': '#eab308',
            'Gris': '#6b7280',
            'Rosa': '#ec4899',
            'Plateado': '#d1d5db',
            'Dorado': '#f59e0b',
            'Azul marino': '#1e3a8a',
            'Negro mate': '#1f2937',
            'Azul cobalto': '#1e40af',
            'Verde oliva': '#65a30d',
            'Terracota': '#dc2626',
            'Crema': '#fef3c7'
        };
        return colorMap[colorName] || '#6b7280';
    }

    getPositionIcon(position) {
        const iconMap = {
            'Centrado': '<i class="fas fa-dot-circle"></i>',
            'Esquina superior izquierda': '<i class="fas fa-arrow-up"></i><i class="fas fa-arrow-left"></i>',
            'Esquina superior derecha': '<i class="fas fa-arrow-up"></i><i class="fas fa-arrow-right"></i>',
            'Parte inferior': '<i class="fas fa-arrow-down"></i>',
            'Lateral': '<i class="fas fa-arrows-alt-h"></i>',
            'Espalda/Reverso': '<i class="fas fa-undo"></i>'
        };
        return iconMap[position] || '<i class="fas fa-crosshairs"></i>';
    }

    getSizeWidth(sizeName) {
        const sizeMap = {
            'Pequeño': '30px',
            'Mediano': '45px', 
            'Grande': '60px',
            'Extra Grande': '75px'
        };
        return sizeMap[sizeName] || '45px';
    }

    getLogoSizePrice() {
        if (!this.selectedOptions.logoSize) return 0;
        const sizeOption = mockPersonalizationOptions.logoSizes.find(s => s.name === this.selectedOptions.logoSize);
        return sizeOption ? parseFloat(sizeOption.price) : 0;
    }

    renderLogoPreview() {
        if (this.selectedOptions.logoText) {
            return `<div class="logo-preview text-logo">${this.selectedOptions.logoText}</div>`;
        }
        if (this.selectedOptions.logoFile) {
            return `<div class="logo-preview file-logo"><i class="fas fa-image"></i> Logo</div>`;
        }
        return '';
    }

    // Actualizar elementos específicos sin re-renderizar todo
    refreshPreview() {
        // Actualizar preview visual si existe
        this.updatePersonalizationModal();
    }

    updatePersonalizationModal() {
        if (document.getElementById('personalizationModal')?.classList.contains('active')) {
            this.renderPersonalizationModal();
        }
    }

    updatePriceSummary() {
        // Actualizar resumen de precios en el footer
        const footer = document.querySelector('.personalization-footer');
        if (footer && this.currentProduct) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            footer.innerHTML = this.renderPersonalizationFooter(isDark);
        }
    }

    // Guardar configuración de personalización
    savePersonalization() {
        const config = {
            productId: this.currentProduct.id,
            productName: this.currentProduct.name,
            selectedOptions: { ...this.selectedOptions },
            savedAt: new Date().toISOString()
        };
        
        // Guardar en localStorage
        const savedConfigs = JSON.parse(localStorage.getItem('impreIdeas-personalizations') || '[]');
        savedConfigs.push(config);
        localStorage.setItem('impreIdeas-personalizations', JSON.stringify(savedConfigs));
        
        alert('Configuración guardada exitosamente. Podrás acceder a ella más tarde desde tu cuenta.');
    }

    // Agregar al carrito con personalización completa
    addToCartWithPersonalization() {
        if (!this.validatePersonalization()) return;
        
        if (typeof cart === 'undefined') {
            console.error('El carrito no está disponible');
            return;
        }

        // Crear objeto de personalización para el carrito
        const personalization = {
            color: this.selectedOptions.color,
            logoPosition: this.selectedOptions.logoPosition,
            logoSize: this.selectedOptions.logoSize,
            printMethod: this.selectedOptions.printMethod,
            logoFile: this.selectedOptions.logoFile ? this.selectedOptions.logoFile.name : null,
            logoText: this.selectedOptions.logoText,
            additionalNotes: this.selectedOptions.additionalNotes
        };

        // Agregar al carrito
        const success = cart.addItem(
            this.currentProduct.id, 
            this.selectedOptions.quantity, 
            personalization
        );

        if (success) {
            this.closePersonalizationModal();
            
            // Mostrar confirmación
            setTimeout(() => {
                alert(`¡Producto personalizado agregado al carrito!\n\nProducto: ${this.currentProduct.name}\nCantidad: ${this.selectedOptions.quantity} unidades\nPersonalización aplicada correctamente.`);
            }, 500);
        }
    }

    // Validar que la personalización esté completa
    validatePersonalization() {
        if (this.selectedOptions.quantity < this.currentProduct.minOrder) {
            alert(`La cantidad debe ser mínimo ${this.currentProduct.minOrder} unidades.`);
            return false;
        }

        if (!this.selectedOptions.color) {
            alert('Por favor selecciona un color para el producto.');
            return false;
        }

        return true;
    }
}

// Crear instancia global del sistema de personalización
const personalization = new PersonalizationSystem();