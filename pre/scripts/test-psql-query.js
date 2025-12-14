const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testPsqlQuery() {
  try {
    console.log('🔍 Testing direct psql query...');
    
    const { stdout, stderr } = await execPromise(
      'psql "postgresql://postgres.uuvbshfdxfpnnsbsuaiv:Pawrex000%24@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require" -c "SELECT id, title, scheduled_date FROM daily_lessons LIMIT 3;"'
    );
    
    if (stderr) {
      console.error('❌ Error:', stderr);
      return;
    }
    
    console.log('✅ Query results:');
    console.log(stdout);
    
  } catch (error) {
    console.error('❌ Error executing psql command:');
    console.error(error.message);
  }
}

testPsqlQuery();
