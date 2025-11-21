const { Client } = require('pg');

const client = new Client({
  user: 'Cristobal',
  host: 'localhost',
  database: 'Impreideas',
  password: 'Impreideas1234',
  port: 5432,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ CONEXIÓN EXITOSA a PostgreSQL');
    
    // Verificar versión de PostgreSQL
    const result = await client.query('SELECT version()');
    console.log('📋 Versión PostgreSQL:', result.rows[0].version);
    
    // Verificar tablas existentes
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('🗃️ Tablas existentes:', tables.rows.map(row => row.table_name));
    
    await client.end();
  } catch (error) {
    console.log('❌ ERROR de conexión:', error.message);
  }
}

testConnection();