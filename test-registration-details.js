const fetch = require('node-fetch');

async function testRegistrationWithDetails() {
  console.log('🔍 === 測試註冊並獲取詳細錯誤 ===\n');
  
  const testEmail = 'detailed_test_' + Date.now() + '@example.com';
  const registrationData = {
    name: '詳細測試夥伴',
    email: testEmail,
    phone: '0987-654-321',
    website: 'https://detailed-test.com',
    password: 'testpass123'
  };
  
  try {
    const response = await fetch('http://localhost:9000/store/affiliate/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'
      },
      body: JSON.stringify(registrationData)
    });
    
    const data = await response.json();
    console.log('註冊響應狀態:', response.status);
    console.log('註冊響應數據:', JSON.stringify(data, null, 2));
    
    if (!response.ok || !data.success) {
      console.log('❌ 詳細錯誤信息:', data.message || data.error || '未知錯誤');
    }
  } catch (error) {
    console.log('❌ 網路錯誤:', error.message);
  }
}

testRegistrationWithDetails().catch(console.error);
