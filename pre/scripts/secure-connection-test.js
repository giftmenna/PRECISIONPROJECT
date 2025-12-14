const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
try {
  require('dotenv').config();
} catch (e) {
  console.log('No .env file found, using environment variables');
}

async function testConnection() {
  const pool = new Pool({
    user: 'postgres.uuvbshfdxfpnnsbsuaiv',
    host: 'aws-1-us-east-1.pooler.supabase.com',
    database: 'postgres',
    password: 'Pawrex000$',
    port: 5432,
    ssl: {
      rejectUnauthorized: false  // Only for testing with self-signed certificates
    },
    connectionTimeoutMillis: 10000
  });

  try {
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    
    // Test basic query
    const dbInfo = await client.query('SELECT current_database() as db, current_user as user');
    console.log('✅ Database connection successful!');
    console.log('   Database:', dbInfo.rows[0].db);
    console.log('   User:', dbInfo.rows[0].user);
    
    // Test if we can query the users table
    try {
      const users = await client.query('SELECT COUNT(*) as user_count FROM "User"');
      console.log(`✅ Successfully queried users table (${users.rows[0].user_count} users)`);
    } catch (e) {
      console.log('ℹ️ Could not query users table (this might be expected):', e.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if the database server is running');
      console.log('2. Verify the host and port are correct');
      console.log('3. Check your network connection');
    } else if (error.code === '28P01') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your username and password');
      console.log('2. Verify the user has proper permissions');
    }
    
    return false;
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log(success ? '\n🎉 All tests completed successfully!' : '\n❌ Some tests failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
