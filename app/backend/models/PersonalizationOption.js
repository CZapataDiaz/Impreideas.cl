module.exports = (sequelize, DataTypes) => {
  const PersonalizationOption = sequelize.define('PersonalizationOption', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('logo_size', 'logo_area', 'print_method', 'color', 'other'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El tipo de opción es requerido'
        },
        isIn: {
          args: [['logo_size', 'logo_area', 'print_method', 'color', 'other']],
          msg: 'El tipo debe ser: logo_size, logo_area, print_method, color u other'
        }
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la opción es requerido'
        },
        len: {
          args: [2, 255],
          msg: 'El nombre debe tener entre 2 y 255 caracteres'
        }
      }
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El valor de la opción es requerido'
        }
      }
    },
    priceModifier: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'price_modifier',
      validate: {
        min: {
          args: [0],
          msg: 'El modificador de precio no puede ser negativo'
        },
        isDecimal: {
          msg: 'El modificador de precio debe ser un número decimal válido'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
    // Timestamps automáticos manejados por Sequelize
  }, {
    tableName: 'personalization_options',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  // Métodos de clase
  PersonalizationOption.getByType = function(type) {
    return this.findAll({
      where: { 
        type: type,
        isActive: true 
      },
      order: [['name', 'ASC']]
    });
  };

  PersonalizationOption.getAllActive = function() {
    return this.findAll({
      where: { isActive: true },
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
  };

  PersonalizationOption.getGroupedByType = async function() {
    const options = await this.getAllActive();
    const grouped = {};
    
    options.forEach(option => {
      if (!grouped[option.type]) {
        grouped[option.type] = [];
      }
      grouped[option.type].push(option);
    });
    
    return grouped;
  };

  return PersonalizationOption;
};