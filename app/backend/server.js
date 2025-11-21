const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./models');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const quoteRoutes = require('./routes/quotes');
const uploadRoutes = require('./routes/upload');
const cartRoutes = require('./routes/cart');
const personalizationOptionsRoutes = require('./routes/personalizationOptions');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000)
    }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (IMPORTANTE para las imágenes)
app.use('/images', express.static('images'));
app.use('/uploads', express.static('uploads'));

// Si no existe la carpeta images, créala
const fs = require('fs');
if (!fs.existsSync('images')) {
    fs.mkdirSync('images', { recursive: true });
    console.log('✅ Carpeta images creada');
}

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        await db.sequelize.authenticate();
        
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/personalization-options', personalizationOptionsRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ImpreIdeas API está funcionando',
        version: process.env.APP_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            quotes: '/api/quotes',
            upload: '/api/upload',
            cart: '/api/cart'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.message
        });
    }
    
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Error de validación de base de datos',
            details: err.errors.map(e => e.message)
        });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'El recurso ya existe',
            details: err.message
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            details: err.message
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            details: err.message
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

// Start server
const PORT = process.env.PORT || 8001;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
    try {
        // Test database connection
        await db.sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        
        // Sync database (in development)
        // DESHABILITADO: Las migraciones ya crearon las tablas
        // if (process.env.NODE_ENV === 'development') {
        //     await db.sequelize.sync();
        //     console.log('✅ Modelos sincronizados con la base de datos');
        // }
        
        app.listen(PORT, HOST, () => {
            console.log(`🚀 ImpreIdeas API iniciado en http://${HOST}:${PORT}`);
            console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
            console.log(`📚 Ambiente: ${process.env.NODE_ENV}`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Cerrando servidor graciosamente...');
    await db.sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Cerrando servidor graciosamente...');
    await db.sequelize.close();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

startServer();

module.exports = app;