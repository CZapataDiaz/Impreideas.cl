const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carts',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    personalization: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'cart_items',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['cartId']
      },
      {
        fields: ['productId']
      }
    ]
  });

  // Asociaciones
  CartItem.associate = function(models) {
    CartItem.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart'
    });
    
    CartItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  // Métodos de instancia
  CartItem.prototype.getSubtotal = function() {
    return parseFloat(this.unitPrice) * this.quantity;
  };

  CartItem.prototype.updateQuantity = async function(newQuantity) {
    if (newQuantity < 1) {
      throw new Error('La cantidad debe ser al menos 1');
    }
    this.quantity = newQuantity;
    return this.save();
  };

  return CartItem;
};