const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, generateRefreshToken, invalidateToken } = require('../middleware/auth');

/**
 * Controlador de autenticación para ImpreIdeas
 * Maneja registro, login, logout y gestión de usuarios
 */
class AuthController {
    /**
     * Registrar nuevo usuario/empresa
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const {
                email,
                password,
                companyName,
                contactName,
                phone,
                rut,
                address,
                city
            } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Usuario ya existe',
                    message: 'Ya existe una cuenta registrada con este email'
                });
            }

            // Hashear la contraseña
            const hashedPassword = await User.hashPassword(password);

            // Crear nuevo usuario
            const user = await User.create({
                email: email.toLowerCase(),
                hashedPassword,
                companyName,
                contactName,
                phone: phone || null,
                rut: rut || null,
                address: address || null,
                city: city || null
            });

            // Generar token de acceso
            const token = generateToken(user);

            // Actualizar último login
            await user.updateLastLogin();

            // Respuesta exitosa (sin contraseña)
            const userResponse = user.toJSON();
            
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userResponse,
                token: {
                    access_token: token,
                    token_type: 'Bearer',
                    expires_in: process.env.JWT_EXPIRES_IN || '24h'
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            
            // Manejar errores de validación de Sequelize
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }));
                
                return res.status(400).json({
                    error: 'Error de validación',
                    message: 'Los datos proporcionados no son válidos',
                    details: validationErrors
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'Ocurrió un error al registrar el usuario'
            });
        }
    }

    /**
     * Iniciar sesión de usuario
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuario por email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    message: 'Email o contraseña incorrectos'
                });
            }

            // Verificar si la cuenta está activa
            if (!user.isActive) {
                return res.status(401).json({
                    error: 'Cuenta desactivada',
                    message: 'Tu cuenta ha sido desactivada. Contacta al soporte.'
                });
            }

            // Verificar contraseña
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    message: 'Email o contraseña incorrectos'
                });
            }

            // Generar tokens
            const accessToken = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Actualizar último login
            await user.updateLastLogin();

            // Respuesta exitosa
            const userResponse = user.toJSON();
            
            res.json({
                message: 'Inicio de sesión exitoso',
                user: userResponse,
                token: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_type: 'Bearer',
                    expires_in: process.env.JWT_EXPIRES_IN || '24h'
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'Ocurrió un error al iniciar sesión'
            });
        }
    }

    /**
     * Obtener perfil del usuario actual
     * GET /api/auth/me
     */
    async getProfile(req, res) {
        try {
            // El usuario ya está disponible gracias al middleware de autenticación
            const user = req.user;

            // Obtener datos frescos del usuario
            const freshUser = await User.findByPk(user.id, {
                attributes: { exclude: ['hashedPassword'] }
            });

            if (!freshUser) {
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    message: 'El usuario ya no existe en el sistema'
                });
            }

