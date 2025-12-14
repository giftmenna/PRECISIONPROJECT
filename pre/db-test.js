import pkg from 'pg';
const { Client } = pkg;

// Make sure to replace with your DATABASE_URL
const connectionString = process.env.DATABASE_URL || 
  "postgresql://postgres:2MXz73K5Iz7lGbSa@db.xbxvgbkrpxxcerssbijk.supabase.co:5432/postgres?sslmode=require";

const client = new Client({
  connectionString,
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to the database!");
    await client.end();
  } catch (error) {
    console.log("❌ Connection failed.");
    console.log("Error details:", error.message);
  }
}

testConnection();
