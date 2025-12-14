const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error };
  }
}

async function testConnection() {
  console.log('🔍 Starting comprehensive database connection test...\n');
  
  // Check environment variables
  console.log('🔍 Checking environment...');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Found' : '❌ Not found'}`);
  
  // Network connectivity test
  console.log('\n🌐 Testing network connectivity to Supabase...');
  const pingResult = await runCommand('ping -c 4 db.uuvbshfdxfpnnsbsuaiv.supabase.co');
  
  if (pingResult.success) {
    console.log('✅ Network connectivity test passed');
  } else {
    console.log('❌ Network connectivity test failed');
    console.log('   Please check your internet connection and try again');
    return;
  }
  
  // Test database connection
  console.log('\n🔌 Testing database connection...');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    // Test basic query
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const endTime = Date.now();
    
    console.log(`✅ Database connection successful! (${endTime - startTime}ms)`);
    
    // Get database version
    try {
      const version = await prisma.$queryRaw`SELECT version()`;
      console.log('\n📊 Database version:');
      console.log(version[0].version);
    } catch (versionError) {
      console.warn('⚠️  Could not get database version:', versionError.message);
    }
    
    // List tables
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log('\n📋 Tables in public schema:');
      console.table(tables);
    } catch (tableError) {
      console.warn('⚠️  Could not list tables (permission issue?):', tableError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Database connection failed with error:');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code || 'N/A');
    console.error('Error message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n🔧 The database host could not be found. Please check:');
      console.error('1. Your internet connection');
      console.error('2. The database URL in your .env file');
      console.error('3. If using a VPN, try disabling it');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Connection timed out. This could be due to:');
      console.error('1. Network issues');
      console.error('2. Firewall blocking the connection');
      console.error('3. Database server not accepting connections');
    } else if (error.code === 'P1001') {
      console.error('\n🔧 Can\'t reach database server. Please check:');
      console.error('1. Database server is running');
      console.error('2. Your IP is whitelisted in Supabase dashboard');
      console.error('3. Database credentials are correct');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🏁 Test completed at', new Date().toLocaleTimeString());
  }
}

// Run the test
testConnection()
  .catch(console.error);
