const fetch = require('node-fetch');

async function testCompleteRegistration() {
  console.log('🚀 === 完整夥伴註冊系統測試 ===\n');
  
  const testCases = [
    {
      name: '基本註冊測試',
      data: {
        name: '完整測試夥伴',
        email: `complete_test_${Date.now()}@example.com`,
        password: 'securepass123',
        phone: '0912-345-678',
        website: 'https://complete-test.com'
      }
    },
    {
      name: '推薦制註冊測試',
      data: {
        name: '推薦測試夥伴',
        email: `referral_test_${Date.now()}@example.com`,
        password: 'securepass123',
        phone: '0987-654-321',
        website: 'https://referral-test.com',
        referred_by_code: 'MING2025' // 使用已存在的推薦碼
      }
    },
    {
      name: '密碼強度測試',
      data: {
        name: '密碼測試',
        email: `pwd_test_${Date.now()}@example.com`,
        password: '123', // 弱密碼
        phone: '0900-000-000'
      }
    },
    {
      name: '郵箱格式測試',
      data: {
        name: '格式測試',
        email: 'invalid-email', // 無效郵箱
        password: 'securepass123'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 ${testCase.name}:`);
    
    try {
      const response = await fetch('http://localhost:9000/store/affiliate/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'
        },
        body: JSON.stringify(testCase.data)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${testCase.name} 成功`);
        console.log(`  - 夥伴 ID: ${data.partner.id}`);
        console.log(`  - 聯盟代碼: ${data.partner.affiliate_code}`);
        console.log(`  - 推薦連結: ${data.partner.referral_link}`);
        if (data.referrer_info) {
          console.log(`  - 推薦人: ${data.referrer_info.referrer_name} (${data.referrer_info.referred_by})`);
        }
      } else {
        console.log(`❌ ${testCase.name} 失敗: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} 錯誤: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🔍 檢查資料庫狀態...');
  // 這個測試完成後，可以檢查資料庫中的新記錄
}

testCompleteRegistration().catch(console.error);
