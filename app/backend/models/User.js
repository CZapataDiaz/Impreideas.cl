const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Debe proporcionar un email válido'
        },
        notEmpty: {
          msg: 'El email es requerido'
        }
      }
    },
    hashedPassword: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'hashed_password'
    },
    // Información de la empresa
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
      validate: {
        notEmpty: {
          msg: 'El nombre de la empresa es requerido'
        },
        len: {
          args: [2, 255],
          msg: 'El nombre de la empresa debe tener entre 2 y 255 caracteres'
        }
      }
    },
    contactName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'contact_name',
      validate: {
        notEmpty: {
          msg: 'El nombre de contacto es requerido'
        },
        len: {
          args: [2, 255],
          msg: 'El nombre de contacto debe tener entre 2 y 255 caracteres'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El teléfono no puede exceder 50 caracteres'
        }
      }
    },
    rut: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El RUT no puede exceder 50 caracteres'
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'La ciudad no puede exceder 100 caracteres'
        }
      }
    },
    // Estado de la cuenta
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['company_name']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  // Métodos de instancia
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.hashedPassword;
    return values;
  };

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.hashedPassword);
  };

  User.prototype.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
  };

  // Métodos de clase
  User.hashPassword = async function(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  };

  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  // Asociaciones
  User.associate = function(models) {
    User.hasMany(models.Cart, {
      foreignKey: 'userId',
      as: 'carts'
    });
    
    User.hasMany(models.Quote, {
      foreignKey: 'userId',
      as: 'quotes'
    });
    
    User.hasMany(models.FileUpload, {
      foreignKey: 'userId',
      as: 'uploads'
    });
  };

  // Hooks
  User.beforeCreate(async (user) => {
    if (user.email) {
      user.email = user.email.toLowerCase();
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('email')) {
      user.email = user.email.toLowerCase();
    }
  });

  return User;
};