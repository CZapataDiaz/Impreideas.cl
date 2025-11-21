module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del producto es requerido'
        },
        len: {
          args: [2, 255],
          msg: 'El nombre debe tener entre 2 y 255 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La descripción del producto es requerida'
        },
        len: {
          args: [10, 1000],
          msg: 'La descripción debe tener entre 10 y 1000 caracteres'
        }
      }
    },
    // Pricing
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_price',
      validate: {
        min: {
          args: [0],
          msg: 'El precio base debe ser mayor o igual a 0'
        },
        isDecimal: {
          msg: 'El precio base debe ser un número decimal válido'
        }
      }
    },
    minOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'minimum_order',
      validate: {
        min: {
          args: [1],
          msg: 'El pedido mínimo debe ser al menos 1'
        },
        isInt: {
          msg: 'El pedido mínimo debe ser un número entero'
        }
      }
    },
    // Product details
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Relación con categoría
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    // Estado
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured'
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['base_price']
      },
      {
        fields: ['minimum_order']
      }
    ]
  });

  // Class methods
  Product.searchProducts = function(searchTerm, options = {}) {
    const { Op } = require('sequelize');
    const where = {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.minPrice !== undefined) {
      where.basePrice = { ...where.basePrice, [Op.gte]: options.minPrice };
    }

    if (options.maxPrice !== undefined) {
      where.basePrice = { ...where.basePrice, [Op.lte]: options.maxPrice };
    }

    return this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Category,
          as: 'Category',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['name', 'ASC']],
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  };

  Product.getByCategory = function(categoryId, options = {}) {
    return this.findAll({
      where: {
        categoryId,
        isActive: true,
        ...(options.stockAvailable && { stockAvailable: true })
      },
      include: [
        {
          model: sequelize.models.Category,
          as: 'Category',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: options.orderBy ? [[options.orderBy, options.orderDirection || 'ASC']] : [['name', 'ASC']],
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  };

  Product.getFeatured = function(limit = 6) {
    return this.findAll({
      where: {
        isActive: true,
        stockAvailable: true
      },
      include: [
        {
          model: sequelize.models.Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  };

  // Instance methods
  Product.prototype.calculatePriceWithPersonalization = function(personalizationOptions = {}) {
    let totalPrice = parseFloat(this.basePrice);

    // Add personalization area costs
    if (personalizationOptions.areaId && this.personalizationAreas) {
      const area = this.personalizationAreas.find(a => a.id === personalizationOptions.areaId);
      if (area && area.price) {
        totalPrice += parseFloat(area.price);
      }
    }

    // Add size costs (this would be from PersonalizationOption model in real implementation)
    if (personalizationOptions.sizePrice) {
      totalPrice += parseFloat(personalizationOptions.sizePrice);
    }

    return totalPrice;
  };

  Product.prototype.isValidQuantity = function(quantity) {
    return quantity >= this.minOrder;
  };

  // Associations
  Product.associate = function(models) {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'Category'
    });

    Product.hasMany(models.CartItem, {
      foreignKey: 'productId',
      as: 'cartItems'
    });

    Product.hasMany(models.QuoteItem, {
      foreignKey: 'productId',
      as: 'quoteItems'
    });
  };

  return Product;
};