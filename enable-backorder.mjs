// enable-backorder.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';
const ADMIN_API_KEY = 'sk_7b3320084578c0d27cf05af5995b454effdf95c0b80060f018ee5ac42ea2f3b3';
// 所有可能的 admin API 端點路徑
const ADMIN_ENDPOINTS = [
  '/admin/variants', // 新版本可能的路徑
  '/admin/variants', // 舊版本可能的路徑
];

// 獲取產品的所有變體
async function getProductVariants() {
  try {
    console.log(`嘗試獲取產品 ${PRODUCT_ID} 的變體...`);
    
    // 嘗試使用 Bearer Token 方式
    const response = await axios.get(`${MEDUSA_URL}/admin/products/${PRODUCT_ID}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      }
    });
    
    console.log(`成功獲取產品資訊!`);
    return response.data.product.variants;
  } catch (error) {
    console.error('獲取變體失敗 (Bearer Token):', error.response ? error.response.status : error.message);
    
    // 嘗試使用其他方式
    try {
      const response = await axios.get(`${MEDUSA_URL}/admin/products/${PRODUCT_ID}`, {
        headers: {
          'x-medusa-access-token': ADMIN_API_KEY
        }
      });
      
      console.log(`成功獲取產品資訊! (使用 x-medusa-access-token)`);
      return response.data.product.variants;
    } catch (secondError) {
      console.error('所有嘗試獲取變體的方法都失敗了');
      console.error('請確認 API 金鑰和伺服器設置是否正確');
      return null;
    }
  }
}

// 為變體啟用缺貨預訂
async function enableBackorderForVariant(variantId) {
  console.log(`嘗試為變體 ${variantId} 啟用缺貨預訂...`);
  
  // 嘗試所有可能的端點
  for (const endpoint of ADMIN_ENDPOINTS) {
    try {
      // 使用 Bearer Token 方式
      console.log(`嘗試 ${endpoint}/${variantId} 與 Bearer Token...`);
      const response = await axios.post(`${MEDUSA_URL}${endpoint}/${variantId}`, 
        { 
          allow_backorder: true,
          inventory_quantity: 0 // 同時設置庫存為 0，確保前端會顯示「預訂」而不是「購買」
        },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_API_KEY}`
          }
        }
      );
      
      console.log(`成功！變體 ${variantId} 已啟用缺貨預訂。`);
      return true;
    } catch (error) {
      console.log(`使用 ${endpoint} 和 Bearer Token 失敗: ${error.response ? error.response.status : error.message}`);
      
      // 嘗試使用其他方式
      try {
        console.log(`嘗試 ${endpoint}/${variantId} 與 x-medusa-access-token...`);
        const response = await axios.post(`${MEDUSA_URL}${endpoint}/${variantId}`, 
          { 
            allow_backorder: true,
            inventory_quantity: 0 // 同時設置庫存為 0，確保前端會顯示「預訂」而不是「購買」
          },
          {
            headers: {
              'x-medusa-access-token': ADMIN_API_KEY
            }
          }
        );
        
        console.log(`成功！變體 ${variantId} 已啟用缺貨預訂。(使用 x-medusa-access-token)`);
        return true;
      } catch (secondError) {
        console.log(`使用 ${endpoint} 和 x-medusa-access-token 失敗: ${secondError.response ? secondError.response.status : secondError.message}`);
      }
    }
  }
  
  console.error(`無法啟用變體 ${variantId} 的缺貨預訂`);
  return false;
}

// 主函數
async function main() {
  try {
    // 1. 獲取產品的所有變體
    const variants = await getProductVariants();
    
    if (!variants) {
      console.error('無法獲取變體，無法繼續');
      return;
    }
    
    console.log(`找到 ${variants.length} 個變體`);
    
    // 2. 為每個變體啟用缺貨預訂
    let successCount = 0;
    for (const variant of variants) {
      console.log(`\n處理變體: ${variant.title} (${variant.id})`);
      console.log(`當前設定: allow_backorder = ${variant.allow_backorder}, inventory_quantity = ${variant.inventory_quantity}`);
      
      if (variant.allow_backorder === true) {
        console.log(`變體 ${variant.title} 已啟用缺貨預訂，無需修改`);
        successCount++;
        continue;
      }
      
      const success = await enableBackorderForVariant(variant.id);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`\n完成！成功修改 ${successCount}/${variants.length} 個變體`);
    
  } catch (error) {
    console.error('操作過程中出錯:', error.message);
  }
}

// 執行主函數
main();
