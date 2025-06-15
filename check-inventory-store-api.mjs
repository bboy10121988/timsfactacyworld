// check-inventory-store-api.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';
// 發佈 API 金鑰 (Publishable API Key)
const PUBLISHABLE_API_KEY = 'pk_01JXNBRXCYBFZMPGBNHM28SJSJ';

// 使用 store API 查詢商品資訊
async function checkInventory() {
  try {
    console.log('使用 store API 查詢商品資訊...');
    console.log(`使用發佈 API 金鑰: ${PUBLISHABLE_API_KEY}`);
    
    // 先嘗試查詢所有商品，確認 API 是否正常工作
    const allProductsResponse = await axios.get(`${MEDUSA_URL}/store/products`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY
      }
    });
    
    console.log(`成功獲取所有商品！總共 ${allProductsResponse.data.products.length} 個商品`);
    
    // 查詢特定商品
    const response = await axios.get(`${MEDUSA_URL}/store/products/${PRODUCT_ID}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY
      }
    });
    
    const product = response.data.product;
    
    console.log('\n商品詳細資訊:');
    console.log(`商品名稱: ${product.title}`);
    console.log(`商品描述: ${product.description || '無'}`);
    console.log('\n庫存資訊:');
    
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        console.log(`變體 ${variant.title}:`);
        console.log(`- ID: ${variant.id}`);
        console.log(`- SKU: ${variant.sku || '無'}`);
        console.log(`- 庫存: ${variant.inventory_quantity}`);
        console.log('---');
      });
    } else {
      console.log('此商品沒有變體');
    }
    
    return product;
  } catch (error) {
    console.error('獲取庫存資訊時出錯:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('無法連接到伺服器，請確認 Medusa 服務是否運行');
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

// 執行查詢
checkInventory();
