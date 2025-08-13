#!/usr/bin/env node

// 聯盟營銷系統基本測試腳本
const axios = require('axios');

const BASE_URL = 'http://localhost:9000';

async function testAffiliateSystem() {
  console.log('🚀 開始測試聯盟營銷系統...\n');

  const tests = [
    {
      name: '測試聯盟服務基本功能',
      method: 'GET',
      url: '/affiliate-test'
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
        timeout: 15000
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
        console.log('   詳細結果:');
        console.log(`   - 服務可用: ${response.data.data.serviceAvailable}`);
        
        if (response.data.data.methodsAvailable) {
          console.log('   - 方法可用性:');
          Object.entries(response.data.data.methodsAvailable).forEach(([method, available]) => {
            console.log(`     * ${method}: ${available ? '✅' : '❌'}`);
          });
        }
        
        if (response.data.data.statsResult) {
          console.log('   - 統計數據獲取: ✅ 成功');
          console.log('   - 統計數據:', JSON.stringify(response.data.data.statsResult, null, 4));
        } else if (response.data.data.statsError) {
          console.log('   - 統計數據獲取: ❌ 失敗');
          console.log('   - 錯誤訊息:', response.data.data.statsError);
        }
      }
      
      passedTests++;
      
    } catch (error) {
      console.log(`❌ 失敗 - ${error.message}`);
      
      if (error.response) {
        console.log(`   狀態碼: ${error.response.status}`);
        console.log(`   錯誤訊息: ${error.response.data?.message || error.response.statusText}`);
        if (error.response.status === 500 && error.response.data) {
          console.log(`   詳細錯誤:`, error.response.data);
        }
      }
    }
    
    console.log(''); // 空行分隔
  }

  console.log(`📊 測試結果: ${passedTests}/${totalTests} 通過`);
  
  if (passedTests === totalTests) {
    console.log('🎉 聯盟營銷系統基本測試通過！');
    
    // 如果基本測試通過，嘗試進階測試
    console.log('\n🔄 開始進階 API 測試...');
    await advancedAPITest();
  } else {
    console.log('⚠️  基本測試失敗，請檢查服務配置。');
  }
}

async function advancedAPITest() {
  // 嘗試直接調用一些不需要特殊認證的端點
  const advancedTests = [
    {
      name: '測試聯盟夥伴註冊 API',
      method: 'POST',
      url: '/affiliate/register',
      data: {
        name: 'Test Partner',
        email: 'test@example.com',
        password: 'test123',
        website: 'https://example.com'
      }
    }
  ];

  for (const test of advancedTests) {
    try {
      console.log(`📋 ${test.name}...`);
      
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      
      console.log(`✅ 成功 - 狀態碼: ${response.status}`);
      
      if (response.data && response.data.success !== undefined) {
        console.log(`   回應: success = ${response.data.success}`);
      }
      
    } catch (error) {
      console.log(`❌ 失敗 - ${error.message}`);
      
      if (error.response) {
        console.log(`   狀態碼: ${error.response.status}`);
        if (error.response.status === 404) {
          console.log('   註: 此端點可能尚未實現，這是正常的');
        }
      }
    }
    
    console.log('');
  }
}

// 執行測試
if (require.main === module) {
  testAffiliateSystem().catch(console.error);
}

module.exports = { testAffiliateSystem };
