const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Importar modelos y middleware
const { Category, Product } = require('../models');
const { validate } = require('../middleware/validation');

/**
 * Rutas de categorías para ImpreIdeas
 * Maneja listado y consulta de categorías de productos
 */

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías activas
 * @access  Público
 */
router.get('/', async (req, res) => {
    try {
        const categories = await Category.getActiveCategories();
        
        res.json({
            message: 'Categorías obtenidas exitosamente',
            categories,
            total: categories.length
        });
        
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las categorías'
        });
    }
});

/**
 * @route   GET /api/categories/with-counts
 * @desc    Obtener categorías con conteo de productos
 * @access  Público
 */
router.get('/with-counts', async (req, res) => {
    try {
        // Obtener categorías activas con conteo de productos
        const categoriesWithCounts = await Category.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Product,
                    as: 'products',
                    where: { isActive: true },
                    attributes: [],
                    required: false
                }
            ],
            attributes: [
                'id',
                'name', 
                'description',
                [Category.sequelize.fn('COUNT', Category.sequelize.col('products.id')), 'productCount']
            ],
            group: ['Category.id'],
            order: [['name', 'ASC']]
        });

        // Agregar categoría "Todos" al inicio
        const allCategories = [
            {
                id: 0,
                name: 'Todos',
                description: 'Todos los productos disponibles',
                productCount: await Product.count({ where: { isActive: true } })
            },
            ...categoriesWithCounts.map(cat => ({
                id: cat.id,
                name: cat.name,
                description: cat.description,
                productCount: parseInt(cat.dataValues.productCount) || 0
            }))
        ];

        res.json({
            message: 'Categorías con conteos obtenidas exitosamente',
            categories: allCategories,
            total: allCategories.length
        });
        
    } catch (error) {
        console.error('Error al obtener categorías con conteos:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las categorías con conteos'
        });
    }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener categoría por ID
 * @access  Público
 * @param   id - ID de la categoría
 */
router.get('/:id',
    validate(Joi.object({
        id: Joi.number().integer().positive().required().messages({
            'number.base': 'El ID de categoría debe ser un número',
            'number.positive': 'El ID de categoría debe ser positivo',
            'any.required': 'El ID de categoría es requerido'
        })
    }), 'params'),
    async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.findByPk(id, {
                include: [
                    {
                        model: Product,
                        as: 'products',
                        where: { isActive: true },
                        attributes: ['id', 'name', 'basePrice', 'image'],
                        required: false,
                        limit: 5, // Solo mostrar algunos productos como ejemplo
                        order: [['name', 'ASC']]
                    }
                ]
            });

            if (!category) {
                return res.status(404).json({
                    error: 'Categoría no encontrada',
                    message: `No existe una categoría con el ID ${id}`
                });
            }

            if (!category.isActive) {
                return res.status(404).json({
                    error: 'Categoría no disponible',
                    message: 'Esta categoría no está disponible actualmente'
                });
            }

            // Contar total de productos en la categoría
            const totalProducts = await Product.count({
                where: { 
                    categoryId: id, 
                    isActive: true 
                }
            });

            res.json({
                message: 'Categoría obtenida exitosamente',
                category: {
                    ...category.toJSON(),
                    totalProducts,
                    sampleProducts: category.products
                }
            });

        } catch (error) {
            console.error('Error al obtener categoría:', error);
            
            if (error.name === 'SequelizeDatabaseError') {
                return res.status(400).json({
                    error: 'ID de categoría inválido',
                    message: 'El ID proporcionado no es válido'
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo obtener la categoría'
            });
        }
    }
);

/**
 * @route   GET /api/categories/:id/products
 * @desc    Obtener productos de una categoría específica
 * @access  Público
 * @param   id - ID de la categoría
 */
router.get('/:id/products',
    validate(Joi.object({
        id: Joi.number().integer().positive().required()
    }), 'params'),
    validate(Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(20),
        sortBy: Joi.string().valid('name', 'price_asc', 'price_desc', 'newest').default('name')
    }), 'query'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { page, limit, sortBy } = req.query;

            // Verificar que la categoría existe
            const category = await Category.findByPk(id);
            if (!category || !category.isActive) {
                return res.status(404).json({
                    error: 'Categoría no encontrada',
                    message: 'La categoría especificada no existe o no está activa'
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
                    categoryId: parseInt(id),
                    isActive: true
                },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
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
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            });

        } catch (error) {
            console.error('Error al obtener productos de categoría:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos de la categoría'
            });
        }
    }
);

