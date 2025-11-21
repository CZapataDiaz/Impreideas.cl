const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { optionalAuth } = require('../middleware/auth');
const { 
    validateQuoteCreation, 
    validateQuoteStatusUpdate, 
    validateQuoteExtension,
    validateUuidParam 
} = require('../middleware/validation');

/**
 * @route   POST /api/quotes
 * @desc    Crear nueva cotización (anónima o autenticada)
 * @access  Público (con autenticación opcional)
 */
router.post('/',
    optionalAuth,
    validateQuoteCreation,
    quoteController.createQuote
);

/**
 * @route   GET /api/quotes
 * @desc    Obtener cotizaciones del usuario autenticado
 * @access  Privado
 */
router.get('/',
    optionalAuth, // Se convierte en auth requerida en el controller
    quoteController.getUserQuotes
);

/**
 * @route   GET /api/quotes/stats
 * @desc    Obtener estadísticas de cotizaciones del usuario
 * @access  Privado
 */
router.get('/stats',
    optionalAuth,
    quoteController.getQuoteStats
);

/**
 * @route   GET /api/quotes/:id
 * @desc    Obtener cotización específica
 * @access  Privado (o público con token si se implementa)
 */
router.get('/:id',
    optionalAuth,
    validateUuidParam,
    quoteController.getQuoteById
);

/**
 * @route   GET /api/quotes/by-number/:quoteNumber
 * @desc    Obtener cotización por número (público)
 * @access  Público
 */
router.get('/by-number/:quoteNumber',
    quoteController.getQuoteByNumber
);

/**
 * @route   PUT /api/quotes/:id/status
 * @desc    Actualizar estado de cotización
 * @access  Privado
 */
router.put('/:id/status',
    optionalAuth,
    validateUuidParam,
    validateQuoteStatusUpdate,
    quoteController.updateQuoteStatus
);

/**
 * @route   PUT /api/quotes/:id/extend
 * @desc    Extender fecha de expiración de cotización
 * @access  Privado
 */
router.put('/:id/extend',
    optionalAuth,
    validateUuidParam,
    validateQuoteExtension,
    quoteController.extendQuoteExpiration
);

module.exports = router;