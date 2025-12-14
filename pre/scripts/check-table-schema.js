const { Pool } = require('pg');

async function checkTableSchema() {
  const pool = new Pool({
    user: 'postgres.uuvbshfdxfpnnsbsuaiv',
    host: 'aws-1-us-east-1.pooler.supabase.com',
    database: 'postgres',
    password: 'Pawrex000$',
    port: 6543,
    ssl: {
      rejectUnauthorized: false  // Only for testing
    }
  });

  try {
    console.log('Checking competition_entries table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'competition_entries';
    `);

    console.log('\ncompetition_entries table structure:');
    console.table(result.rows);

    // Check if 'method' column exists in any table
    const methodColResult = await pool.query(`
      SELECT table_name
      FROM information_schema.columns
      WHERE column_name = 'method';
    `);

    if (methodColResult.rows.length > 0) {
      console.log('\nTables containing a "method" column:');
      console.table(methodColResult.rows);
    } else {
      console.log('\nNo tables found with a "method" column.');
    }

  } catch (error) {
    console.error('Error checking table schema:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableSchema();
