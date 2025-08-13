const axios = require('axios');

const BASE_URL = 'http://localhost:9000';

async function testPublishableKeys() {
  console.log('測試不同的 publishable keys...\n');

  const testKeys = [
    'pk_01JEBXP26F9G4DH9WQA7HJVJH1',
    'pk_test_123456789',
    null
  ];

  for (const key of testKeys) {
    console.log(`測試 key: ${key || '無 key'}`);
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (key) {
        headers['x-publishable-api-key'] = key;
      }

      const response = await axios.get(`${BASE_URL}/store/affiliate/partners`, {
        headers,
        timeout: 5000
      });
      
      console.log(`✅ 成功 (${key}):`, response.data);
    } catch (error) {
      if (error.response) {
        console.log(`❌ 錯誤 (${key}):`, error.response.data);
      } else {
        console.log(`❌ 網路錯誤 (${key}):`, error.message);
      }
    }
    console.log('---');
  }
}

testPublishableKeys().catch(console.error);
