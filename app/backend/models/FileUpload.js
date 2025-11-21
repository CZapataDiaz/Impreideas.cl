const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const FileUpload = sequelize.define('FileUpload', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true
    },
    filename: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del archivo es requerido'
        }
      }
    },
    originalName: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'original_name',
      validate: {
        notEmpty: {
          msg: 'El nombre original del archivo es requerido'
        }
      }
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El tipo MIME es requerido'
        }
      }
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El tamaño del archivo debe ser positivo'
        }
      }
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La ruta del archivo es requerida'
        }
      }
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileType: {
      type: DataTypes.ENUM('logo', 'design', 'document', 'other'),
      defaultValue: 'logo',
      field: 'file_type',
      validate: {
        isIn: {
          args: [['logo', 'design', 'document', 'other']],
          msg: 'El tipo de archivo debe ser: logo, design, document u other'
        }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'file_uploads',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['file_type']
      }
    ]
  });

  // Asociaciones
  FileUpload.associate = function(models) {
    FileUpload.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  // Métodos de instancia
  FileUpload.prototype.getFormattedSize = function() {
    const bytes = this.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  FileUpload.prototype.isImage = function() {
    return this.mimetype.startsWith('image/');
  };

  FileUpload.prototype.isPDF = function() {
    return this.mimetype === 'application/pdf';
  };

  // Métodos de clase
  FileUpload.findByUserId = function(userId, fileType = null) {
    const where = { userId };
    if (fileType) {
      where.fileType = fileType;
    }
    return this.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  };

  return FileUpload;
};