            res.json({
                message: 'Perfil obtenido exitosamente',
                user: freshUser
            });

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo obtener el perfil del usuario'
            });
        }
    }

    /**
     * Actualizar perfil del usuario
     * PUT /api/auth/me
     */
    async updateProfile(req, res) {
        try {
            const user = req.user;
            const {
                companyName,
                contactName,
                phone,
                rut,
                address,
                city
            } = req.body;

            // Actualizar solo los campos proporcionados
            const updateData = {};
            if (companyName !== undefined) updateData.companyName = companyName;
            if (contactName !== undefined) updateData.contactName = contactName;
            if (phone !== undefined) updateData.phone = phone;
            if (rut !== undefined) updateData.rut = rut;
            if (address !== undefined) updateData.address = address;
            if (city !== undefined) updateData.city = city;

            // Actualizar usuario en la base de datos
            await User.update(updateData, {
                where: { id: user.id }
            });

            // Obtener usuario actualizado
            const updatedUser = await User.findByPk(user.id, {
                attributes: { exclude: ['hashedPassword'] }
            });

            res.json({
                message: 'Perfil actualizado exitosamente',
                user: updatedUser
            });

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }));
                
                return res.status(400).json({
                    error: 'Error de validación',
                    message: 'Los datos proporcionados no son válidos',
                    details: validationErrors
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo actualizar el perfil'
            });
        }
    }

    /**
     * Cambiar contraseña del usuario
     * PUT /api/auth/change-password
     */
    async changePassword(req, res) {
        try {
            const user = req.user;
            const { currentPassword, newPassword } = req.body;

            // Validar contraseña actual
            const isValidCurrentPassword = await user.validatePassword(currentPassword);
            if (!isValidCurrentPassword) {
                return res.status(400).json({
                    error: 'Contraseña incorrecta',
                    message: 'La contraseña actual no es correcta'
                });
            }

            // Validar nueva contraseña
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'Contraseña débil',
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }

            // Hashear nueva contraseña
            const hashedNewPassword = await User.hashPassword(newPassword);

            // Actualizar contraseña
            await User.update(
                { hashedPassword: hashedNewPassword },
                { where: { id: user.id } }
            );

            res.json({
                message: 'Contraseña cambiada exitosamente'
            });

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo cambiar la contraseña'
            });
        }
    }

    /**
     * Cerrar sesión (invalidar token)
     * POST /api/auth/logout
     */
    async logout(req, res) {
        try {
            const token = req.token;

            // Invalidar token (agregar a blacklist)
            if (token) {
                invalidateToken(token);
            }

            res.json({
                message: 'Sesión cerrada exitosamente'
            });

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'Ocurrió un error al cerrar la sesión'
            });
        }
    }

    /**
     * Renovar token de acceso
     * POST /api/auth/refresh
     */
    async refreshToken(req, res) {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return res.status(400).json({
                    error: 'Token de actualización requerido',
                    message: 'Debe proporcionar un refresh token válido'
                });
            }

            // Verificar refresh token
            const { verifyRefreshToken } = require('../middleware/auth');
            const decoded = verifyRefreshToken(refresh_token);

            // Buscar usuario
            const user = await User.findByPk(decoded.userId, {
                attributes: { exclude: ['hashedPassword'] }
            });

            if (!user || !user.isActive) {
                return res.status(401).json({
                    error: 'Usuario no válido',
                    message: 'El usuario no existe o está desactivado'
                });
            }

            // Generar nuevo token de acceso
            const newAccessToken = generateToken(user);

            res.json({
                message: 'Token renovado exitosamente',
                token: {
                    access_token: newAccessToken,
                    token_type: 'Bearer',
                    expires_in: process.env.JWT_EXPIRES_IN || '24h'
                }
            });

        } catch (error) {
            console.error('Error al renovar token:', error);
            
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Token inválido',
                    message: 'El refresh token no es válido o ha expirado'
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo renovar el token'
            });
        }
    }

    /**
     * Obtener estadísticas del usuario (dashboard)
     * GET /api/auth/stats
     */
    async getUserStats(req, res) {
        try {
            const userId = req.user.id;

            // Obtener estadísticas básicas del usuario
            const { Quote, Cart } = require('../models');

            const [totalQuotes, activeCart] = await Promise.all([
                Quote.count({ where: { userId } }),
                Cart.findOne({ 
                    where: { userId, isActive: true },
                    include: ['items']
                })
            ]);

            const stats = {
                totalQuotes,
                activeCartItems: activeCart ? activeCart.getItemCount() : 0,
                memberSince: req.user.createdAt,
                lastLogin: req.user.lastLogin,
                profileComplete: this.calculateProfileCompleteness(req.user)
            };

            res.json({
                message: 'Estadísticas obtenidas exitosamente',
                stats
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las estadísticas'
            });
        }
    }

    /**
     * Calcular completitud del perfil
     * @private
     */
    calculateProfileCompleteness(user) {
        const fields = ['companyName', 'contactName', 'phone', 'rut', 'address', 'city'];
        const completedFields = fields.filter(field => user[field] && user[field].trim() !== '');
        return Math.round((completedFields.length / fields.length) * 100);
    }
}

module.exports = new AuthController();