// login-and-update-inventory.mjs
import axios from 'axios';

const MEDUSA_URL = 'http://localhost:9000';
const PRODUCT_ID = 'prod_01JWFGZX3RDSS1JWZVZAQFJGR6';
const ADMIN_EMAIL = 'bboy10121988@gmail.com'; // 已替換為實際的管理員電子郵件
const ADMIN_PASSWORD = 'Aa123456@'; // 已替換為實際的管理員密碼
const API_KEY = 'sk_3d9492cbcbbf2eed4d503401b8cc53dafa9eabc6baaeea147c358e01b191d2f4';

// 設置 axios 以儲存 cookie
const api = axios.create({
  baseURL: MEDUSA_URL,
  withCredentials: true,
});

// 1. 登入管理員帳戶
async function loginAdmin() {
  try {
    console.log('嘗試登入管理員帳戶...');
    const response = await api.post('/admin/auth', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    
    console.log('登入成功!');
    return response.data.user;
  } catch (error) {
    console.error('登入失敗:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

// 嘗試使用 API Key
async function tryWithAPIKey() {
  try {
    console.log('嘗試使用 API Key 認證...');
    const apiClient = axios.create({
      baseURL: MEDUSA_URL,
      headers: {
        'x-medusa-access-token': API_KEY
      }
    });
    
    const response = await apiClient.get(`/admin/products/${PRODUCT_ID}`);
    console.log('API Key 認證成功!');
    return { success: true, client: apiClient };
  } catch (error) {
    console.error('API Key 認證失敗:');
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    
    // 嘗試另一種 header 格式
    try {
      console.log('嘗試替代的 API Key header 格式...');
      const apiClient = axios.create({
        baseURL: MEDUSA_URL,
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      const response = await apiClient.get(`/admin/products/${PRODUCT_ID}`);
      console.log('替代 API Key 認證成功!');
      return { success: true, client: apiClient };
    } catch (secondError) {
      console.error('替代 API Key 認證也失敗');
      return { success: false };
    }
  }
}

// 2. 查詢商品庫存
async function checkInventory() {
  try {
    const response = await api.get(`/admin/products/${PRODUCT_ID}`);
    
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

// 3. 更新變體庫存
async function updateVariantInventory(variantId, inventory) {
  try {
    const response = await api.post(
      `/admin/variants/${variantId}`, 
      {
        inventory_quantity: inventory
      }
    );
    
    console.log(`已更新變體 ${response.data.variant.title} 的庫存為 ${response.data.variant.inventory_quantity}`);
    return response.data.variant;
  } catch (error) {
    console.error(`更新變體 ${variantId} 庫存時出錯:`);
    if (error.response) {
      console.error(`狀態碼: ${error.response.status}`);
      console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`錯誤: ${error.message}`);
    }
    return null;
  }
}

// 執行主流程
async function main() {
  try {
    // 首先嘗試使用 API Key
    console.log('嘗試使用 API Key 認證...');
    const apiKeyResult = await tryWithAPIKey();
    
    let authClient;
    let authMethod = '';
    
    if (apiKeyResult.success) {
      console.log('使用 API Key 認證成功，繼續執行...');
      authClient = apiKeyResult.client;
      authMethod = 'API Key';
    } else {
      // 如果 API Key 失敗，嘗試登入
      console.log('API Key 失敗，嘗試使用帳號密碼登入...');
      const user = await loginAdmin();
      if (!user) {
        console.log('所有認證方式均失敗，無法繼續');
        return;
      }
      
      authClient = api;
      authMethod = '帳號密碼';
    }
    
    console.log(`使用 ${authMethod} 認證成功`);
    
    // 定義使用已認證客戶端的庫存查詢函數
    async function checkInventoryWithClient() {
      try {
        const response = await authClient.get(`/admin/products/${PRODUCT_ID}`);
        
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
    
    // 定義使用已認證客戶端的庫存更新函數
    async function updateInventoryWithClient(variantId, inventory) {
      try {
        const response = await authClient.post(
          `/admin/variants/${variantId}`, 
          {
            inventory_quantity: inventory
          }
        );
        
        console.log(`已更新變體 ${response.data.variant.title} 的庫存為 ${response.data.variant.inventory_quantity}`);
        return response.data.variant;
      } catch (error) {
        console.error(`更新變體 ${variantId} 庫存時出錯:`);
        if (error.response) {
          console.error(`狀態碼: ${error.response.status}`);
          console.error(`錯誤訊息: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
          console.error(`錯誤: ${error.message}`);
        }
        return null;
      }
    }
    
    // 查詢當前庫存
    console.log('查詢當前庫存...');
    const variants = await checkInventoryWithClient();
    
    if (!variants || variants.length === 0) {
      console.log('沒有找到變體，無法更新庫存');
      return;
    }
    
    // 更新所有變體庫存為10
    console.log('\n開始更新所有變體庫存為10...');
    for (const variant of variants) {
      await updateInventoryWithClient(variant.id, 10);
    }
    
    // 再次查詢以確認更新成功
    console.log('\n更新完成，查詢更新後的庫存...');
    await checkInventoryWithClient();
    
  } catch (error) {
    console.error('操作過程中出錯:', error.message);
  }
}

// 執行主函數
main();
