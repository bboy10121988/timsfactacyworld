#!/usr/bin/env node

// 管理員 API 端點測試腳本
const axios = require('axios');

const BASE_URL = 'http://localhost:9000';

async function testAdminAPI() {
  console.log('🚀 開始測試管理員 API 端點...\n');

  const tests = [
    {
      name: '測試管理員 API 基礎功能（無認證）',
      method: 'GET',
      url: '/admin/affiliate/test'
    },
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
      name: '測試數據導出 API (JSON)',
      method: 'GET',
      url: '/admin/affiliate/export',
      params: { type: 'partners', format: 'json' }
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
        timeout: 10000
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

// 執行測試
if (require.main === module) {
  testAdminAPI().catch(console.error);
}

module.exports = { testAdminAPI };
