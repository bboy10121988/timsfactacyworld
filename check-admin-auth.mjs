// check-admin-auth.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_API_KEY = 'sk_3d9492cbcbbf2eed4d503401b8cc53dafa9eabc6baaeea147c358e01b191d2f4';

async function checkAdminAuth() {
  try {
    // 嘗試請求一個需要管理員權限的端點
    console.log('檢查管理員API金鑰認證...');
    console.log(`使用API金鑰: ${ADMIN_API_KEY.substring(0, 8)}...`);
    console.log(`Medusa URL: ${MEDUSA_URL}`);
    
    const response = await axios.get(`${MEDUSA_URL}/admin/products`, {
      headers: { 
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      }
    });
    
    // 如果請求成功，表示認證有效
    console.log('認證成功!');
    console.log(`取得 ${response.data.products.length} 個商品`);
    return true;
  } catch (error) {
    console.error('認證失敗!');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('無法連接到伺服器，請確認 Medusa 服務是否運行');
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return false;
  }
}

checkAdminAuth();
