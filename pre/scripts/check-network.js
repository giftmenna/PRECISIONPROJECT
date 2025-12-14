const net = require('net');
const util = require('util');

const host = 'aws-1-us-east-1.pooler.supabase.com';
const port = 5432;

async function testConnection() {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    // Set a timeout for the connection attempt
    const timeout = 5000; // 5 seconds
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Connection timed out after ${timeout}ms`));
    }, timeout);
    
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });
    
    socket.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  console.log(`🔍 Testing connection to ${host}:${port}...`);
  
  try {
    await testConnection();
    console.log('✅ Successfully connected to the database server!');
  } catch (error) {
    console.error('❌ Failed to connect to the database server:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nThe connection was refused. This could mean:');
      console.log('1. The database server is not running');
      console.log('2. The server is not accepting connections on port 5432');
      console.log('3. A firewall is blocking the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\nThe hostname could not be resolved. This could mean:');
      console.log('1. There is a typo in the hostname');
      console.log('2. There are DNS resolution issues');
      console.log('3. The host is not accessible from your network');
    } else if (error.message.includes('timed out')) {
      console.log('\nThe connection attempt timed out. This could mean:');
      console.log('1. The host is not reachable from your network');
      console.log('2. A firewall is blocking the connection');
      console.log('3. The host is not responding');
    }
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the Supabase database is running and accessible');
    console.log('3. Check if port 5432 is open in your firewall');
    console.log('4. Try connecting from a different network (e.g., mobile hotspot)');
    console.log('5. Contact your network administrator if you\'re on a corporate network');
  }
}

main();
