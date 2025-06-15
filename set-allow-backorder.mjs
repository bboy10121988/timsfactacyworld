// set-allow-backorder.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const VARIANT_IDS = [
  'variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q', // 綠色L
  'variant_01JXKK401SB30GWZ4EZH0DFM3A'  // 綠M
];
const ADMIN_API_KEY = 'sk_3d9492cbcbbf2eed4d503401b8cc53dafa9eabc6baaeea147c358e01b191d2f4';

// 嘗試使用不同的 header 方式調用 API
async function tryApi(url, method, data = null) {
  const configs = [
    { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${ADMIN_API_KEY}` } },
    { name: 'x-medusa-access-token', headers: { 'x-medusa-access-token': ADMIN_API_KEY } },
    { name: 'API Key', headers: { 'API-Key': ADMIN_API_KEY } },
    { name: 'Content-Type', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_API_KEY}` } }
  ];

  for (const config of configs) {
    try {
      console.log(`嘗試使用 ${config.name} 方式...`);
      
      const options = {
        method,
        url,
        headers: config.headers
      };
      
      if (data) {
        options.data = data;
      }
      
      const response = await axios(options);
      console.log(`使用 ${config.name} 方式成功！`);
      return response.data;
    } catch (error) {
      console.log(`使用 ${config.name} 方式失敗: ${error.response ? error.response.status : error.message}`);
    }
  }
  
  throw new Error('所有認證方式都失敗了');
}

// 設置允許缺貨預訂和庫存數量
async function setVariantSettings() {
  console.log('開始設置變體屬性...');
  
  for (const variantId of VARIANT_IDS) {
    try {
      console.log(`設置變體 ${variantId} 屬性...`);
      
      // 1. 嘗試修改變體設定
      const url = `${MEDUSA_URL}/admin/variants/${variantId}`;
      
      // 設置明確的庫存數量和允許缺貨預訂
      const data = {
        inventory_quantity: 10, // 明確設置庫存數量
        allow_backorder: true   // 允許缺貨預訂
      };
      
      await tryApi(url, 'POST', data);
      console.log(`變體 ${variantId} 屬性設置成功！`);
    } catch (error) {
      console.error(`無法設置變體 ${variantId} 屬性:`, error.message);
    }
  }
}

// 執行主函數
async function main() {
  try {
    await setVariantSettings();
    console.log('所有變體設定完成');
  } catch (error) {
    console.error('執行過程中出錯:', error.message);
  }
}

main();
