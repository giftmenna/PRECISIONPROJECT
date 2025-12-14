const axios = require('axios');
const { getAuthToken } = require('./test-auth');

async function testAuthenticatedDailyLessons() {
  try {
    console.log('🔐 Getting auth token...');
    const token = await getAuthToken();
    
    console.log('🔍 Testing /api/daily-lessons with authentication...');
    
    const response = await axios.get('http://localhost:3001/api/daily-lessons', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response status:', response.status);
    console.log('📅 Daily Lessons:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing authenticated daily lessons API:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuthenticatedDailyLessons();
