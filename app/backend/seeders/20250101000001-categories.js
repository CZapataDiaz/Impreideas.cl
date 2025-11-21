'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        id: 1,
        name: 'Tazas',
        description: 'Tazas personalizadas corporativas',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Útiles',
        description: 'Útiles de escritorio y oficina',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Papelería',
        description: 'Papelería corporativa',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Tecnología',
        description: 'Accesorios tecnológicos',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Textil',
        description: 'Productos textiles personalizados',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Bolsas',
        description: 'Bolsas y mochilas',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: 'Accesorios',
        description: 'Accesorios variados',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        name: 'Hogar',
        description: 'Productos para el hogar',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        name: 'Vinos y Parrilla',
        description: 'Sets de vinos y parrilleros',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        name: 'Packaging',
        description: 'Materiales de embalaje',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 11,
        name: 'Timbres',
        description: 'Timbres y accesorios de oficina',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', categories, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};