// Cargar variables de entorno desde el archivo .env
// Esto permite usar process.env.VARIABLE en todo el proyecto
require('dotenv').config();

// Exportar configuración de base de datos para diferentes entornos
module.exports = {
  development: {
    username: process.env.DB_USER || 'impreideas',
    password: process.env.DB_PASSWORD || 'impreideas2024',
    database: process.env.DB_NAME || 'impreideas',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Mostrar logs de SQL solo en desarrollo, en producción se ocultan
    
    // Configuración del pool de conexiones (múltiples conexiones simultáneas)
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Configuración global para todas las tablas de la base de datos
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci'
      }
    }
  },
    // Configuración para entorno de PRUEBAS (testing)
  test: {
    username: process.env.DB_USER || 'impreideas',
    password: process.env.DB_PASSWORD || 'impreideas2024',
    database: process.env.DB_NAME + '_test' || 'impreideas_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false
  },
  
  // Configuración para entorno de PRODUCCIÓN 
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false, // Sin logs para mejor rendimiento y seguridad
    
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // Configuración SSL para conexiones seguras en producción
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
};