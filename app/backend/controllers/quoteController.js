const { Quote, QuoteItem, Product, Category, User, Cart, CartItem } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador de cotizaciones para ImpreIdeas
 * Maneja creación, consulta y gestión de cotizaciones B2B
 */
class QuoteController {
    /**
     * Crear nueva cotización desde carrito o datos directos
     * POST /api/quotes
     */
    async createQuote(req, res) {
        console.log('🚀 [createQuote] INICIANDO VERSIÓN CORREGIDA...');
        console.log (req.body);
        try {
            const {
                companyName,
                contactName,
                email,
                phone,
                rut,
                address,
                city,
                additionalComments,
                items
            } = req.body;

            const user = req.user;

            console.log('📥 [createQuote] Datos recibidos:', { 
                companyName, 
                contactName, 
                email, 
                itemsCount: items ? items.length : 0 
            });

            // Validar que hay items
            if (!items || !Array.isArray(items) || items.length === 0) {
                console.log('❌ [createQuote] Error: Items vacíos o no es un array');
                return res.status(400).json({
                    success: false,
                    error: 'Items requeridos',
                    message: 'Debe incluir al menos un producto en la cotización'
                });
            }

            console.log('🔍 [createQuote] Items recibidos:', JSON.stringify(items, null, 2));

            // Para cotizaciones anónimas, validar campos requeridos
            if (!user) {
                const requiredFields = ['companyName', 'contactName', 'email', 'phone'];
                const missingFields = requiredFields.filter(field => !req.body[field]);
                
                if (missingFields.length > 0) {
                    const fieldNames = {
                        companyName: 'nombre de la empresa',
                        contactName: 'nombre de contacto',
                        email: 'email',
                        phone: 'teléfono'
                    };
                    
                    return res.status(400).json({
                        success: false,
                        error: 'Campos requeridos',
                        message: `Para cotizaciones anónimas son requeridos: ${missingFields.map(field => fieldNames[field]).join(', ')}`
                    });
                }
            }

            // ✅ VERSIÓN CORREGIDA: Procesar items
            const processedItems = [];
            let subtotal = 0;
            let production = 0;

            console.log('🔄 [createQuote] Procesando items...');

            for (const item of items) {
                console.log(`📦 [createQuote] Procesando item ID: ${item.productId}`);
                
                // Buscar el producto
                const product = await Product.findByPk(item.productId);
                
                if (!product) {
                    console.log(`❌ [createQuote] Producto no encontrado ID: ${item.productId}`);
                    return res.status(400).json({
                        success: false,
                        error: 'Producto no encontrado',
                        message: `El producto con ID ${item.productId} no existe`
                    });
                }

                // Validar si está activo
                if (product.isActive === false) {
                    console.log(`❌ [createQuote] Producto inactivo: ${product.name}`);
                    return res.status(400).json({
                        success: false,
                        error: 'Producto inactivo',
                        message: `El producto "${product.name}" no está disponible`
                    });
                }

                console.log(`✅ [createQuote] Producto encontrado:`, {
                    id: product.id,
                    name: product.name,
                    hasName: !!product.name,
                    nameType: typeof product.name
                });

                // Validar cantidad mínima
                const minOrder = product.minOrder || 1;
                const quantity = parseInt(item.quantity) || 1;
                
                if (quantity < minOrder) {
                    console.log(`❌ [createQuote] Cantidad insuficiente para producto ${product.name}`);
                    return res.status(400).json({
                        success: false,
                        error: 'Cantidad insuficiente',
                        message: `El producto "${product.name}" requiere un mínimo de ${minOrder} unidades`,
                        productName: product.name,
                        minimumRequired: minOrder,
                        provided: quantity
                    });
                }

                // Calcular precios
                const unitPrice = parseFloat(product.basePrice) || parseFloat(product.price) || 0;
                const totalPrice = unitPrice * quantity;

                // Calcular costo de producción
                const productionCost = parseFloat(product.cost) || 0;

                subtotal += totalPrice;
                production += productionCost * quantity;

                // ✅ CORRECCIÓN CLAVE: Asegurar que productName nunca sea null
                const processedItem = {
                    productId: product.id,
                    productName: product.name || `Producto ${product.id}`, 
                    quantity: quantity,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice,
                    productionCost: productionCost,
                    personalization: item.personalization || {}
                };

                processedItems.push(processedItem);

                console.log(`📊 [createQuote] Item procesado:`, processedItem);
            }

            console.log('💰 [createQuote] Totales calculados:', { subtotal, production });
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", processedItems);
            // Calcular impuestos (IVA 19% en Chile)
            const taxRate = 0.19;
            const taxAmount = subtotal * taxRate;
            const totalAmount = subtotal + taxAmount;

            // Generar número de cotización
            const quoteNumber = `COT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            console.log('📝 [createQuote] Creando cotización en BD...');

            // Crear cotización con TODOS los campos requeridos
            const quoteData = {
                userId: user?.id || null,
                quoteNumber,
                status: 'pending',
                companyName: companyName || user?.companyName || null,
                contactName: contactName || user?.contactName || null,
                email: email || user?.email || null,
                phone: phone || user?.phone || null,
                rut: rut || user?.rut || null,
                address: address || user?.address || null,
                city: city || user?.city || null,
                additionalComments: additionalComments || null,
                subtotal: subtotal,
                taxAmount: taxAmount,
                totalAmount: totalAmount,
                production: production, 
                expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
            };

            console.log('📋 [createQuote] Datos para crear quote:', quoteData);

            // Crear la cotización
            const quote = await Quote.create(quoteData);
            console.log('✅ [createQuote] Cotización creada en BD. ID:', quote.id);

            // ✅ VERSIÓN CORREGIDA: Crear items INDIVIDUALMENTE
            console.log('📦 [createQuote] Creando items individualmente...');

            try {
                for (const item of processedItems) {
                    console.log(`🔍 [createQuote] Creando item para: ${item.productName}`);
                    
                    const quoteItemData = {
                        quoteId: quote.id,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        subtotal: item.totalPrice,
                        personalization: item.personalization || null
                    };

                    console.log('📋 [createQuote] Datos del item:', quoteItemData);
                    
                    await QuoteItem.create(quoteItemData);
                    console.log(`✅ [createQuote] Item creado: ${item.productName}`);
                }
                console.log(`🎉 [createQuote] ${processedItems.length} items creados exitosamente`);
                
            } catch (itemError) {
                console.error('💥 [createQuote] ERROR creando item:');
                console.error('💥 [createQuote] Mensaje:', itemError.message);
                
                if (itemError.errors) {
                    itemError.errors.forEach(err => {
                        console.error(`💥 [createQuote] Error en campo ${err.path}:`, err.message, 'Valor:', err.value);
                    });
                }
                
                throw new Error(`No se pudo crear los items: ${itemError.message}`);
            }

            // Si el usuario está autenticado, limpiar su carrito
            if (user) {
                console.log('🛒 [createQuote] Limpiando carrito del usuario...');
                const cart = await Cart.findOne({
                    where: { userId: user.id, isActive: true }
                });
                if (cart) {
                    await CartItem.destroy({ where: { cartId: cart.id } });
                    console.log('✅ [createQuote] Carrito limpiado');
                }
            }

            console.log('🎯 [createQuote] Enviando respuesta exitosa...');

            // ✅ RESPONDER EXITOSAMENTE
            return res.status(201).json({
                success: true,
                message: 'Cotización creada exitosamente',
                quote: {
                    id: quote.id,
                    quoteNumber: quote.quoteNumber,
                    status: quote.status,
                    companyName: quote.companyName,
                    contactName: quote.contactName,
                    email: quote.email,
                    phone: quote.phone,
                    subtotal: quote.subtotal,
                    taxAmount: quote.taxAmount,
                    totalAmount: quote.totalAmount,
                    production: quote.production,
                    expiresAt: quote.expiresAt,
                    createdAt: quote.createdAt
                },
                summary: {
                    quoteNumber: quote.quoteNumber,
                    totalItems: processedItems.length,
                    totalQuantity: processedItems.reduce((sum, item) => sum + item.quantity, 0),
                    subtotal: `$${subtotal.toFixed(2)}`,
                    taxAmount: `$${taxAmount.toFixed(2)}`,
                    totalAmount: `$${totalAmount.toFixed(2)}`,
                    expiresAt: quote.expiresAt
                }
            });

        } catch (error) {
            console.error('❌ [createQuote] Error al crear cotización:', error);
            console.error('❌ [createQuote] Error stack:', error.stack);
            
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo crear la cotización',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obtener cotizaciones del usuario autenticado
     * GET /api/quotes
     */
    async getUserQuotes(req, res) {
        try {
            const user = req.user;
            const { status, page = 1, limit = 20 } = req.query;

            // Construir condiciones WHERE
            const whereConditions = { userId: user.id };
            if (status) {
                whereConditions.status = status;
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: quotes } = await Quote.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'image', 'CategoryId'],
                                include: [
                                    {
                                        model: Category,
                                        as: 'Category',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                success: true,
                message: 'Cotizaciones obtenidas exitosamente',
                quotes: quotes.map(quote => ({
                    ...quote.toJSON(),
                    summary: quote.getSummary ? quote.getSummary() : {},
                    isExpired: quote.isExpired ? quote.isExpired() : false
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('❌ Error al obtener cotizaciones del usuario:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las cotizaciones'
            });
        }
    }

    /**
     * Obtener cotización específica por ID
     * GET /api/quotes/:id
     */
    async getQuoteById(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            // Construir condiciones de búsqueda
            const whereConditions = { id };
            
            // Si hay usuario autenticado, filtrar por sus cotizaciones
            if (user) {
                whereConditions.userId = user.id;
            }

            const quote = await Quote.findOne({
                where: whereConditions,
                include: [
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                include: [
                                    {
                                        model: Category,
                                        as: 'Category'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'companyName', 'contactName', 'email'],
                        required: false
                    }
                ]
            });

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    error: 'Cotización no encontrada',
                    message: 'No se encontró una cotización con ese ID'
                });
            }

            res.json({
                success: true,
                message: 'Cotización obtenida exitosamente',
                quote: {
                    ...quote.toJSON(),
                    summary: quote.getSummary ? quote.getSummary() : {},
                    isExpired: quote.isExpired ? quote.isExpired() : false,
                    itemDetails: quote.items.map(item => ({
                        ...item.toJSON(),
                        getDetailedInfo: item.getDetailedInfo ? item.getDetailedInfo() : {},
                        getFormattedUnitPrice: item.getFormattedUnitPrice ? item.getFormattedUnitPrice() : `$${item.unitPrice}`,
                        getFormattedTotalPrice: item.getFormattedTotalPrice ? item.getFormattedTotalPrice() : `$${item.totalPrice}`,
                        getPersonalizationSummary: item.getPersonalizationSummary ? item.getPersonalizationSummary() : {}
                    }))
                }
            });

        } catch (error) {
            console.error('❌ Error al obtener cotización:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo obtener la cotización'
            });
        }
    }

    /**
     * Obtener cotización por número de cotización (público)
     * GET /api/quotes/by-number/:quoteNumber
     */
    async getQuoteByNumber(req, res) {
        try {
            const { quoteNumber } = req.params;

            const quote = await Quote.findOne({
                where: { quoteNumber },
                include: [
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                include: [
                                    {
                                        model: Category,
                                        as: 'Category'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    error: 'Cotización no encontrada',
                    message: `No se encontró una cotización con el número ${quoteNumber}`
                });
            }

            // Información pública limitada
            const publicQuote = {
                id: quote.id,
                quoteNumber: quote.quoteNumber,
                status: quote.status,
                companyName: quote.companyName,
                contactName: quote.contactName,
                createdAt: quote.createdAt,
                expiresAt: quote.expiresAt,
                isExpired: quote.isExpired ? quote.isExpired() : false,
                summary: quote.getSummary ? quote.getSummary() : {},
                items: quote.items.map(item => ({
                    id: item.id,
                    productName: item.product?.name || 'Producto no disponible',
                    Category: item.product?.Category?.name || 'Sin categoría',
                    quantity: item.quantity,
                    formattedUnitPrice: item.getFormattedUnitPrice ? item.getFormattedUnitPrice() : `$${item.unitPrice}`,
                    formattedTotalPrice: item.getFormattedTotalPrice ? item.getFormattedTotalPrice() : `$${item.totalPrice}`,
                    personalizationSummary: item.getPersonalizationSummary ? item.getPersonalizationSummary() : {}
                }))
            };

            res.json({
                success: true,
                message: 'Cotización obtenida exitosamente',
                quote: publicQuote
            });

        } catch (error) {
            console.error('❌ Error al obtener cotización por número:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo obtener la cotización'
            });
        }
    }

    /**
     * Actualizar estado de cotización (solo para administradores)
     * PUT /api/quotes/:id/status
     */
    async updateQuoteStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, comments } = req.body;
            const user = req.user;

            // Verificar que es el dueño de la cotización
            const quote = await Quote.findOne({
                where: { id, userId: user.id }
            });

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    error: 'Cotización no encontrada',
                    message: 'No se encontró una cotización con ese ID'
                });
            }

            // Actualizar estado
            if (quote.updateStatus) {
                await quote.updateStatus(status, comments);
            } else {
                // Fallback si el método no existe
                await quote.update({ 
                    status: status,
                    adminComments: comments 
                });
            }

            res.json({
                success: true,
                message: 'Estado de cotización actualizado exitosamente',
                quote: {
                    id: quote.id,
                    quoteNumber: quote.quoteNumber,
                    status: quote.status,
                    updatedAt: quote.updatedAt
                }
            });

        } catch (error) {
            console.error('❌ Error al actualizar estado de cotización:', error);
            
            if (error.message.includes('Estado de cotización no válido')) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado inválido',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo actualizar el estado de la cotización'
            });
        }
    }

    /**
     * Extender fecha de expiración de cotización
     * PUT /api/quotes/:id/extend
     */
    async extendQuoteExpiration(req, res) {
        try {
            const { id } = req.params;
            const { days = 30 } = req.body;
            const user = req.user;

            const quote = await Quote.findOne({
                where: { id, userId: user.id }
            });

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    error: 'Cotización no encontrada',
                    message: 'No se encontró una cotización con ese ID'
                });
            }

            if (quote.status === 'closed' || quote.status === 'rejected') {
                return res.status(400).json({
                    success: false,
                    error: 'Cotización cerrada',
                    message: 'No se puede extender una cotización cerrada o rechazada'
                });
            }

            if (quote.extendExpiration) {
                await quote.extendExpiration(parseInt(days));
            } else {
                // Fallback si el método no existe
                const newExpiresAt = new Date(quote.expiresAt);
                newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(days));
                await quote.update({ expiresAt: newExpiresAt });
            }

            res.json({
                success: true,
                message: 'Fecha de expiración extendida exitosamente',
                quote: {
                    id: quote.id,
                    quoteNumber: quote.quoteNumber,
                    expiresAt: quote.expiresAt,
                    daysExtended: parseInt(days)
                }
            });

        } catch (error) {
            console.error('❌ Error al extender cotización:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo extender la fecha de expiración'
            });
        }
    }

    /**
     * Obtener estadísticas de cotizaciones del usuario
     * GET /api/quotes/stats
     */
    async getQuoteStats(req, res) {
        try {
            const user = req.user;
            const userId = user.id;

            // Obtener estadísticas básicas
            const [totalQuotes, pendingQuotes, acceptedQuotes, totalValue] = await Promise.all([
                Quote.count({ where: { userId } }),
                Quote.count({ where: { userId, status: 'pending' } }),
                Quote.count({ where: { userId, status: 'accepted' } }),
                Quote.sum('totalAmount', { where: { userId } })
            ]);

            // Obtener cotizaciones recientes
            const recentQuotes = await Quote.findAll({
                where: { userId },
                attributes: ['id', 'quoteNumber', 'status', 'totalAmount', 'createdAt'],
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            // Estadísticas por estado
            const statusStats = await Quote.findAll({
                where: { userId },
                attributes: [
                    'status',
                    [Quote.sequelize.fn('COUNT', Quote.sequelize.col('id')), 'count'],
                    [Quote.sequelize.fn('SUM', Quote.sequelize.col('totalAmount')), 'totalValue']
                ],
                group: ['status'],
                raw: true
            });

            const stats = {
                totalQuotes,
                pendingQuotes,
                acceptedQuotes,
                totalValue: parseFloat(totalValue) || 0,
                formattedTotalValue: `$${(parseFloat(totalValue) || 0).toLocaleString('es-CL')} CLP`,
                conversionRate: totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0,
                recentQuotes: recentQuotes.map(quote => ({
                    ...quote.toJSON(),
                    formattedAmount: `$${parseFloat(quote.totalAmount).toLocaleString('es-CL')} CLP`
                })),
                statusBreakdown: statusStats.reduce((acc, stat) => {
                    acc[stat.status] = {
                        count: parseInt(stat.count),
                        totalValue: parseFloat(stat.totalValue) || 0,
                        formattedValue: `$${(parseFloat(stat.totalValue) || 0).toLocaleString('es-CL')} CLP`
                    };
                    return acc;
                }, {})
            };

            res.json({
                success: true,
                message: 'Estadísticas de cotizaciones obtenidas exitosamente',
                stats
            });

        } catch (error) {
            console.error('❌ Error al obtener estadísticas de cotizaciones:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las estadísticas'
            });
        }
    }
}

module.exports = new QuoteController();