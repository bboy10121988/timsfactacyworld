// check-inventory-with-publishable-key.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';
const PUBLISHABLE_API_KEY = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7';

async function checkInventory() {
  try {
    console.log('使用發佈 API 金鑰查詢庫存...');
    console.log(`API 金鑰: ${PUBLISHABLE_API_KEY.substring(0, 8)}...`);
    
    // 使用發佈 API 金鑰訪問 store API
    const response = await axios.get(`${MEDUSA_URL}/store/products/${PRODUCT_ID}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY
      }
    });
    
    const product = response.data.product;
    
    console.log('商品信息:');
    console.log(`商品名稱: ${product.title}`);
    console.log(`商品描述: ${product.description}`);
    
    if (product.variants && product.variants.length > 0) {
      console.log('\n變體庫存信息:');
      product.variants.forEach(variant => {
        console.log(`變體 ${variant.title}:`);
        console.log(`- ID: ${variant.id}`);
        console.log(`- 庫存: ${variant.inventory_quantity}`);
        console.log(`- 是否可購買: ${variant.purchasable}`);
        console.log(`- 價格: ${variant.prices?.map(p => `${p.currency_code} ${p.amount}`).join(', ')}`);
        console.log(`- 完整資訊: ${JSON.stringify(variant, null, 2)}`);
        console.log('---');
      });
    } else {
      console.log('此商品沒有變體');
    }
    
    return product;
  } catch (error) {
    console.error('獲取庫存信息時出錯:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

// 嘗試查詢所有商品
async function listAllProducts() {
  try {
    console.log('查詢所有商品...');
    
    const response = await axios.get(`${MEDUSA_URL}/store/products`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY
      }
    });
    
    const products = response.data.products;
    console.log(`找到 ${products.length} 個商品:`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (ID: ${product.id})`);
    });
    
    return products;
  } catch (error) {
    console.error('獲取商品列表時出錯:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

async function main() {
  try {
    // 先查詢所有商品
    const products = await listAllProducts();
    
    if (products && products.length > 0) {
      // 如果有指定 ID 的商品，則查詢該商品的詳細資訊
      if (products.some(p => p.id === PRODUCT_ID)) {
        console.log(`\n找到指定的商品 ${PRODUCT_ID}，查詢詳細資訊...\n`);
        await checkInventory();
      } else {
        console.log(`\n未找到指定的商品 ${PRODUCT_ID}。請確認 ID 是否正確。`);
        console.log('可用的商品 ID:');
        products.forEach(p => console.log(`- ${p.id} (${p.title})`));
      }
    }
  } catch (error) {
    console.error('執行過程中出錯:', error.message);
  }
}

main();
