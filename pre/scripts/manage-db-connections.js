const { Pool } = require('pg');

// Connection configuration
const config = {
  user: 'postgres.uuvbshfdxfpnnsbsuaiv',
  host: 'aws-1-us-east-1.pooler.supabase.com',
  database: 'postgres',
  password: 'Pawrex000$',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // Limit to 1 connection for this operation
  idleTimeoutMillis: 1000, // Close idle connections quickly
  connectionTimeoutMillis: 5000,
};

async function withConnection(callback) {
  const pool = new Pool(config);
  const client = await pool.connect();
  
  try {
    return await callback(client);
  } finally {
    // Ensure the client is always released back to the pool
    client.release();
    // End the pool to close all connections
    await pool.end();
  }
}

async function getDailyLessons() {
  try {
    return await withConnection(async (client) => {
      const result = await client.query(
        'SELECT id, title, scheduled_date FROM daily_lessons ORDER BY scheduled_date LIMIT 3'
      );
      return result.rows;
    });
  } catch (error) {
    console.error('Error in getDailyLessons:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔍 Fetching daily lessons...');
    const lessons = await getDailyLessons();
    
    if (lessons.length === 0) {
      console.log('ℹ️  No daily lessons found.');
      return;
    }
    
    console.log('✅ Successfully fetched daily lessons:');
    console.table(lessons.map(lesson => ({
      ID: lesson.id,
      Title: lesson.title,
      'Scheduled Date': new Date(lesson.scheduled_date).toLocaleDateString()
    })));
    
  } catch (error) {
    console.error('❌ Error in main:', error.message);
  }
}

// Run the main function
main();
