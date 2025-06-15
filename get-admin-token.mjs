// get-admin-token.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const axios = require('axios');

const MEDUSA_URL = 'http://localhost:9000';

async function getAdminToken() {
  try {
    const response = await axios.post(`${MEDUSA_URL}/admin/auth`, {
      email: 'admin@medusa-test.com',
      password: 'supersecret'
    });
    
    console.log('Admin token:', response.data.jwt);
    return response.data.jwt;
  } catch (error) {
    console.error('獲取 Admin token 時出錯:', error.response ? error.response.data : error.message);
    return null;
  }
}

getAdminToken();
