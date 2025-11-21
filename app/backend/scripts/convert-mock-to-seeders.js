/**
 * Script para transformar datos mock del frontend a seeders de base de datos
 * Convierte mockProducts a formato compatible con Sequelize
 */

const fs = require('fs');
const path = require('path');

// Leer el archivo mock.js del frontend
const mockFilePath = path.join(__dirname, '../../frontend/src/data/mock.js');
let mockContent;

try {
  mockContent = fs.readFileSync(mockFilePath, 'utf8');
  console.log('✅ Archivo mock.js leído correctamente');
} catch (error) {
  console.error('❌ Error al leer mock.js:', error.message);
  process.exit(1);
}

// Extraer mockProducts del contenido
// Convertir export const a module.exports temporalmente para evaluar
const evalContent = mockContent
  .replace(/export const /g, 'const ')
  .replace(/export default /g, '');

// Evaluar el contenido para obtener los datos
let mockProducts = [];
let mockCategories = [];

try {
  eval(evalContent);
  console.log(`✅ ${mockProducts.length} productos encontrados`);
  console.log(`✅ ${mockCategories.length} categorías encontradas`);
} catch (error) {
  console.error('❌ Error al evaluar mock.js:', error.message);
  process.exit(1);
}

// Extraer categorías únicas de los productos
const categoriesSet = new Set();
const categoryMap = {};
let categoryIdCounter = 1;

mockProducts.forEach(product => {
  if (product.category && !categoriesSet.has(product.category)) {
    categoriesSet.add(product.category);
    categoryMap[product.category] = categoryIdCounter++;
  }
});

console.log(`\n📂 Categorías encontradas: ${categoriesSet.size}`);
console.log(Array.from(categoriesSet).join(', '));

// Generar seeder de categorías
const categoriesSeederContent = `'use strict';

/**
 * Seeder de categorías generado automáticamente desde mock data
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
${Array.from(categoriesSet).map(catName => {
  const catId = categoryMap[catName];
  return `      {
        id: ${catId},
        name: '${catName}',
        description: 'Categoría de ${catName.toLowerCase()}',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }`;
}).join(',\n')}
    ];

    await queryInterface.bulkInsert('categories', categories, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
`;

// Generar seeder de productos
const productsSeederContent = `'use strict';

/**
 * Seeder de productos generado automáticamente desde mock data
 * Total: ${mockProducts.length} productos
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const products = [
${mockProducts.map(product => {
  const categoryId = categoryMap[product.category];
  const basePrice = product.basePrice || 2500; // Precio por defecto si es 0
  const minOrder = product.minOrder || 1;
  
  return `      {
        name: '${product.name.replace(/'/g, "''")}',
        description: '${product.description.replace(/'/g, "''")}',
        base_price: ${basePrice},
        image: '${product.image}',
        minimum_order: ${minOrder},
        is_active: true,
        is_featured: ${product.id <= 6 ? 'true' : 'false'},
        categoryId: ${categoryId},
        createdAt: new Date(),
        updatedAt: new Date()
      }`;
}).join(',\n')}
    ];

    await queryInterface.bulkInsert('products', products, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
  }
};
`;

// Guardar seeders
const seedersDir = path.join(__dirname, '../seeders');

// Crear directorio si no existe
if (!fs.existsSync(seedersDir)) {
  fs.mkdirSync(seedersDir, { recursive: true });
}

// Guardar seeder de categorías
const categoriesSeederPath = path.join(seedersDir, '20250102000001-categories-from-mock.js');
fs.writeFileSync(categoriesSeederPath, categoriesSeederContent);
console.log(`\n✅ Seeder de categorías guardado: ${categoriesSeederPath}`);

// Guardar seeder de productos
const productsSeederPath = path.join(seedersDir, '20250102000002-products-from-mock.js');
fs.writeFileSync(productsSeederPath, productsSeederContent);
console.log(`✅ Seeder de productos guardado: ${productsSeederPath}`);

// Generar resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE CONVERSIÓN');
console.log('='.repeat(60));
console.log(`✅ Categorías: ${categoriesSet.size}`);
console.log(`✅ Productos: ${mockProducts.length}`);
console.log('\n📁 Archivos generados:');
console.log(`   1. ${path.basename(categoriesSeederPath)}`);
console.log(`   2. ${path.basename(productsSeederPath)}`);
console.log('\n🚀 Próximos pasos:');
console.log('   1. Revisar los seeders generados en /seeders/');
console.log('   2. Ejecutar migraciones: npx sequelize-cli db:migrate');
console.log('   3. Ejecutar seeders: npx sequelize-cli db:seed:all');
console.log('='.repeat(60) + '\n');
