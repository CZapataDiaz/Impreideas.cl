const { Product, Category, PersonalizationOption } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador de productos para ImpreIdeas
 * Maneja listado, búsqueda, filtrado y detalles de productos
 */
class ProductController {
    /**
     * Obtener todos los productos con filtros y paginación
     * GET /api/products
     */
    async getAllProducts(req, res) {
        try {
            const {
                search,
                categoryId,
                minPrice,
                maxPrice,
                page = 1,
                limit = 20,
                sortBy = 'name'
            } = req.query;

            // Construir condiciones WHERE
            const whereConditions = {
                isActive: true
            };

            // Filtro por búsqueda
            if (search) {
                whereConditions[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Filtro por categoría
            if (categoryId) {
                whereConditions.categoryId = parseInt(categoryId);
            }

            // Filtro por rango de precios
            if (minPrice || maxPrice) {
                whereConditions.basePrice = {};
                if (minPrice) whereConditions.basePrice[Op.gte] = parseFloat(minPrice);
                if (maxPrice) whereConditions.basePrice[Op.lte] = parseFloat(maxPrice);
            }

            // Configurar ordenamiento
            let orderBy = [['name', 'ASC']]; // Por defecto
            switch (sortBy) {
                case 'price_asc':
                    orderBy = [['basePrice', 'ASC']];
                    break;
                case 'price_desc':
                    orderBy = [['basePrice', 'DESC']];
                    break;
                case 'created_at':
                    orderBy = [['createdAt', 'DESC']];
                    break;
                case 'min_order':
                    orderBy = [['minOrder', 'ASC']];
                    break;
            }

            // Calcular offset para paginación
            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Ejecutar consulta
            const { count, rows: products } = await Product.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                order: orderBy,
                limit: parseInt(limit),
                offset: offset,
                distinct: true
            });

            // Calcular información de paginación
            const totalPages = Math.ceil(count / parseInt(limit));
            const hasNextPage = parseInt(page) < totalPages;
            const hasPrevPage = parseInt(page) > 1;

            res.json({
                message: 'Productos obtenidos exitosamente',
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    search: search || null,
                    categoryId: categoryId ? parseInt(categoryId) : null,
                    minPrice: minPrice ? parseFloat(minPrice) : null,
                    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                    sortBy
                }
            });

        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos'
            });
        }
    }

    /**
     * Obtener un producto específico por ID
     * GET /api/products/:id
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (!product) {
                return res.status(404).json({
                    error: 'Producto no encontrado',
                    message: `No existe un producto con el ID ${id}`
                });
            }

            if (!product.isActive) {
                return res.status(404).json({
                    error: 'Producto no disponible',
                    message: 'Este producto no está disponible actualmente'
                });
            }

            res.json({
                message: 'Producto obtenido exitosamente',
                product
            });

        } catch (error) {
            console.error('Error al obtener producto:', error);
            
            // Manejar error de ID inválido
            if (error.name === 'SequelizeDatabaseError') {
                return res.status(400).json({
                    error: 'ID de producto inválido',
                    message: 'El ID proporcionado no es válido'
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo obtener el producto'
            });
        }
    }

    /**
     * Buscar productos por término
     * GET /api/products/search
     */
    async searchProducts(req, res) {
        try {
            const { q: searchTerm, limit = 10 } = req.query;

            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json({
                    error: 'Término de búsqueda inválido',
                    message: 'El término de búsqueda debe tener al menos 2 caracteres'
                });
            }

            const products = await Product.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${searchTerm}%` } },
                        { description: { [Op.iLike]: `%${searchTerm}%` } }
                    ]
                },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ],
                limit: parseInt(limit),
                order: [
                    // Priorizar coincidencias exactas en el nombre
                    [
                        { [Op.col]: 'name' },
                        { [Op.iLike]: `${searchTerm}%` }
                    ],
                    ['name', 'ASC']
                ]
            });

            res.json({
                message: `Encontrados ${products.length} productos`,
                searchTerm,
                products,
                total: products.length
            });

        } catch (error) {
            console.error('Error en búsqueda de productos:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo realizar la búsqueda'
            });
        }
    }

    /**
     * Obtener productos por categoría
     * GET /api/products/category/:categoryId
     */
    async getProductsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { limit = 20, page = 1, sortBy = 'name' } = req.query;

            // Verificar que la categoría existe
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({
                    error: 'Categoría no encontrada',
                    message: `No existe una categoría con el ID ${categoryId}`
                });
            }

            // Configurar ordenamiento
            let orderBy = [['name', 'ASC']];
            switch (sortBy) {
                case 'price_asc':
                    orderBy = [['basePrice', 'ASC']];
                    break;
                case 'price_desc':
                    orderBy = [['basePrice', 'DESC']];
                    break;
                case 'newest':
                    orderBy = [['createdAt', 'DESC']];
                    break;
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: products } = await Product.findAndCountAll({
                where: {
                    categoryId: parseInt(categoryId),
                    isActive: true
                },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                order: orderBy,
                limit: parseInt(limit),
                offset: offset
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                message: `Productos de la categoría "${category.name}" obtenidos exitosamente`,
                category: {
                    id: category.id,
                    name: category.name,
                    description: category.description
                },
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos de la categoría'
            });
        }
    }

    /**
     * Obtener productos destacados/populares
     * GET /api/products/featured
     */
    async getFeaturedProducts(req, res) {
        try {
            const { limit = 6 } = req.query;

            const products = await Product.findAll({
                where: {
                    isActive: true,
                    stockAvailable: true
                },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ],
                order: [['createdAt', 'DESC']], // Los más recientes como destacados
                limit: parseInt(limit)
            });

            res.json({
                message: 'Productos destacados obtenidos exitosamente',
                products,
                total: products.length
            });

        } catch (error) {
            console.error('Error al obtener productos destacados:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos destacados'
            });
        }
    }

    /**
     * Calcular precio con personalización
     * POST /api/products/:id/calculate-price
     */
    async calculatePrice(req, res) {
        try {
            const { id } = req.params;
            const { quantity, personalization = {} } = req.body;

            // Buscar producto
            const product = await Product.findByPk(id);
            if (!product || !product.isActive) {
                return res.status(404).json({
                    error: 'Producto no encontrado',
                    message: 'El producto no existe o no está disponible'
                });
            }

            // Validar cantidad mínima
            if (quantity < product.minOrder) {
                return res.status(400).json({
                    error: 'Cantidad insuficiente',
                    message: `La cantidad mínima para este producto es ${product.minOrder} unidades`,
                    minOrder: product.minOrder
                });
            }

            // Calcular precio base
            let unitPrice = parseFloat(product.basePrice);

            // Agregar costos de personalización
            if (personalization.sizeId) {
                const size = await PersonalizationOption.findByPk(personalization.sizeId);
                if (size && size.type === 'logo_size') {
                    unitPrice += parseFloat(size.price);
                }
            }

            // Agregar costo de área de personalización
            if (personalization.areaId && product.personalizationAreas) {
                const area = product.personalizationAreas.find(a => a.id === personalization.areaId);
                if (area && area.price) {
                    unitPrice += parseFloat(area.price);
                }
            }

            // Calcular totales
            const subtotal = unitPrice * quantity;
            const taxRate = 0.0; // IVA 19% Chile
            const taxAmount = subtotal * taxRate;
            const totalPrice = subtotal + taxAmount;

            res.json({
                message: 'Precio calculado exitosamente',
                calculation: {
                    productId: parseInt(id),
                    productName: product.name,
                    quantity,
                    basePrice: parseFloat(product.basePrice),
                    unitPrice,
                    subtotal,
                    taxRate,
                    taxAmount,
                    totalPrice,
                    personalization,
                    formattedPrices: {
                        unitPrice: `$${unitPrice.toLocaleString('es-CL')} CLP`,
                        subtotal: `$${subtotal.toLocaleString('es-CL')} CLP`,
                        taxAmount: `$${taxAmount.toLocaleString('es-CL')} CLP`,
                        totalPrice: `$${totalPrice.toLocaleString('es-CL')} CLP`
                    }
                }
            });

        } catch (error) {
            console.error('Error al calcular precio:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo calcular el precio'
            });
        }
    }

    /**
     * Obtener opciones de personalización para un producto
     * GET /api/products/:id/personalization-options
     */
    async getPersonalizationOptions(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el producto existe
            const product = await Product.findByPk(id);
            if (!product || !product.isActive) {
                return res.status(404).json({
                    error: 'Producto no encontrado',
                    message: 'El producto no existe o no está disponible'
                });
            }

            // Obtener todas las opciones de personalización activas
            const options = await PersonalizationOption.findAll({
                where: { isActive: true },
                order: [['type', 'ASC'], ['name', 'ASC']]
            });

            // Agrupar opciones por tipo
            const groupedOptions = options.reduce((acc, option) => {
                if (!acc[option.type]) {
                    acc[option.type] = [];
                }
                acc[option.type].push({
                    id: option.id,
                    name: option.name,
                    description: option.description,
                    price: parseFloat(option.price),
                    formattedPrice: `$${parseFloat(option.price).toLocaleString('es-CL')} CLP`,
                    properties: option.properties
                });
                return acc;
            }, {});

            res.json({
                message: 'Opciones de personalización obtenidas exitosamente',
                productId: parseInt(id),
                productName: product.name,
                productPersonalizationAreas: product.personalizationAreas,
                options: groupedOptions
            });

        } catch (error) {
            console.error('Error al obtener opciones de personalización:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las opciones de personalización'
            });
        }
    }

    /**
     * Verificar disponibilidad de producto
     * GET /api/products/:id/availability
     */
    async checkAvailability(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.query;

            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({
                    error: 'Producto no encontrado',
                    message: 'El producto no existe'
                });
            }

            const availability = {
                productId: parseInt(id),
                productName: product.name,
                isActive: product.isActive,
                stockAvailable: product.stockAvailable,
                minOrder: product.minOrder,
                available: product.isActive && product.stockAvailable
            };

            // Verificar cantidad si se proporciona
            if (quantity) {
                const requestedQuantity = parseInt(quantity);
                availability.requestedQuantity = requestedQuantity;
                availability.meetsMinimumOrder = requestedQuantity >= product.minOrder;
                availability.canFulfill = availability.available && availability.meetsMinimumOrder;
            }

            res.json({
                message: 'Disponibilidad verificada exitosamente',
                availability
            });

        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo verificar la disponibilidad'
            });
        }
    }
}

module.exports = new ProductController();