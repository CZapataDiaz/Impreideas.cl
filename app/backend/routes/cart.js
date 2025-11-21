const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Importar controladores y middleware
const cartController = require('../controllers/cartController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * Rutas de carrito de compras para ImpreIdeas
 * Soporta carritos anónimos (por sesión) y de usuarios autenticados
 */

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito actual
 * @access  Público (con autenticación opcional)
 */
router.get('/',
    optionalAuth,
    cartController.getCart
);

/**
 * @route   POST /api/cart/items
 * @desc    Agregar item al carrito
 * @access  Público (con autenticación opcional)
 */
router.post('/items',
    optionalAuth,
    validate(Joi.object({
        productId: Joi.number().integer().positive().required().messages({
            'number.base': 'El ID del producto debe ser un número',
            'number.positive': 'El ID del producto debe ser positivo',
            'any.required': 'El ID del producto es requerido'
        }),
        quantity: Joi.number().integer().min(1).required().messages({
            'number.min': 'La cantidad debe ser al menos 1',
            'any.required': 'La cantidad es requerida'
        }),
        personalization: Joi.object({
            color: Joi.string().max(100).optional().allow('', null),
            logoPosition: Joi.string().max(100).optional().allow('', null),
            logoSize: Joi.string().max(100).optional().allow('', null),
            printMethod: Joi.string().max(100).optional().allow('', null),
            logoType: Joi.string().valid('image', 'text', 'none').optional(),
            logoText: Joi.string().max(500).optional().allow('', null),
            logoFileId: Joi.string().uuid().optional().allow(null),
            notes: Joi.string().max(1000).optional().allow('', null)
        }).optional().default(null)
    }), 'body'),
    cartController.addItem
);

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Actualizar cantidad de item
 * @access  Público (con autenticación opcional)
 */
router.put('/items/:id',
    optionalAuth,
    validate(Joi.object({
        id: Joi.string().uuid().required().messages({
            'string.guid': 'El ID del item debe ser un UUID válido',
            'any.required': 'El ID del item es requerido'
        })
    }), 'params'),
    validate(Joi.object({
        quantity: Joi.number().integer().min(1).required().messages({
            'number.min': 'La cantidad debe ser al menos 1',
            'any.required': 'La cantidad es requerida'
        })
    }), 'body'),
    cartController.updateItem
);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Eliminar item del carrito
 * @access  Público (con autenticación opcional)
 */
router.delete('/items/:id',
    optionalAuth,
    validate(Joi.object({
        id: Joi.string().uuid().required()
    }), 'params'),
    cartController.removeItem
);

/**
 * @route   POST /api/cart/clear
 * @desc    Vaciar carrito
 * @access  Público (con autenticación opcional)
 */
router.post('/clear',
    optionalAuth,
    cartController.clearCart
);

/**
 * @route   POST /api/cart/sync
 * @desc    Sincronizar carrito local con servidor (al hacer login)
 * @access  Privado
 */
router.post('/sync',
    authenticateToken,
    validate(Joi.object({
        items: Joi.array().items(
            Joi.object({
                productId: Joi.number().integer().positive().required(),
                quantity: Joi.number().integer().min(1).required(),
                personalization: Joi.object().optional().default(null)
            })
        ).required()
    }), 'body'),
    cartController.syncCart
);

// Middleware de manejo de errores específico para carrito
router.use((error, req, res, next) => {
    console.error('Error en rutas de carrito:', error);
    
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            message: error.errors.map(e => e.message).join(', ')
        });
    }
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar la solicitud del carrito'
    });
});

module.exports = router;
