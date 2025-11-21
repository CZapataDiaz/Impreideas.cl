const path = require('path');
const fs = require('fs').promises;
const { FileUpload } = require('../models');

/**
 * Controlador de archivos para ImpreIdeas
 * Maneja subida, gestión y eliminación de archivos (logos, documentos)
 */
class UploadController {
    /**
     * Subir archivo (logo para personalización)
     * POST /api/upload
     */
    async uploadFile(req, res) {
        try {
            const file = req.file;
            const user = req.user; // Puede ser null para uploads anónimos
            const metadata = req.body;

            if (!file) {
                return res.status(400).json({
                    error: 'Archivo requerido',
                    message: 'Debe seleccionar un archivo para subir'
                });
            }

            // Crear registro en base de datos
            const fileUpload = await FileUpload.create({
                filename: file.filename,
                originalFilename: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
                userId: user?.id || null,
                alt: metadata.alt || null,
                description: metadata.description || null,
                tags: metadata.tags ? JSON.parse(metadata.tags) : [],
                isPublic: metadata.isPublic === 'true' || false
            });

            res.status(201).json({
                message: 'Archivo subido exitosamente',
                file: fileUpload.getFileInfo(),
                upload: {
                    success: true,
                    id: fileUpload.id,
                    filename: fileUpload.filename,
                    originalName: fileUpload.originalFilename,
                    size: fileUpload.fileSize,
                    formattedSize: fileUpload.getFormattedFileSize(),
                    type: fileUpload.mimeType,
                    isImage: fileUpload.isImage(),
                    isPdf: fileUpload.isPdf(),
                    publicUrl: fileUpload.getPublicUrl(),
                    uploadedAt: fileUpload.createdAt
                }
            });

        } catch (error) {
            console.error('Error al subir archivo:', error);
            
            // Limpiar archivo si hay error en BD
            if (req.file && req.file.path) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error al eliminar archivo temporal:', unlinkError);
                }
            }

            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }));
                
                return res.status(400).json({
                    error: 'Error de validación',
                    message: 'Los datos del archivo no son válidos',
                    details: validationErrors
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo subir el archivo'
            });
        }
    }

    /**
     * Subir múltiples archivos
     * POST /api/upload/multiple
     */
    async uploadMultipleFiles(req, res) {
        try {
            const files = req.files;
            const user = req.user;
            const metadata = req.body;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    error: 'Archivos requeridos',
                    message: 'Debe seleccionar al menos un archivo para subir'
                });
            }

            const uploadedFiles = [];
            const errors = [];

            // Procesar cada archivo
            for (const file of files) {
                try {
                    const fileUpload = await FileUpload.create({
                        filename: file.filename,
                        originalFilename: file.originalname,
                        filePath: file.path,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                        userId: user?.id || null,
                        isPublic: metadata.isPublic === 'true' || false
                    });

                    uploadedFiles.push(fileUpload.getFileInfo());

                } catch (error) {
                    console.error(`Error al procesar archivo ${file.originalname}:`, error);
                    errors.push({
                        filename: file.originalname,
                        error: error.message
                    });

                    // Limpiar archivo con error
                    try {
                        await fs.unlink(file.path);
                    } catch (unlinkError) {
                        console.error('Error al eliminar archivo con error:', unlinkError);
                    }
                }
            }

            const response = {
                message: `${uploadedFiles.length} archivos subidos exitosamente`,
                uploadedFiles,
                totalUploaded: uploadedFiles.length,
                totalRequested: files.length
            };

            if (errors.length > 0) {
                response.errors = errors;
                response.message += `, ${errors.length} archivos fallaron`;
            }

            res.status(uploadedFiles.length > 0 ? 201 : 400).json(response);

        } catch (error) {
            console.error('Error en subida múltiple:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron subir los archivos'
            });
        }
    }

    /**
     * Obtener archivos del usuario autenticado
     * GET /api/upload/my-files
     */
    async getUserFiles(req, res) {
        try {
            const user = req.user;
            const { type, page = 1, limit = 20 } = req.query;

            if (!user) {
                return res.status(401).json({
                    error: 'Autenticación requerida',
                    message: 'Debe estar autenticado para ver sus archivos'
                });
            }

            const options = {
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            if (type === 'images') {
                options.mimeType = { [require('sequelize').Op.like]: 'image/%' };
            } else if (type === 'pdfs') {
                options.mimeType = 'application/pdf';
            }

            const files = await FileUpload.getByUser(user.id, options);

            res.json({
                message: 'Archivos obtenidos exitosamente',
                files: files.map(file => file.getFileInfo()),
                pagination: {
                    currentPage: parseInt(page),
                    itemsPerPage: parseInt(limit),
                    totalItems: files.length
                },
                filter: {
                    type: type || 'all'
                }
            });

        } catch (error) {
            console.error('Error al obtener archivos del usuario:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los archivos'
            });
        }
    }

    /**
     * Obtener archivo específico por ID
     * GET /api/upload/:id
     */
    async getFileById(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const file = await FileUpload.findByPk(id);

            if (!file || !file.isActive) {
                return res.status(404).json({
                    error: 'Archivo no encontrado',
                    message: 'El archivo no existe o ha sido eliminado'
                });
            }

            // Verificar permisos (solo el dueño o archivos públicos)
            if (!file.isPublic && (!user || file.userId !== user.id)) {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    message: 'No tienes permisos para acceder a este archivo'
                });
            }

            res.json({
                message: 'Archivo obtenido exitosamente',
                file: file.getFileInfo()
            });

        } catch (error) {
            console.error('Error al obtener archivo:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo obtener el archivo'
            });
        }
    }

    /**
     * Actualizar metadatos de archivo
     * PUT /api/upload/:id
     */
    async updateFileMetadata(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const metadata = req.body;

            const file = await FileUpload.findByPk(id);

            if (!file || !file.isActive) {
                return res.status(404).json({
                    error: 'Archivo no encontrado',
                    message: 'El archivo no existe o ha sido eliminado'
                });
            }

            // Solo el dueño puede actualizar metadatos
            if (!user || file.userId !== user.id) {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    message: 'Solo puedes actualizar tus propios archivos'
                });
            }

            await file.updateMetadata(metadata);

            res.json({
                message: 'Metadatos actualizados exitosamente',
                file: file.getFileInfo()
            });

        } catch (error) {
            console.error('Error al actualizar metadatos:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron actualizar los metadatos'
            });
        }
    }

    /**
     * Eliminar archivo (marcar como eliminado)
     * DELETE /api/upload/:id
     */
    async deleteFile(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const file = await FileUpload.findByPk(id);

            if (!file || !file.isActive) {
                return res.status(404).json({
                    error: 'Archivo no encontrado',
                    message: 'El archivo no existe o ya ha sido eliminado'
                });
            }

            // Solo el dueño puede eliminar
            if (!user || file.userId !== user.id) {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    message: 'Solo puedes eliminar tus propios archivos'
                });
            }

            // Marcar como eliminado (soft delete)
            await file.markAsDeleted();

            // Opcionalmente, eliminar archivo físico
            const deletePhysical = req.query.permanent === 'true';
            if (deletePhysical) {
                try {
                    await fs.unlink(file.filePath);
                } catch (unlinkError) {
                    console.error('Error al eliminar archivo físico:', unlinkError);
                    // No fallar la operación si no se puede eliminar el archivo físico
                }
            }

            res.json({
                message: 'Archivo eliminado exitosamente',
                deleted: {
                    id: file.id,
                    filename: file.originalFilename,
                    deletedAt: new Date(),
                    permanentDeletion: deletePhysical
                }
            });

        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo eliminar el archivo'
            });
        }
    }

    /**
     * Servir archivo estático
     * GET /api/upload/serve/:filename
     */
    async serveFile(req, res) {
        try {
            const { filename } = req.params;

            // Buscar archivo en base de datos
            const file = await FileUpload.findOne({
                where: { filename, isActive: true }
            });

            if (!file) {
                return res.status(404).json({
                    error: 'Archivo no encontrado',
                    message: 'El archivo solicitado no existe'
                });
            }

            // Verificar si es público o si el usuario tiene acceso
            if (!file.isPublic) {
                const user = req.user;
                if (!user || file.userId !== user.id) {
                    return res.status(403).json({
                        error: 'Acceso denegado',
                        message: 'No tienes permisos para acceder a este archivo'
                    });
                }
            }

            // Verificar que el archivo físico existe
            try {
                await fs.access(file.filePath);
            } catch (error) {
                return res.status(404).json({
                    error: 'Archivo físico no encontrado',
                    message: 'El archivo no está disponible en el servidor'
                });
            }

            // Establecer headers apropiados
            res.setHeader('Content-Type', file.mimeType);
            res.setHeader('Content-Length', file.fileSize);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
            
            // Para imágenes, agregar headers de optimización
            if (file.isImage()) {
                res.setHeader('Content-Disposition', `inline; filename="${file.originalFilename}"`);
            } else {
                res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename}"`);
            }

            // Enviar archivo
            res.sendFile(path.resolve(file.filePath));

        } catch (error) {
            console.error('Error al servir archivo:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo servir el archivo'
            });
        }
    }

    /**
     * Obtener estadísticas de archivos del usuario
     * GET /api/upload/stats
     */
    async getUploadStats(req, res) {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    error: 'Autenticación requerida',
                    message: 'Debe estar autenticado para ver las estadísticas'
                });
            }

            const [totalFiles, images, pdfs] = await Promise.all([
                FileUpload.count({ where: { userId: user.id, isActive: true } }),
                FileUpload.getImages(user.id),
                FileUpload.getPdfs(user.id)
            ]);

            // Calcular tamaño total
            const allFiles = await FileUpload.findAll({
                where: { userId: user.id, isActive: true },
                attributes: ['fileSize']
            });

            const totalSize = allFiles.reduce((sum, file) => sum + file.fileSize, 0);
            const maxSize = 100 * 1024 * 1024; // 100MB por usuario
            const usagePercentage = Math.round((totalSize / maxSize) * 100);

            const stats = {
                totalFiles,
                totalImages: images.length,
                totalPdfs: pdfs.length,
                totalSize,
                formattedTotalSize: this.formatFileSize(totalSize),
                maxSize,
                formattedMaxSize: this.formatFileSize(maxSize),
                usagePercentage,
                remainingSpace: maxSize - totalSize,
                formattedRemainingSpace: this.formatFileSize(Math.max(0, maxSize - totalSize))
            };

            res.json({
                message: 'Estadísticas de archivos obtenidas exitosamente',
                stats
            });

        } catch (error) {
            console.error('Error al obtener estadísticas de archivos:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las estadísticas'
            });
        }
    }

    /**
     * Formatear tamaño de archivo
     * @private
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new UploadController();