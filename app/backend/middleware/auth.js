const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authConfig = require('../config/auth');

// Middleware for required authentication
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                error: 'Token de acceso requerido',
                message: 'Debes proporcionar un token de autenticación válido'
            });
        }
        
        // Check if token is blacklisted
        if (authConfig.tokenBlacklist.has(token)) {
            return res.status(401).json({
                error: 'Token inválido',
                message: 'Este token ha sido invalidado'
            });
        }
        
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        // Get user from database
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['hashedPassword'] }
        });
        
        if (!user) {
            return res.status(401).json({
                error: 'Usuario no encontrado',
                message: 'El usuario asociado a este token no existe'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Usuario inactivo',
                message: 'Tu cuenta ha sido desactivada'
            });
        }
        
        req.user = user;
        req.token = token;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                message: 'El token proporcionado no es válido'
            });
        }
        
        console.error('Authentication error:', error);
        res.status(500).json({
            error: 'Error de autenticación',
            message: 'Error interno del servidor durante la autenticación'
        });
    }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }
        
        // Check if token is blacklisted
        if (authConfig.tokenBlacklist.has(token)) {
            req.user = null;
            return next();
        }
        
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['hashedPassword'] }
        });
        
        if (user && user.isActive) {
            req.user = user;
            req.token = token;
        } else {
            req.user = null;
        }
        
        next();
        
    } catch (error) {
        // For optional auth, we don't fail on token errors
        req.user = null;
        next();
    }
};

// Middleware to check if user is admin (if you implement roles later)
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Autenticación requerida',
            message: 'Debes estar autenticado para acceder a este recurso'
        });
    }
    
    if (!req.user.isAdmin) {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'No tienes permisos de administrador para realizar esta acción'
        });
    }
    
    next();
};

// Middleware to validate session (check if user is still active)
const validateSession = async (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }
        
        // Refresh user data to ensure they're still active
        const currentUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['hashedPassword'] }
        });
        
        if (!currentUser || !currentUser.isActive) {
            return res.status(401).json({
                error: 'Sesión inválida',
                message: 'Tu cuenta ha sido desactivada o no existe'
            });
        }
        
        req.user = currentUser;
        next();
        
    } catch (error) {
        console.error('Session validation error:', error);
        res.status(500).json({
            error: 'Error de validación de sesión',
            message: 'Error interno del servidor'
        });
    }
};

// Rate limiting middleware specifically for auth routes
const authRateLimit = (req, res, next) => {
    // This would be implemented with a proper rate limiting library like express-rate-limit
    // or with Redis in production
    next();
};

// Generate JWT token
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        companyName: user.companyName
    };
    
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn
    });
};

// Generate refresh token
const generateRefreshToken = (user) => {
    const payload = {
        userId: user.id,
        type: 'refresh'
    };
    
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtRefreshExpiresIn
    });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid refresh token type');
        }
        return decoded;
    } catch (error) {
        throw error;
    }
};

// Invalidate token (add to blacklist)
const invalidateToken = (token) => {
    authConfig.tokenBlacklist.add(token);
    // In production, you'd store this in Redis with expiration
    // Redis would automatically clean up expired tokens
};

// Clean up expired tokens from blacklist (for memory management)
const cleanupBlacklist = () => {
    // This is a simplified version - in production use Redis with TTL
    if (authConfig.tokenBlacklist.size > 10000) {
        authConfig.tokenBlacklist.clear();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    validateSession,
    authRateLimit,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    invalidateToken,
    cleanupBlacklist
};