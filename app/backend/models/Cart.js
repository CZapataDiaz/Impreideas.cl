const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'session_id'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'abandoned'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'completed', 'abandoned']],
          msg: 'El estado debe ser: active, completed o abandoned'
        }
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'total_amount',
      validate: {
        min: {
          args: [0],
          msg: 'El monto total no puede ser negativo'
        }
      }
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'carts',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['session_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Asociaciones
  Cart.associate = function(models) {
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Cart.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'items'
    });
  };

  // Métodos de instancia
  Cart.prototype.calculateTotal = async function() {
    const items = await this.getItems();
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);
    
    this.totalAmount = total;
    return this.save();
  };

  Cart.prototype.isEmpty = async function() {
    const count = await this.countItems();
    return count === 0;
  };

  // Métodos de clase
  Cart.findByUserId = function(userId) {
    return this.findOne({
      where: { 
        userId: userId,
        status: 'active'
      },
      include: [{
        association: 'items',
        include: ['product']
      }]
    });
  };

  Cart.findBySessionId = function(sessionId) {
    return this.findOne({
      where: { 
        sessionId: sessionId,
        status: 'active'
      },
      include: [{
        association: 'items',
        include: ['product']
      }]
    });
  };

  return Cart;
};