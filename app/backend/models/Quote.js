const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Quote = sequelize.define('Quote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true
    },
    quoteNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'quote_number',
      validate: {
        notEmpty: {
          msg: 'El número de cotización es requerido'
        },
        len: {
          args: [5, 50],
          msg: 'El número de cotización debe tener entre 5 y 50 caracteres'
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
    },
    // Información de contacto
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
      validate: {
        notEmpty: {
          msg: 'El nombre de la empresa es requerido'
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
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Debe proporcionar un email válido'
        },
        notEmpty: {
          msg: 'El email es requerido'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El teléfono es requerido'
        }
      }
    },
    rut: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Estado y montos
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'approved', 'rejected', 'completed']],
          msg: 'El estado debe ser: pending, approved, rejected o completed'
        }
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'El subtotal no puede ser negativo'
        }
      }
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'tax_amount',
      validate: {
        min: {
          args: [0],
          msg: 'El monto de impuestos no puede ser negativo'
        }
      }
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'El total no puede ser negativo'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_notes'
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'quotes',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['quote_number']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['email']
      }
    ]
  });

  // Asociaciones
  Quote.associate = function(models) {
    Quote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Quote.hasMany(models.QuoteItem, {
      foreignKey: 'quoteId',
      as: 'items'
    });
  };

  // Métodos de instancia
  Quote.prototype.calculateTotals = async function() {
    const items = await this.getItems();
    
    // Calcular subtotal
    this.subtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);
    
    // Calcular impuestos (19% IVA en Chile)
    this.taxAmount = this.subtotal * 0.19;
    
    // Calcular total
    this.total = this.subtotal + this.taxAmount;
    
    return this.save();
  };

  Quote.prototype.canBeModified = function() {
    return this.status === 'pending';
  };

  Quote.prototype.approve = function(adminNotes = null) {
    if (!this.canBeModified()) {
      throw new Error('Solo las cotizaciones pendientes pueden ser aprobadas');
    }
    this.status = 'approved';
    if (adminNotes) {
      this.adminNotes = adminNotes;
    }
    return this.save();
  };

  Quote.prototype.reject = function(adminNotes = null) {
    if (!this.canBeModified()) {
      throw new Error('Solo las cotizaciones pendientes pueden ser rechazadas');
    }
    this.status = 'rejected';
    if (adminNotes) {
      this.adminNotes = adminNotes;
    }
    return this.save();
  };

  // Métodos de clase
  Quote.generateQuoteNumber = function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `Q${year}${month}${random}`;
  };

  Quote.findByNumber = function(quoteNumber) {
    return this.findOne({
      where: { quoteNumber },
      include: [
        {
          association: 'items',
          include: ['product']
        },
        {
          association: 'user'
        }
      ]
    });
  };

  Quote.findByUserId = function(userId, status = null) {
    const where = { userId };
    if (status) {
      where.status = status;
    }
    return this.findAll({
      where,
      include: [{
        association: 'items',
        include: ['product']
      }],
      order: [['createdAt', 'DESC']]
    });
  };

  return Quote;
};