// get-jwt-token.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'bboy10121988@gmail.com';
const ADMIN_PASSWORD = 'Aa123456@';

async function getJwtToken() {
  try {
    console.log('嘗試獲取 JWT 令牌...');
    const response = await axios.post(`${MEDUSA_URL}/admin/auth`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    console.log('成功獲取 JWT 令牌:');
    console.log(response.data);
    return response.data.token;
  } catch (error) {
    console.error('獲取 JWT 令牌失敗:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
      console.error(`請求頭: ${JSON.stringify(error.response.headers, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

// 執行主函數
getJwtToken();
