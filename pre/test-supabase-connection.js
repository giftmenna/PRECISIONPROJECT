require('dotenv').config();
const { Client } = require('pg');

console.log('🔍 Testing Supabase Connection...\n');

// Test DIRECT_URL
console.log('Testing DIRECT_URL (port 5432)...');
const directUrl = process.env.DIRECT_URL;
console.log('URL:', directUrl?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');

if (!directUrl) {
  console.error('❌ DIRECT_URL not found in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: directUrl,
  connectionTimeoutMillis: 10000,
});

client.connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('✅ Database version:', result.rows[0].version.split(' ')[0]);
    return client.end();
  })
  .then(() => {
    console.log('✅ Connection test passed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    console.error('\nPossible issues:');
    console.error('1. Supabase project is paused (visit dashboard to wake it up)');
    console.error('2. Wrong connection string format');
    console.error('3. Firewall blocking connection');
    console.error('4. Database not fully provisioned yet');
    console.error('\nTry:');
    console.error('- Visit https://supabase.com/dashboard');
    console.error('- Check if your project is active');
    console.error('- Verify connection string in Settings → Database');
    process.exit(1);
  });
