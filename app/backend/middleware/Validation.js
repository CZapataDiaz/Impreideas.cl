const Joi = require('joi');

// Validation schemas
const schemas = {
    // User validation
    userRegistration: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Debe proporcionar un email válido',
            'any.required': 'El email es requerido'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es requerida'
        }),
        companyName: Joi.string().min(2).max(255).required().messages({
            'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
            'string.max': 'El nombre de la empresa no puede exceder 255 caracteres',
            'any.required': 'El nombre de la empresa es requerido'
        }),
        contactName: Joi.string().min(2).max(255).required().messages({
            'string.min': 'El nombre de contacto debe tener al menos 2 caracteres',
            'string.max': 'El nombre de contacto no puede exceder 255 caracteres',
            'any.required': 'El nombre de contacto es requerido'
        }),
        phone: Joi.string().max(50).allow('', null).optional(),
        rut: Joi.string().max(50).allow('', null).optional(),
        address: Joi.string().allow('', null).optional(),
        city: Joi.string().max(100).allow('', null).optional()
    }),

    userLogin: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Debe proporcionar un email válido',
            'any.required': 'El email es requerido'
        }),
        password: Joi.string().required().messages({
            'any.required': 'La contraseña es requerida'
        })
    }),

    userUpdate: Joi.object({
        companyName: Joi.string().min(2).max(255).optional(),
        contactName: Joi.string().min(2).max(255).optional(),
        phone: Joi.string().max(50).allow('', null).optional(),
        rut: Joi.string().max(50).allow('', null).optional(),
        address: Joi.string().allow('', null).optional(),
        city: Joi.string().max(100).allow('', null).optional()
    }),

    // Product validation
    productSearch: Joi.object({
        search: Joi.string().max(255).optional(),
        categoryId: Joi.number().integer().positive().optional(),
        minPrice: Joi.number().min(0).optional(),
        maxPrice: Joi.number().min(0).optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        sortBy: Joi.string().valid('name', 'price_asc', 'price_desc', 'created_at').default('name')
    }),

    // Cart validation
    cartItemAdd: Joi.object({
        productId: Joi.number().integer().positive().required().messages({
            'number.base': 'El ID del producto debe ser un número',
            'number.positive': 'El ID del producto debe ser positivo',
            'any.required': 'El ID del producto es requerido'
        }),
        quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'La cantidad debe ser un número',
            'number.integer': 'La cantidad debe ser un número entero',
            'number.min': 'La cantidad debe ser al menos 1',
            'any.required': 'La cantidad es requerida'
        }),
        personalization: Joi.object({
            color: Joi.string().max(100).optional(),
            position: Joi.string().max(100).optional(),
            size: Joi.string().max(50).optional(),
            method: Joi.string().max(100).optional(),
            logo: Joi.object({
                type: Joi.string().valid('file', 'text').optional(),
                name: Joi.string().max(255).optional(),
                content: Joi.string().optional(),
                size: Joi.number().optional()
            }).optional(),
            additionalNotes: Joi.string().max(1000).optional()
        }).optional().default({})
    }),

    cartItemUpdate: Joi.object({
        quantity: Joi.number().integer().min(1).optional(),
        personalization: Joi.object().optional()
    }),

// Quote validation - VERSIÓN CORREGIDA
quoteCreate: Joi.object({
    // Campos individuales (compatibles con tu controller actual)
    companyName: Joi.string().min(2).max(255).optional().messages({
        'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
        'string.max': 'El nombre de la empresa no puede exceder 255 caracteres'
    }),
    contactName: Joi.string().min(2).max(255).optional().messages({
        'string.min': 'El nombre de contacto debe tener al menos 2 caracteres'
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Debe proporcionar un email válido'
    }),
    phone: Joi.string().min(8).max(50).optional().messages({
        'string.min': 'El teléfono debe tener al menos 8 caracteres'
    }),
    rut: Joi.string().max(50).optional().allow('', null),
    address: Joi.string().max(500).optional().allow('', null),
    city: Joi.string().max(100).optional().allow('', null),
    additionalComments: Joi.string().max(2000).optional().allow('', null),

    // Items de la cotización
    items: Joi.array().min(1).items(
        Joi.object({
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
                logoType: Joi.string().valid('image', 'text', 'none').optional().default('none'),
                logoText: Joi.string().max(500).optional().allow('', null),
                notes: Joi.string().max(1000).optional().allow('', null),
                fileUploadId: Joi.string().uuid().optional().allow(null),
                areaId: Joi.string().optional().allow('', null)
            }).optional().default({})
        })
    ).required().messages({
        'array.min': 'Debe incluir al menos un producto en la cotización',
        'any.required': 'Los items de la cotización son requeridos'
    })
})
// ✅ VALIDACIÓN CONDICIONAL CORREGIDA - usa el contexto
.when(Joi.ref('$user'), {
    is: Joi.exist(),
    then: Joi.object(), // Si hay usuario, todos los campos son opcionales
    otherwise: Joi.object({ // Si no hay usuario, validar campos requeridos
        companyName: Joi.string().min(2).max(255).required().messages({
            'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
            'string.max': 'El nombre de la empresa no puede exceder 255 caracteres',
            'any.required': 'El nombre de la empresa es requerido para cotizaciones anónimas'
        }),
        contactName: Joi.string().min(2).max(255).required().messages({
            'string.min': 'El nombre de contacto debe tener al menos 2 caracteres',
            'any.required': 'El nombre de contacto es requerido para cotizaciones anónimas'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Debe proporcionar un email válido',
            'any.required': 'El email es requerido para cotizaciones anónimas'
        }),
        phone: Joi.string().min(8).max(50).required().messages({
            'string.min': 'El teléfono debe tener al menos 8 caracteres',
            'any.required': 'El teléfono es requerido para cotizaciones anónimas'
        })
    })
}),

    // File upload validation
    fileMetadata: Joi.object({
        alt: Joi.string().max(255).optional(),
        description: Joi.string().max(1000).optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
        isPublic: Joi.boolean().optional().default(false)
    }),

    // General pagination
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    }),

    // ID parameter validation
    uuidParam: Joi.object({
        id: Joi.string().uuid().required().messages({
            'string.uuid': 'Debe proporcionar un ID válido',
            'any.required': 'El ID es requerido'
        })
    }),

    integerParam: Joi.object({
        id: Joi.number().integer().positive().required().messages({
            'number.base': 'El ID debe ser un número',
            'number.integer': 'El ID debe ser un número entero',
            'number.positive': 'El ID debe ser positivo',
            'any.required': 'El ID es requerido'
        })
    }),

    // Quote status update
    quoteStatusUpdate: Joi.object({
        status: Joi.string().valid('pending', 'reviewed', 'accepted', 'rejected', 'closed').required(),
        comments: Joi.string().max(1000).optional().allow('', null)
    }),

    // Quote extension
    quoteExtension: Joi.object({
        days: Joi.number().integer().min(1).max(90).default(30)
    })
};

