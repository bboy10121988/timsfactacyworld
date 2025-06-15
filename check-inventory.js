const fetch = require('node-fetch');

const MEDUSA_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';

// 查詢商品庫存
async function checkInventory() {
  try {
    const response = await fetch(`${MEDUSA_URL}/store/products/${PRODUCT_ID}`, {
      method: 'GET',
      headers: {
        'x-publishable-key': PUBLISHABLE_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('商品信息:');
    console.log(`商品名稱: ${data.product.title}`);
    console.log('\n庫存信息:');
    
    if (data.product.variants && data.product.variants.length > 0) {
      data.product.variants.forEach(variant => {
        console.log(`變體 ${variant.title}:`);
        console.log(`- ID: ${variant.id}`);
        console.log(`- SKU: ${variant.sku || '無'}`);
        console.log(`- 庫存: ${variant.inventory_quantity}`);
        console.log('---');
      });
    } else {
      console.log('此商品沒有變體');
    }
    
    return data.product.variants;
  } catch (error) {
    console.error('獲取庫存信息時出錯:', error.message);
    return null;
  }
}

// 執行查詢
checkInventory();
