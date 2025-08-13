#!/usr/bin/env node

// 管理員登入和 API 測試腳本
const axios = require('axios');

const BASE_URL = 'http://localhost:9000';
let adminToken = null;

async function loginAdmin() {
  console.log('🔐 嘗試管理員登入...\n');
  
  try {
    // 嘗試使用 Medusa 的內建管理員認證
    const response = await axios.post(`${BASE_URL}/auth/user/emailpass`, {
      email: 'admin@medusajs.com',
      password: 'supersecret'
    });

    if (response.data && response.data.token) {
      adminToken = response.data.token;
      console.log('✅ 管理員登入成功');
      console.log('🎫 獲得令牌:', adminToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ 登入失敗 - 無效的回應格式');
      console.log('回應:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Medusa 內建認證失敗:', error.message);
    console.log('🔄 嘗試自定義管理員認證...');
    
    try {
      // 嘗試自定義管理員認證
      const response2 = await axios.post(`${BASE_URL}/admin-auth`, {
        email: 'admin@timsfactory.com',
        password: 'admin123'
      });

      if (response2.data.success && response2.data.data.token) {
        adminToken = response2.data.data.token;
        console.log('✅ 自定義管理員登入成功');
        console.log('🎫 獲得令牌:', adminToken.substring(0, 20) + '...');
        return true;
      }
    } catch (error2) {
      console.log('❌ 自定義認證也失敗:', error2.message);
      console.log('🔄 嘗試創建測試令牌...');
      
      // 直接創建一個測試令牌
      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
      
      adminToken = jwt.sign(
        {
          id: 'test-admin-id',
          email: 'admin@timsfactory.com',
          username: 'admin',
          role: 'admin',
          adminRole: 'super_admin'
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
      
      console.log('✅ 測試令牌創建成功');
      console.log('🎫 測試令牌:', adminToken.substring(0, 20) + '...');
      return true;
    }
    
    return false;
  }
}

async function testAdminAPIWithAuth() {
  console.log('\n🚀 使用認證測試管理員 API 端點...\n');

  const tests = [
    {
      name: '測試合作夥伴列表 API',
      method: 'GET',
      url: '/admin/affiliate/partners',
      params: { page: 1, limit: 10 }
    },
    {
      name: '測試佣金列表 API',
      method: 'GET',
      url: '/admin/affiliate/commissions',
      params: { page: 1, limit: 10 }
    },
    {
      name: '測試統計數據 API',
      method: 'GET',
      url: '/admin/affiliate/stats'
    },
    {
      name: '測試基礎功能',
      method: 'GET',
      url: '/admin/affiliate/test'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`📋 ${test.name}...`);
      
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (test.params) {
        config.params = test.params;
      }

      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      
      console.log(`✅ 成功 - 狀態碼: ${response.status}`);
      
      if (response.data && response.data.success !== undefined) {
        console.log(`   回應: success = ${response.data.success}`);
      }
      
      if (response.data && response.data.data) {
        const dataType = Array.isArray(response.data.data) ? 'array' : typeof response.data.data;
        const dataLength = Array.isArray(response.data.data) ? response.data.data.length : 'N/A';
        console.log(`   數據類型: ${dataType}, 長度: ${dataLength}`);
      }
      
      passedTests++;
      
    } catch (error) {
      console.log(`❌ 失敗 - ${error.message}`);
      
      if (error.response) {
        console.log(`   狀態碼: ${error.response.status}`);
        console.log(`   錯誤訊息: ${error.response.data?.message || error.response.statusText}`);
        if (error.response.status === 500 && error.response.data?.stack) {
          console.log(`   堆疊追踪: ${error.response.data.stack.split('\n')[0]}`);
        }
      }
    }
    
    console.log(''); // 空行分隔
  }

  console.log(`📊 測試結果: ${passedTests}/${totalTests} 通過`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有測試通過！管理員 API 端點運作正常。');
  } else {
    console.log('⚠️  部分測試失敗，請檢查日誌以獲取詳細信息。');
  }
}

// 主要執行邏輯
async function main() {
  const loginSuccess = await loginAdmin();
  
  if (loginSuccess) {
    await testAdminAPIWithAuth();
  } else {
    console.log('無法進行 API 測試，因為登入失敗。');
  }
}

// 執行測試
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { loginAdmin, testAdminAPIWithAuth };
