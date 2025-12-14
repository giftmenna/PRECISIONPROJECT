const { Pool } = require('pg');

async function testCredentials(connectionString) {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false  // Only for testing
    },
    connectionTimeoutMillis: 10000
  });

  try {
    console.log('Testing database credentials...');
    const client = await pool.connect();
    const result = await client.query('SELECT current_database() as db, current_user as user');
    console.log('✅ Connection successful!');
    console.log('Database:', result.rows[0].db);
    console.log('User:', result.rows[0].user);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Get connection string from command line or use default
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ No connection string provided');
  console.log('\nUsage:');
  console.log('  node test-credentials.js "postgresql://user:password@host:port/database"');
  console.log('  or set DATABASE_URL environment variable');
  process.exit(1);
}

testCredentials(connectionString);
