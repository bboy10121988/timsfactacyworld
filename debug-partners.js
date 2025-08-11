// 檢查後端內存中的合作夥伴資料
const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'sk_9fedcb4c350478cacf19a37ca3af9aec'

async function debugPartners() {
  console.log('=== 檢查後端合作夥伴資料 ===\n')
  
  // 嘗試註冊一個新的測試帳號
  console.log('1. 註冊新的測試帳號...')
  
  const registerResponse = await fetch(`${BACKEND_URL}/store/affiliate/partners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    body: JSON.stringify({
      name: '調試測試用戶',
      email: 'debug-test@example.com',
      password: 'Test123456!',
      phone: '0912345678',
      website: 'https://debug.com'
    })
  })
  
  if (registerResponse.ok) {
    const registerResult = await registerResponse.json()
    console.log('✅ 註冊成功:', {
      id: registerResult.partner.id,
      name: registerResult.partner.name,
      email: registerResult.partner.email
    })
    
    const partnerId = registerResult.partner.id
    
    // 立即測試統計 API
    console.log('\\n2. 測試統計 API...')
    
    const statsResponse = await fetch(`${BACKEND_URL}/store/affiliate/partners/${partnerId}/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY
      }
    })
    
    console.log('統計 API 狀態:', statsResponse.status)
    
    if (statsResponse.ok) {
      const statsResult = await statsResponse.json()
      console.log('✅ 統計 API 成功:', statsResult)
    } else {
      const errorText = await statsResponse.text()
      console.log('❌ 統計 API 失敗:', errorText)
    }
    
    // 測試登入
    console.log('\\n3. 測試登入...')
    
    const loginResponse = await fetch(`${BACKEND_URL}/store/affiliate/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY
      },
      body: JSON.stringify({
        email: 'debug-test@example.com',
        password: 'Test123456!'
      })
    })
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json()
      console.log('✅ 登入成功:', {
        id: loginResult.partner.id,
        name: loginResult.partner.name,
        email: loginResult.partner.email
      })
      
      // 用新登入的資料再次測試統計 API
      console.log('\\n4. 用登入後的 ID 再次測試統計 API...')
      
      const statsResponse2 = await fetch(`${BACKEND_URL}/store/affiliate/partners/${loginResult.partner.id}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY
        }
      })
      
      console.log('第二次統計 API 狀態:', statsResponse2.status)
      
      if (statsResponse2.ok) {
        const statsResult2 = await statsResponse2.json()
        console.log('✅ 第二次統計 API 成功:', statsResult2)
      } else {
        const errorText2 = await statsResponse2.text()
        console.log('❌ 第二次統計 API 失敗:', errorText2)
      }
      
    } else {
      const loginError = await loginResponse.text()
      console.log('❌ 登入失敗:', loginError)
    }
    
  } else {
    const registerError = await registerResponse.text()
    console.log('❌ 註冊失敗:', registerError)
  }
}

debugPartners().catch(console.error)