/**
 * @route   GET /api/categories/search
 * @desc    Buscar categorías por nombre
 * @access  Público
 * @query   q - Término de búsqueda
 */
router.get('/search',
    validate(Joi.object({
        q: Joi.string().min(2).max(100).required().messages({
            'string.min': 'El término de búsqueda debe tener al menos 2 caracteres',
            'any.required': 'El término de búsqueda es requerido'
        })
    }), 'query'),
    async (req, res) => {
        try {
            const { q: searchTerm } = req.query;
            const { Op } = require('sequelize');

            const categories = await Category.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${searchTerm}%` } },
                        { description: { [Op.iLike]: `%${searchTerm}%` } }
                    ]
                },
                include: [
                    {
                        model: Product,
                        as: 'products',
                        where: { isActive: true },
                        attributes: [],
                        required: false
                    }
                ],
                attributes: [
                    'id',
                    'name',
                    'description',
                    [Category.sequelize.fn('COUNT', Category.sequelize.col('products.id')), 'productCount']
                ],
                group: ['Category.id'],
                order: [['name', 'ASC']]
            });

            res.json({
                message: `Encontradas ${categories.length} categorías`,
                searchTerm,
                categories: categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    description: cat.description,
                    productCount: parseInt(cat.dataValues.productCount) || 0
                })),
                total: categories.length
            });

        } catch (error) {
            console.error('Error en búsqueda de categorías:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo realizar la búsqueda de categorías'
            });
        }
    }
);

/**
 * @route   GET /api/categories/stats
 * @desc    Obtener estadísticas de categorías
 * @access  Público
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await Category.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Product,
                    as: 'products',
                    where: { isActive: true },
                    attributes: [],
                    required: false
                }
            ],
            attributes: [
                'id',
                'name',
                [Category.sequelize.fn('COUNT', Category.sequelize.col('products.id')), 'productCount'],
                [Category.sequelize.fn('AVG', Category.sequelize.col('products.basePrice')), 'avgPrice'],
                [Category.sequelize.fn('MIN', Category.sequelize.col('products.basePrice')), 'minPrice'],
                [Category.sequelize.fn('MAX', Category.sequelize.col('products.basePrice')), 'maxPrice']
            ],
            group: ['Category.id'],
            order: [[Category.sequelize.fn('COUNT', Category.sequelize.col('products.id')), 'DESC']]
        });

        const formattedStats = stats.map(stat => ({
            id: stat.id,
            name: stat.name,
            productCount: parseInt(stat.dataValues.productCount) || 0,
            avgPrice: parseFloat(stat.dataValues.avgPrice) || 0,
            minPrice: parseFloat(stat.dataValues.minPrice) || 0,
            maxPrice: parseFloat(stat.dataValues.maxPrice) || 0,
            formattedAvgPrice: `$${(parseFloat(stat.dataValues.avgPrice) || 0).toLocaleString('es-CL')} CLP`,
            priceRange: `$${(parseFloat(stat.dataValues.minPrice) || 0).toLocaleString('es-CL')} - $${(parseFloat(stat.dataValues.maxPrice) || 0).toLocaleString('es-CL')} CLP`
        }));

        const totalCategories = await Category.count({ where: { isActive: true } });
        const totalProducts = await Product.count({ where: { isActive: true } });

        res.json({
            message: 'Estadísticas de categorías obtenidas exitosamente',
            summary: {
                totalCategories,
                totalProducts,
                avgProductsPerCategory: Math.round(totalProducts / totalCategories)
            },
            categoryStats: formattedStats
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de categorías:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las estadísticas de categorías'
        });
    }
});

// Middleware de manejo de errores específico para categorías
router.use((error, req, res, next) => {
    console.error('Error en rutas de categorías:', error);
    
    if (error.name === 'SequelizeEmptyResultError') {
        return res.status(404).json({
            error: 'Categoría no encontrada',
            message: 'La categoría solicitada no existe'
        });
    }
    
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('invalid input syntax')) {
        return res.status(400).json({
            error: 'Parámetro inválido',
            message: 'El ID de la categoría debe ser un número válido'
        });
    }
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar la solicitud de categorías'
    });
});

module.exports = router;