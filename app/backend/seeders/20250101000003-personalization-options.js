'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const personalizationOptions = [
      {
        type: 'logo_size',
        name: 'Pequeño',
        value: 'small',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_size',
        name: 'Mediano',
        value: 'medium',
        price_modifier: 300,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_size',
        name: 'Grande',
        value: 'large',
        price_modifier: 600,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_size',
        name: 'Extra Grande',
        value: 'xlarge',
        price_modifier: 900,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_area',
        name: 'Centrado',
        value: 'center',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_area',
        name: 'Esquina Superior Izquierda',
        value: 'top-left',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_area',
        name: 'Esquina Superior Derecha',
        value: 'top-right',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'logo_area',
        name: 'Parte Inferior',
        value: 'bottom',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'print_method',
        name: 'Serigrafía',
        value: 'screen_printing',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'print_method',
        name: 'Bordado',
        value: 'embroidery',
        price_modifier: 800,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'print_method',
        name: 'Grabado Láser',
        value: 'laser_engraving',
        price_modifier: 500,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'print_method',
        name: 'Impresión Digital',
        value: 'digital_print',
        price_modifier: 400,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'print_method',
        name: 'Transfer',
        value: 'transfer',
        price_modifier: 300,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'color',
        name: 'Azul Celeste',
        value: 'celeste',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'color',
        name: 'Blanco',
        value: 'white',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'color',
        name: 'Negro',
        value: 'black',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'color',
        name: 'Rojo',
        value: 'red',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'color',
        name: 'Azul Marino',
        value: 'navy',
        price_modifier: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('personalization_options', personalizationOptions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('personalization_options', null, {});
  }
};