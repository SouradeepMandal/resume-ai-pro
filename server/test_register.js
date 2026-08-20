const axios = require('axios');

async function testRegistration() {
  try {
    const timestamp = Date.now();
    const testEmail = `souradeepmandal2015+test${timestamp}@gmail.com`;
    console.log(`Testing registration with email: ${testEmail}`);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: 'password123'
    });
    
    console.log('Registration response:', response.data);
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testRegistration();
