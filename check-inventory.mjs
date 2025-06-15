// check-inventory.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_API_KEY = 'sk_3d9492cbcbbf2eed4d503401b8cc53dafa9eabc6baaeea147c358e01b191d2f4';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';

// 查詢商品庫存
async function checkInventory() {
  try {
    const response = await axios.get(`${MEDUSA_URL}/admin/products/${PRODUCT_ID}`, {
      headers: {
        'x-medusa-access-token': ADMIN_API_KEY
      }
    });
    
    const product = response.data.product;
    
    console.log('商品信息:');
    console.log(`商品名稱: ${product.title}`);
    console.log('\n庫存信息:');
    
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
    
    return product.variants;
  } catch (error) {
    console.error('獲取庫存信息時出錯:', error.response ? error.response.data.message : error.message);
    return null;
  }
}

// 執行查詢
checkInventory();
