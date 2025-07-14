#!/usr/bin/env node

// 建立測試促銷活動的腳本
// 使用 Medusa Admin API 創建真實的促銷活動

const axios = require('axios');

// 配置
const MEDUSA_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'supersecret';

async function createTestPromotions() {
  try {
    console.log('🔐 開始管理員登入...');
    
    // 1. 管理員登入
    const authResponse = await axios.post(`${MEDUSA_URL}/admin/auth`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = authResponse.data.user.id; // Medusa v2 使用不同的認證方式
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ 管理員登入成功');
    
    // 2. 創建測試促銷活動
    const promotions = [
      {
        code: 'PRODUCT20',
        type: 'percentage',
        value: 20,
        description: '指定商品 8 折優惠',
        is_automatic: true
      },
      {
        code: 'NEWYEAR50',
        type: 'fixed',
        value: 50,
        description: '新年特惠減 NT$50',
        is_automatic: false
      },
      {
        code: 'HOTDEAL',
        type: 'percentage',
        value: 30,
        description: '熱銷商品 7 折',
        is_automatic: true
      }
    ];
    
    console.log('📦 創建測試促銷活動...');
    
    for (const promotion of promotions) {
      try {
        const response = await axios.post(`${MEDUSA_URL}/admin/promotions`, {
          code: promotion.code,
          application_method: {
            type: promotion.type,
            value: promotion.value,
            currency_code: 'TWD'
          },
          is_automatic: promotion.is_automatic,
          metadata: {
            description: promotion.description
          }
        }, { headers });
        
        console.log(`✅ 創建促銷活動: ${promotion.code} (${promotion.description})`);
      } catch (error) {
        console.warn(`⚠️ 促銷活動 ${promotion.code} 可能已存在:`, error.response?.data?.message || error.message);
      }
    }
    
    // 3. 更新商品 metadata 以包含促銷標籤
    console.log('🏷️ 更新商品促銷標籤...');
    
    // 獲取現有商品
    const productsResponse = await axios.get(`${MEDUSA_URL}/admin/products`, { headers });
    const products = productsResponse.data.products || [];
    
    if (products.length > 0) {
      const firstProduct = products[0];
      
      // 更新第一個商品的 metadata
      await axios.post(`${MEDUSA_URL}/admin/products/${firstProduct.id}`, {
        metadata: {
          ...firstProduct.metadata,
          is_hot: "true",
          is_featured: "true",
          promotion: "熱銷精選",
          special_event: "限時特惠"
        }
      }, { headers });
      
      console.log(`✅ 更新商品促銷標籤: ${firstProduct.title}`);
    }
    
    console.log('\n🎉 測試促銷活動創建完成！');
    console.log('📝 創建的促銷活動:');
    promotions.forEach(p => {
      console.log(`   - ${p.code}: ${p.description}`);
    });
    
    console.log('\n🔄 現在可以測試前端促銷標籤顯示：');
    console.log('   1. 啟動前端應用 (npm run dev)');
    console.log('   2. 查看商品頁面');
    console.log('   3. 確認顯示真實的促銷標籤');
    
  } catch (error) {
    console.error('❌ 創建測試促銷活動失敗:', error.response?.data || error.message);
    console.log('\n💡 請確保：');
    console.log('   1. Medusa 後端正在運行 (http://localhost:9000)');
    console.log('   2. 管理員憑證正確');
    console.log('   3. 資料庫已正確初始化');
  }
}

// 執行腳本
if (require.main === module) {
  createTestPromotions();
}

module.exports = { createTestPromotions };
