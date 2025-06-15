// check-variant-details.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';
const PUBLISHABLE_API_KEY = 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7';

// 查詢特定變體的詳細資訊
async function checkVariantDetails() {
  try {
    // 1. 先獲取產品詳細資訊
    console.log('獲取產品詳細資訊...');
    const productResponse = await axios.get(`${MEDUSA_URL}/store/products/${PRODUCT_ID}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY
      }
    });
    
    const product = productResponse.data.product;
    console.log(`商品名稱: ${product.title}`);
    console.log(`變體數量: ${product.variants?.length || 0}`);
    
    // 2. 檢查每個變體的詳細屬性，特別是與庫存和可購買性相關的屬性
    if (product.variants && product.variants.length > 0) {
      console.log('\n變體詳細資訊:');
      
      product.variants.forEach((variant, index) => {
        console.log(`\n[變體 ${index + 1}] ${variant.title}:`);
        console.log(`ID: ${variant.id}`);
        console.log(`允許缺貨預訂: ${variant.allow_backorder}`);
        console.log(`管理庫存: ${variant.manage_inventory}`);
        console.log(`庫存數量: ${variant.inventory_quantity}`);
        
        // 計算可購買性狀態 (使用與前端相同的邏輯)
        const isPurchasable = 
          !variant.manage_inventory || 
          variant.allow_backorder || 
          (variant.manage_inventory && (variant.inventory_quantity || 0) > 0);
        
        console.log(`可購買性: ${isPurchasable ? '可購買' : '不可購買'}`);
        
        // 檢查其他重要屬性
        console.log(`銷售渠道: ${variant.sales_channel}`);
        console.log(`庫存類型: ${variant.inventory_type}`);
        console.log(`價格: ${JSON.stringify(variant.prices)}`);
      });
    }
    
    return product;
  } catch (error) {
    console.error('檢查變體詳細資訊時出錯:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

// 主函數
async function main() {
  await checkVariantDetails();
}

// 執行主函數
main();
