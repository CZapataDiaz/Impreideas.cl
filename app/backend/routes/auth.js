const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Importar controladores y middleware
const authController = require('../controllers/authController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { 
    validateUserRegistration, 
    validateUserLogin, 
    validate, 
    schemas 
} = require('../middleware/validation');

/**
 * Rutas de autenticación para ImpreIdeas
 * Maneja registro, login, perfil y gestión de usuarios
 */

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario/empresa
 * @access  Público
 */
router.post('/register', validateUserRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión de usuario
 * @access  Público
 */
router.post('/login', validateUserLogin, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario actual
 * @access  Privado
 */
router.get('/me', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/me
 * @desc    Actualizar perfil del usuario
 * @access  Privado
 */
router.put('/me', 
    authenticateToken, 
    validate(schemas.userUpdate, 'body'),
    authController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña del usuario
 * @access  Privado
 */
router.put('/change-password',
    authenticateToken,
    authController.changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalidar token)
 * @access  Privado
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acceso
 * @access  Público
 */
router.post('/refresh',
    authController.refreshToken
);

/**
 * @route   GET /api/auth/stats
 * @desc    Obtener estadísticas del usuario (dashboard)
 * @access  Privado
 */
router.get('/stats', authenticateToken, authController.getUserStats);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Público
 * @note    Implementación futura
 */
router.post('/forgot-password',
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'La recuperación de contraseña estará disponible próximamente'
        });
    }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Público
 * @note    Implementación futura
 */
router.post('/reset-password',
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'El restablecimiento de contraseña estará disponible próximamente'
        });
    }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verificar email del usuario
 * @access  Público
 * @note    Implementación futura
 */
router.post('/verify-email',
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'La verificación de email estará disponible próximamente'
        });
    }
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Reenviar email de verificación
 * @access  Privado
 * @note    Implementación futura
 */
router.post('/resend-verification',
    authenticateToken,
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'El reenvío de verificación estará disponible próximamente'
        });
    }
);

// Middleware de manejo de errores específico para rutas de auth
router.use((error, req, res, next) => {
    console.error('Error en rutas de autenticación:', error);
    
    // Errores específicos de autenticación
    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Token inválido',
            message: 'El token de autenticación no es válido'
        });
    }
    
    if (error.code === 11000) { // Error de duplicado en MongoDB (si se usara)
        return res.status(409).json({
            error: 'Usuario ya existe',
            message: 'Ya existe una cuenta con este email'
        });
    }
    
    // Error genérico
    res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error en el sistema de autenticación'
    });
});

module.exports = router;