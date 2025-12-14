const { Pool } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');

// Disable Node's native certificate verification for this script
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testDirectConnection() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres.uuvbshfdxfpnnsbsuaiv:Pawrex000%24@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
    ssl: {
      rejectUnauthorized: false, // Only for testing!
      sslmode: 'require'
    },
    connectionTimeoutMillis: 5000, // 5 second timeout
    idleTimeoutMillis: 30000,
    max: 5
  });

  try {
    console.log('🔍 Testing direct database connection...');
    const client = await pool.connect();
    
    // Test connection
    const res = await client.query('SELECT 1 as test');
    console.log('✅ Connection test successful:', res.rows[0]);
    
    // Test users table
    const users = await client.query('SELECT id, email FROM users LIMIT 1');
    console.log('✅ Users table query successful. First user:', users.rows[0]?.email || 'No users found');
    
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error);
  } finally {
    await pool.end();
  }
}

testDirectConnection();
