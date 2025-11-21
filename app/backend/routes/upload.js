const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

// Importar controladores y middleware
const uploadController = require('../controllers/uploadController');
const { optionalAuth } = require('../middleware/auth');

/**
 * Rutas de carga de archivos para ImpreIdeas
 * Maneja subida de logos y archivos de diseño
 */

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        
        try {
            // Crear directorio si no existe
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            console.error('Error al crear directorio de uploads:', error);
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uniqueId}${ext}`;
        cb(null, filename);
    }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/svg+xml,application/pdf').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido. Solo se aceptan: ${allowedTypes.join(', ')}`), false);
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
    }
});

/**
 * @route   POST /api/upload/logo
 * @desc    Subir archivo de logo para personalización
 * @access  Público (con autenticación opcional)
 */
router.post('/logo',
    optionalAuth,
    upload.single('file'),
    uploadController.uploadFile
);

/**
 * @route   POST /api/upload/design
 * @desc    Subir archivo de diseño (PDF, AI, etc.)
 * @access  Público (con autenticación opcional)
 */
router.post('/design',
    optionalAuth,
    upload.single('file'),
    uploadController.uploadFile
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Subir múltiples archivos
 * @access  Público (con autenticación opcional)
 */
router.post('/multiple',
    optionalAuth,
    upload.array('files', 10), // Máximo 10 archivos
    uploadController.uploadMultipleFiles
);

/**
 * @route   GET /api/upload/:id
 * @desc    Obtener información de un archivo subido
 * @access  Público
 */
router.get('/:id', (req, res) => {
    res.status(501).json({
        error: 'Función no implementada',
        message: 'La consulta de archivos estará disponible próximamente'
    });
});

/**
 * @route   DELETE /api/upload/:id
 * @desc    Eliminar archivo subido
 * @access  Público (con autenticación opcional)
 */
router.delete('/:id',
    optionalAuth,
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'La eliminación de archivos estará disponible próximamente'
        });
    }
);

/**
 * @route   GET /api/upload/user/files
 * @desc    Obtener archivos del usuario autenticado
 * @access  Privado
 * @note    Requiere autenticación
 */
router.get('/user/files',
    optionalAuth,
    (req, res) => {
        res.status(501).json({
            error: 'Función no implementada',
            message: 'La consulta de archivos de usuario estará disponible próximamente'
        });
    }
);

/**
 * @route   POST /api/upload/validate
 * @desc    Validar archivo antes de subirlo (tamaño, tipo)
 * @access  Público
 */
router.post('/validate', (req, res) => {
    const { filename, filesize, filetype } = req.body;
    
    if (!filename || !filesize || !filetype) {
        return res.status(400).json({
            error: 'Datos incompletos',
            message: 'Se requiere filename, filesize y filetype'
        });
    }
    
    // Validar tamaño
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
    if (filesize > maxSize) {
        return res.status(400).json({
            error: 'Archivo demasiado grande',
            message: `El archivo excede el tamaño máximo permitido de ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
            maxSize: maxSize,
            providedSize: filesize
        });
    }
    
    // Validar tipo
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/svg+xml,application/pdf').split(',');
    if (!allowedTypes.includes(filetype)) {
        return res.status(400).json({
            error: 'Tipo de archivo no permitido',
            message: `Solo se permiten los siguientes tipos: ${allowedTypes.join(', ')}`,
            allowedTypes: allowedTypes,
            providedType: filetype
        });
    }
    
    res.json({
        valid: true,
        message: 'El archivo es válido para subir',
        filename,
        filesize,
        filetype
    });
});

// Middleware de manejo de errores de Multer
router.use((error, req, res, next) => {
    console.error('Error en rutas de upload:', error);
    
    // Errores de Multer
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
            return res.status(400).json({
                error: 'Archivo demasiado grande',
                message: `El archivo excede el tamaño máximo de ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
                code: error.code
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Demasiados archivos',
                message: 'Se excedió el número máximo de archivos permitidos',
                code: error.code
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de archivo inesperado',
                message: 'El nombre del campo de archivo no es válido',
                code: error.code
            });
        }
        
        return res.status(400).json({
            error: 'Error de carga',
            message: error.message,
            code: error.code
        });
    }
    
    // Error de tipo de archivo no permitido
    if (error.message && error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            error: 'Tipo de archivo no permitido',
            message: error.message
        });
    }
    
    // Error de falta de archivo
    if (error.message && error.message.includes('No se proporcionó archivo')) {
        return res.status(400).json({
            error: 'Archivo requerido',
            message: 'No se proporcionó ningún archivo para subir'
        });
    }
    
    // Error genérico
    res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar la carga del archivo'
    });
});

module.exports = router;