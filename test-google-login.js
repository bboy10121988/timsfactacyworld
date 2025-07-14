#!/usr/bin/env node

// 測試 Google 登入流程的腳本
const axios = require('axios').default;

async function testGoogleLoginFlow() {
  console.log('🚀 開始測試 Google 登入流程...\n');
  
  try {
    // 1. 測試獲取 Google 授權 URL
    console.log('📡 步驟 1: 獲取 Google 授權 URL');
    const authResponse = await axios.get('http://localhost:8000/api/medusa/auth/google');
    console.log('✅ 成功獲取授權 URL:', authResponse.data.authUrl.substring(0, 100) + '...');
    
    // 2. 解析授權 URL
    const authUrl = new URL(authResponse.data.authUrl);
    console.log('📋 Google OAuth 參數:');
    console.log('   - client_id:', authUrl.searchParams.get('client_id'));
    console.log('   - redirect_uri:', authUrl.searchParams.get('redirect_uri'));
    console.log('   - scope:', authUrl.searchParams.get('scope'));
    
    // 3. 測試回調端點（用假的授權碼）
    console.log('\n📡 步驟 2: 測試回調端點');
    try {
      const callbackResponse = await axios.post('http://localhost:8000/api/medusa/auth/google/callback', {
        code: 'fake_test_code',
        redirect_uri: 'http://localhost:8000/tw/auth/google/callback'
      });
      console.log('❌ 意外成功 - 應該失敗因為使用了假的授權碼');
    } catch (error) {
      if (error.response && error.response.data) {
        console.log('✅ 預期的錯誤:', error.response.data.error);
        console.log('   這表示回調端點正在工作，只是授權碼無效');
      } else {
        console.log('❌ 網路錯誤:', error.message);
      }
    }
    
    console.log('\n🎉 Google 登入流程配置測試完成！');
    console.log('\n📝 下一步: 在瀏覽器中打開 http://localhost:8000/tw/test-google-login');
    console.log('   然後點擊「測試 Google 登入」按鈕進行實際測試。');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    if (error.response) {
      console.error('   狀態:', error.response.status);
      console.error('   回應:', error.response.data);
    }
  }
}

testGoogleLoginFlow();