// Validation middleware factory - VERSIÓN MEJORADA
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        let dataToValidate;
        
        switch (source) {
            case 'body':
                dataToValidate = req.body;
                break;
            case 'query':
                dataToValidate = req.query;
                break;
            case 'params':
                dataToValidate = req.params;
                break;
            case 'headers':
                dataToValidate = req.headers;
                break;
            default:
                dataToValidate = req.body;
        }

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
            convert: true, // Convert strings to numbers, etc.
            // ✅ NUEVO: Contexto para Joi con información del usuario
            context: {
                user: req.user,        // Usuario autenticado
                params: req.params,    // Parámetros de URL
                query: req.query,      // Query string
                method: req.method,    // Método HTTP
                path: req.path         // Ruta
            }
        });

        if (error) {
            const errorDetails = error.details.map(detail => {
                // Manejar errores custom
                if (detail.type === 'any.custom') {
                    return {
                        field: 'general',
                        message: detail.message,
                        value: null
                    };
                }
                
                return {
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context.value
                };
            });

            return res.status(400).json({
                error: 'Error de validación',
                message: 'Los datos proporcionados no son válidos',
                details: errorDetails
            });
        }

        // Replace the original data with validated and sanitized data
        switch (source) {
            case 'body':
                req.body = value;
                break;
            case 'query':
                req.query = value;
                break;
            case 'params':
                req.params = value;
                break;
        }

        next();
    };
};

// Compound validation for complex scenarios
const validateCartItem = [
    validate(schemas.cartItemAdd, 'body')
];

const validateProductSearch = [
    validate(schemas.productSearch, 'query')
];

const validateUserRegistration = [
    validate(schemas.userRegistration, 'body')
];

const validateUserLogin = [
    validate(schemas.userLogin, 'body')
];

const validateQuoteCreation = [
    validate(schemas.quoteCreate, 'body')
];

const validateQuoteStatusUpdate = [
    validate(schemas.quoteStatusUpdate, 'body')
];

const validateQuoteExtension = [
    validate(schemas.quoteExtension, 'body')
];

const validateUuidParam = [
    validate(schemas.uuidParam, 'params')
];

const validateIntegerParam = [
    validate(schemas.integerParam, 'params')
];

// Custom validators
const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'Archivo requerido',
            message: 'Debe seleccionar un archivo para subir'
        });
    }

    // Validate file type
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/svg+xml',
        'application/pdf'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            error: 'Tipo de archivo no válido',
            message: 'Solo se permiten archivos JPG, PNG, SVG y PDF',
            allowedTypes: allowedMimeTypes
        });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
        return res.status(400).json({
            error: 'Archivo demasiado grande',
            message: 'El archivo no puede ser mayor a 5MB',
            maxSize: '5MB',
            receivedSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
        });
    }

    next();
};

// Sanitization helpers
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim();
    }
    return input;
};

const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeInput(obj[key]);
        }
    }
    return sanitized;
};

module.exports = {
    schemas,
    validate,
    validateCartItem,
    validateProductSearch,
    validateUserRegistration,
    validateUserLogin,
    validateQuoteCreation,
    validateQuoteStatusUpdate,
    validateQuoteExtension,
    validateUuidParam,
    validateIntegerParam,
    validateFileUpload,
    sanitizeInput,
    sanitizeObject
};