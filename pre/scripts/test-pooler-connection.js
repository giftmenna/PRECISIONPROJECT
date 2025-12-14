const { Pool } = require('pg');

async function testConnection() {
  // Use the connection pooler port 6543 instead of 5432
  const pool = new Pool({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres',  // Default user for connection pooler
    password: process.env.DB_PASSWORD,  // This should be your database password
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false  // For testing only
    },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 1000,
    max: 1
  });

  try {
    console.log('Testing connection to Supabase connection pooler...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Test query result:', result.rows[0]);
    
    // Get database version
    const version = await client.query('SELECT version()');
    console.log('✅ Database version:', version.rows[0].version.split(' ')[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error);
    return false;
  } finally {
    await pool.end();
  }
}

testConnection();
