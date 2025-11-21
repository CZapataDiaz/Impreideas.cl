require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'impreideas_super_secret_key_2024_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Validacion de contraseña
  passwordMinLength: 6,
  passwordRequireUppercase: false,
  passwordRequireNumbers: false,
  passwordRequireSpecialChars: false,
  
  // Limitación de velocidad para endpoints de autenticación
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per window
    skipSuccessfulRequests: true
  },
  
  // Lista negra de tokens JWT
  tokenBlacklist: new Set(),
  
  // Configuración de sesión
  session: {
    maxActiveSessions: 5,
    extendSessionOnActivity: true
  }
};