const axios = require('axios');

async function testDailyLessonsAPI() {
  try {
    console.log('Testing /api/daily-lessons endpoint...');
    
    // Make a GET request to the daily lessons API
    const response = await axios.get('http://localhost:3001/api/daily-lessons');
    
    console.log('✅ Success! Response status:', response.status);
    console.log('📅 Daily Lessons:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing daily lessons API:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
  }
}

testDailyLessonsAPI();
