const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const QuoteItem = sequelize.define('QuoteItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true
    },
    quoteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'quotes',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'product_name',
      validate: {
        notEmpty: {
          msg: 'El nombre del producto es requerido'
        }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'La cantidad debe ser al menos 1'
        },
        isInt: {
          msg: 'La cantidad debe ser un número entero'
        }
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'unit_price',
      validate: {
        min: {
          args: [0],
          msg: 'El precio unitario debe ser mayor o igual a 0'
        },
        isDecimal: {
          msg: 'El precio unitario debe ser un número decimal válido'
        }
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El subtotal debe ser mayor o igual a 0'
        },
        isDecimal: {
          msg: 'El subtotal debe ser un número decimal válido'
        }
      }
    },
    personalization: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'quote_items',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['quoteId']
      },
      {
        fields: ['productId']
      }
    ]
  });

  // Asociaciones
  QuoteItem.associate = function(models) {
    QuoteItem.belongsTo(models.Quote, {
      foreignKey: 'quoteId',
      as: 'quote'
    });
    
    QuoteItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  // Métodos de instancia
  QuoteItem.prototype.calculateSubtotal = function() {
    this.subtotal = parseFloat(this.unitPrice) * this.quantity;
    return this.save();
  };

  QuoteItem.prototype.hasPersonalization = function() {
    return this.personalization !== null && Object.keys(this.personalization).length > 0;
  };

  // Hooks
  QuoteItem.beforeCreate(async (quoteItem) => {
    // Calcular subtotal automáticamente si no está establecido
    if (!quoteItem.subtotal) {
      quoteItem.subtotal = parseFloat(quoteItem.unitPrice) * quoteItem.quantity;
    }
  });

  QuoteItem.beforeUpdate(async (quoteItem) => {
    // Recalcular subtotal si cambia cantidad o precio
    if (quoteItem.changed('quantity') || quoteItem.changed('unitPrice')) {
      quoteItem.subtotal = parseFloat(quoteItem.unitPrice) * quoteItem.quantity;
    }
  });

  return QuoteItem;
};