// 清理並重新測試完整的 affiliate 流程
const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'sk_9fedcb4c350478cacf19a37ca3af9aec'

async function testCompleteAffiliateFlow() {
  console.log('🧹 === 清理並重新測試 Affiliate 流程 ===\n')
  
  // 1. 註冊一個全新的測試用戶
  console.log('📋 步驟 1: 註冊全新的測試用戶')
  
  // 使用時間戳確保郵箱唯一性
  const timestamp = Date.now()
  const testEmail = `fresh-test-${timestamp}@example.com`
  
  const registerResponse = await fetch(`${BACKEND_URL}/store/affiliate/partners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    body: JSON.stringify({
      name: '全新測試用戶',
      email: testEmail,
      password: 'Test123456!',
      phone: '0987654321',
      website: 'https://fresh-test.com'
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
    email: registerResult.partner.email,
    uniqueCode: registerResult.partner.uniqueCode
  })
  
  const partnerId = registerResult.partner.id
  const uniqueCode = registerResult.partner.uniqueCode
  
  // 2. 驗證推薦連結格式
  console.log('\\n📋 步驟 2: 驗證推薦連結格式')
  const expectedReferralLink = `http://localhost:8000/tw?ref=${uniqueCode}`
  console.log('推薦代碼:', uniqueCode)
  console.log('推薦連結:', expectedReferralLink)
  console.log('代碼格式檢查:', /^[A-Z0-9]{12,20}$/.test(uniqueCode) ? '✅ 符合格式' : '❌ 格式異常')
  
  // 3. 測試登入並檢查資料轉換
  console.log('\\n📋 步驟 3: 測試登入和資料轉換')
  
  const loginResponse = await fetch(`${BACKEND_URL}/store/affiliate/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'Test123456!'
    })
  })
  
  if (!loginResponse.ok) {
    const loginError = await loginResponse.text()
    console.log('❌ 登入失敗:', loginError)
    return
  }
  
  const loginResult = await loginResponse.json()
  console.log('✅ 登入成功，後端原始資料:', {
    id: loginResult.partner.id,
    uniqueCode: loginResult.partner.uniqueCode,
    status: loginResult.partner.status,
    commissionRate: loginResult.partner.commissionRate
  })
  
  // 模擬前端資料轉換
  const transformedPartner = {
    id: loginResult.partner.id,
    name: loginResult.partner.name,
    email: loginResult.partner.email,
    phone: loginResult.partner.phone,
    website: loginResult.partner.website,
    referralCode: loginResult.partner.uniqueCode || loginResult.partner.referralCode,
    referral_link: `http://localhost:8000/tw?ref=${loginResult.partner.uniqueCode || loginResult.partner.referralCode}`,
    status: loginResult.partner.status === 'approved' ? 'active' : loginResult.partner.status,
    commission_rate: loginResult.partner.commissionRate || loginResult.partner.commission_rate || 0.05,
    createdAt: loginResult.partner.createdAt,
    updatedAt: loginResult.partner.updatedAt
  }
  
  console.log('✅ 前端轉換後資料:', {
    id: transformedPartner.id,
    referralCode: transformedPartner.referralCode,
    referral_link: transformedPartner.referral_link,
    status: transformedPartner.status
  })
  
  // 4. 測試統計 API
  console.log('\\n📋 步驟 4: 測試統計 API')
  
  const statsResponse = await fetch(`${BACKEND_URL}/store/affiliate/partners/${transformedPartner.id}/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    }
  })
  
  if (statsResponse.ok) {
    const stats = await statsResponse.json()
    console.log('✅ 統計 API 成功:', stats.stats)
  } else {
    const statsError = await statsResponse.text()
    console.log('❌ 統計 API 失敗:', statsError)
  }
  
  // 5. 提供前端測試指示
  console.log('\\n📋 步驟 5: 前端測試指示')
  console.log('🌟 請在瀏覽器中使用以下測試帳號:')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🔐 Password: Test123456!`)
  console.log('🔗 推薦連結:', expectedReferralLink)
  console.log('\\n💡 建議操作步驟:')
  console.log('1. 打開 http://localhost:8000/tw/affiliate')
  console.log('2. 清除瀏覽器 localStorage (F12 → Application → Local Storage → Clear All)')
  console.log('3. 重新整理頁面')
  console.log('4. 使用上述測試帳號登入')
  console.log('5. 檢查是否還有統計 API 錯誤')
  
  console.log('\\n🎉 === 測試完成 ===')
}

testCompleteAffiliateFlow().catch(console.error)
