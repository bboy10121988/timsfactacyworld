import { getAdminToken } from './get-admin-token.mjs';

const BACKEND_URL = "http://localhost:9000";

async function addMetadataToProduct() {
  try {
    console.log('🔐 取得管理員 Token...');
    const token = await getAdminToken();
    
    // 首先獲取現有產品列表
    console.log('📋 獲取產品列表...');
    const productsResponse = await fetch(`${BACKEND_URL}/admin/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!productsResponse.ok) {
      throw new Error(`取得產品列表失敗: ${productsResponse.status}`);
    }
    
    const productsData = await productsResponse.json();
    console.log(`找到 ${productsData.products.length} 個產品`);
    
    if (productsData.products.length === 0) {
      console.log('沒有找到任何產品');
      return;
    }
    
    // 取第一個產品來測試
    const product = productsData.products[0];
    console.log(`\n準備為產品 "${product.title}" 添加 metadata...`);
    console.log(`產品 ID: ${product.id}`);
    
    // 添加促銷 metadata
    const updateData = {
      metadata: {
        discount: "20% OFF",
        promotion: "春節特惠",
        promotion_type: "sale",
        special_event: "新年快樂"
      }
    };
    
    console.log('📝 更新 metadata:', updateData.metadata);
    
    const updateResponse = await fetch(`${BACKEND_URL}/admin/products/${product.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`更新產品失敗: ${updateResponse.status} - ${errorText}`);
    }
    
    const updatedProduct = await updateResponse.json();
    console.log('\n✅ 成功更新產品 metadata!');
    console.log('更新後的 metadata:', updatedProduct.product.metadata);
    
    return updatedProduct.product;
    
  } catch (error) {
    console.error('❌ 添加 metadata 失敗:', error);
    throw error;
  }
}

// 執行測試
addMetadataToProduct()
  .then(() => {
    console.log('\n🎉 測試完成!');
  })
  .catch((error) => {
    console.error('💥 測試失敗:', error);
    process.exit(1);
  });
