// 測試前端和後端的完整整合流程
const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'sk_9fedcb4c350478cacf19a37ca3af9aec'

async function testFrontendBackendIntegration() {
  console.log('🚀 === 測試前端後端完整整合 ===\n')
  
  // 1. 註冊新用戶
  console.log('📋 步驟 1: 註冊新用戶')
  const registerResponse = await fetch(`${BACKEND_URL}/store/affiliate/partners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    body: JSON.stringify({
      name: '整合測試用戶',
      email: 'integration-test@example.com',
      password: 'Test123456!',
      phone: '0912345678',
      website: 'https://integration.com'
    })
  })
  
  if (!registerResponse.ok) {
    const error = await registerResponse.text()
    console.log('❌ 註冊失敗:', error)
    return
  }
  
  const registerResult = await registerResponse.json()
  console.log('✅ 註冊成功:', {
    id: registerResult.partner.id,
    name: registerResult.partner.name,
    email: registerResult.partner.email
  })
  
  const partnerId = registerResult.partner.id
  
  // 2. 立即測試統計 API（註冊後）
  console.log('\\n📋 步驟 2: 註冊後立即測試統計 API')
  const statsResponse1 = await fetch(`${BACKEND_URL}/store/affiliate/partners/${partnerId}/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    }
  })
  
  if (statsResponse1.ok) {
    const stats1 = await statsResponse1.json()
    console.log('✅ 註冊後統計 API 成功:', stats1)
  } else {
    const error1 = await statsResponse1.text()
    console.log('❌ 註冊後統計 API 失敗:', error1)
    return
  }
  
  // 3. 模擬前端登入流程
  console.log('\\n📋 步驟 3: 模擬前端登入流程')
  
  // 3.1 登入
  const loginResponse = await fetch(`${BACKEND_URL}/store/affiliate/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    body: JSON.stringify({
      email: 'integration-test@example.com',
      password: 'Test123456!'
    })
  })
  
  if (!loginResponse.ok) {
    const loginError = await loginResponse.text()
    console.log('❌ 登入失敗:', loginError)
    return
  }
  
  const loginResult = await loginResponse.json()
  console.log('✅ 登入成功:', {
    id: loginResult.partner.id,
    name: loginResult.partner.name,
    email: loginResult.partner.email
  })
  
  // 3.2 檢查 ID 是否一致
  console.log('\\n📋 步驟 4: 檢查 Partner ID 一致性')
  console.log('註冊時的 ID:', partnerId)
  console.log('登入後的 ID:', loginResult.partner.id)
  console.log('ID 是否一致:', partnerId === loginResult.partner.id ? '✅ 是' : '❌ 否')
  
  // 3.3 使用登入後的 ID 測試統計 API
  console.log('\\n📋 步驟 5: 使用登入後的 ID 測試統計 API')
  const statsResponse2 = await fetch(`${BACKEND_URL}/store/affiliate/partners/${loginResult.partner.id}/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    }
  })
  
  if (statsResponse2.ok) {
    const stats2 = await statsResponse2.json()
    console.log('✅ 登入後統計 API 成功:', stats2)
  } else {
    const error2 = await statsResponse2.text()
    console.log('❌ 登入後統計 API 失敗:', error2)
  }
  
  // 4. 模擬前端完整流程（包括資料轉換）
  console.log('\\n📋 步驟 6: 模擬前端完整流程（包括資料轉換）')
  
  // 模擬前端的 loginPartner 方法中的資料轉換
  const transformedPartner = {
    id: loginResult.partner.id,
    name: loginResult.partner.name,
    email: loginResult.partner.email,
    phone: loginResult.partner.phone,
    website: loginResult.partner.website,
    referralCode: loginResult.partner.uniqueCode || loginResult.partner.referralCode,
    referral_link: `https://timsfantasyworld.com/tw?ref=${loginResult.partner.uniqueCode || loginResult.partner.referralCode}`,
    status: loginResult.partner.status === 'approved' ? 'active' : loginResult.partner.status,
    commission_rate: loginResult.partner.commissionRate || loginResult.partner.commission_rate || 0.05,
    createdAt: loginResult.partner.createdAt,
    updatedAt: loginResult.partner.updatedAt
  }
  
  console.log('轉換後的合作夥伴資料:', {
    id: transformedPartner.id,
    name: transformedPartner.name,
    referralCode: transformedPartner.referralCode,
    status: transformedPartner.status
  })
  
  // 使用轉換後的 ID 測試統計 API
  const statsResponse3 = await fetch(`${BACKEND_URL}/store/affiliate/partners/${transformedPartner.id}/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    }
  })
  
  if (statsResponse3.ok) {
    const stats3 = await statsResponse3.json()
    console.log('✅ 轉換後統計 API 成功:', stats3)
  } else {
    const error3 = await statsResponse3.text()
    console.log('❌ 轉換後統計 API 失敗:', error3)
  }
  
  console.log('\\n🎉 === 整合測試完成 ===')
}

testFrontendBackendIntegration().catch(console.error)
