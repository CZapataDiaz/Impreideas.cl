const express = require('express');
const router = express.Router();

// Importar controladores y middleware
const productController = require('../controllers/product.controller');
const { optionalAuth } = require('../middleware/auth');
const { validateProductSearch, validateIntegerParam, validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * Rutas de productos para ImpreIdeas
 * Maneja listado, búsqueda, filtrado y detalles de productos
 */

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros y paginación
 * @access  Público
 * @query   search, categoryId, minPrice, maxPrice, page, limit, sortBy
 */
router.get('/', validateProductSearch, productController.getAllProducts);

/**
 * @route   GET /api/products/search
 * @desc    Buscar productos por término
 * @access  Público
 * @query   q (término de búsqueda), limit
 */
router.get('/search',
    validate(Joi.object({
        q: Joi.string().min(2).max(255).required().messages({
            'string.min': 'El término de búsqueda debe tener al menos 2 caracteres',
            'string.max': 'El término de búsqueda no puede exceder 255 caracteres',
            'any.required': 'El término de búsqueda es requerido'
        }),
        limit: Joi.number().integer().min(1).max(50).default(10)
    }), 'query'),
    productController.searchProducts
);

/**
 * @route   GET /api/products/featured
 * @desc    Obtener productos destacados/populares
 * @access  Público
 * @query   limit
 */
router.get('/featured',
    validate(Joi.object({
        limit: Joi.number().integer().min(1).max(20).default(6)
    }), 'query'),
    productController.getFeaturedProducts
);

/**
 * @route   GET /api/products/category/:categoryId
 * @desc    Obtener productos por categoría
 * @access  Público
 * @param   categoryId - ID de la categoría
 */
router.get('/category/:categoryId',
    validate(Joi.object({
        categoryId: Joi.number().integer().positive().required().messages({
            'number.base': 'El ID de categoría debe ser un número',
            'number.positive': 'El ID de categoría debe ser positivo',
            'any.required': 'El ID de categoría es requerido'
        })
    }), 'params'),
    validate(Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
        sortBy: Joi.string().valid('name', 'price_asc', 'price_desc', 'newest').default('name')
    }), 'query'),
    productController.getProductsByCategory
);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener un producto específico por ID
 * @access  Público
 * @param   id - ID del producto
 */
router.get('/:id', validateIntegerParam, productController.getProductById);

/**
 * @route   POST /api/products/:id/calculate-price
 * @desc    Calcular precio con personalización
 * @access  Público
 * @param   id - ID del producto
 */
router.post('/:id/calculate-price',
    validateIntegerParam,
    validate(Joi.object({
        quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'La cantidad debe ser un número',
            'number.integer': 'La cantidad debe ser un número entero',
            'number.min': 'La cantidad debe ser al menos 1',
            'any.required': 'La cantidad es requerida'
        }),
        personalization: Joi.object({
            sizeId: Joi.number().integer().positive().optional(),
            areaId: Joi.number().integer().positive().optional(),
            methodId: Joi.number().integer().positive().optional(),
            color: Joi.string().max(100).optional(),
            position: Joi.string().max(100).optional(),
            notes: Joi.string().max(500).optional()
        }).optional().default({})
    }), 'body'),
    productController.calculatePrice
);

/**
 * @route   GET /api/products/:id/personalization-options
 * @desc    Obtener opciones de personalización para un producto
 * @access  Público
 * @param   id - ID del producto
 */
router.get('/:id/personalization-options',
    validateIntegerParam,
    productController.getPersonalizationOptions
);

/**
 * @route   GET /api/products/:id/availability
 * @desc    Verificar disponibilidad de producto
 * @access  Público
 * @param   id - ID del producto
 * @query   quantity - Cantidad a verificar (opcional)
 */
router.get('/:id/availability',
    validateIntegerParam,
    validate(Joi.object({
        quantity: Joi.number().integer().min(1).optional()
    }), 'query'),
    productController.checkAvailability
);

/**
 * @route   GET /api/products/:id/similar
 * @desc    Obtener productos similares
 * @access  Público
 * @param   id - ID del producto
 * @note    Implementación futura
 */
router.get('/:id/similar',
    validateIntegerParam,
    validate(Joi.object({
        limit: Joi.number().integer().min(1).max(10).default(4)
    }), 'query'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { limit } = req.query;

            // Por ahora, devolver productos de la misma categoría
            const { Product, Category } = require('../models');
            const product = await Product.findByPk(id, {
                include: [{ model: Category, as: 'category' }]
            });

            if (!product) {
                return res.status(404).json({
                    error: 'Producto no encontrado',
                    message: 'El producto especificado no existe'
                });
            }

            const similarProducts = await Product.findAll({
                where: {
                    categoryId: product.categoryId,
                    id: { [require('sequelize').Op.ne]: id },
                    isActive: true
                },
                include: [{ model: Category, as: 'category' }],
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });

            res.json({
                message: 'Productos similares obtenidos exitosamente',
                baseProduct: {
                    id: product.id,
                    name: product.name,
                    category: product.category.name
                },
                similarProducts,
                total: similarProducts.length
            });

        } catch (error) {
            console.error('Error al obtener productos similares:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos similares'
            });
        }
    }
);

/**
 * @route   GET /api/products/:id/reviews
 * @desc    Obtener reseñas del producto
 * @access  Público
 * @param   id - ID del producto
 * @note    Implementación futura
 */
router.get('/:id/reviews',
    validateIntegerParam,
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'Las reseñas de productos estarán disponibles próximamente',
            productId: req.params.id
        });
    }
);

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Agregar reseña al producto  
 * @access  Privado
 * @param   id - ID del producto
 * @note    Implementación futura
 */
router.post('/:id/reviews',
    validateIntegerParam,
    validate(Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().min(10).max(1000).required(),
        title: Joi.string().max(200).optional()
    }), 'body'),
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'La funcionalidad de reseñas estará disponible próximamente'
        });
    }
);

/**
 * @route   GET /api/products/stats/popular
 * @desc    Obtener productos más populares
 * @access  Público
 * @note    Implementación futura con analytics
 */
router.get('/stats/popular',
    validate(Joi.object({
        period: Joi.string().valid('week', 'month', 'year').default('month'),
        limit: Joi.number().integer().min(1).max(20).default(10)
    }), 'query'),
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'Las estadísticas de popularidad estarán disponibles próximamente'
        });
    }
);

// Middleware de manejo de errores específico para productos
router.use((error, req, res, next) => {
    console.error('Error en rutas de productos:', error);
    
    // Error de producto no encontrado
    if (error.name === 'SequelizeEmptyResultError') {
        return res.status(404).json({
            error: 'Producto no encontrado',
            message: 'El producto solicitado no existe'
        });
    }
    
    // Error de validación de parámetros
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
        return res.status(400).json({
            error: 'Parámetro inválido',
            message: 'El ID del producto debe ser un número válido'
        });
    }
    
    // Error genérico
    res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar la solicitud de productos'
    });
});

module.exports = router;