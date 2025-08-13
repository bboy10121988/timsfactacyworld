// 簡單的登入和 earnings 測試
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'

async function testLoginAndEarnings() {
  console.log('🚀 === 測試登入和收益 API ===')
  
  try {
    // 步驟 1: 登入
    console.log('\n📋 步驟 1: 執行登入')
    const loginResponse = await fetch(`${BACKEND_URL}/store/affiliate/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY
      },
      body: JSON.stringify({
        email: 'ming@example.com',
        password: 'password123'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('✅ 登入成功:', {
      partner_name: loginData.partner.name,
      partner_id: loginData.partner.id,
      token_length: loginData.token ? loginData.token.length : 0
    })
    
    // 步驟 2: 使用 token 獲取收益資料
    console.log('\n📋 步驟 2: 獲取收益資料')
    const earningsResponse = await fetch(`${BACKEND_URL}/store/affiliate/earnings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${loginData.token}`
      }
    })
    
    const earningsData = await earningsResponse.json()
    console.log('✅ 收益資料:', {
      status: earningsResponse.status,
      earnings_count: earningsData.earnings ? earningsData.earnings.length : 0,
      total: earningsData.total,
      sample_earning: earningsData.earnings && earningsData.earnings[0] ? {
        order_id: earningsData.earnings[0].order_id,
        commission_amount: earningsData.earnings[0].commission_amount,
        status: earningsData.earnings[0].status
      } : null
    })
    
    // 步驟 3: 測試 profile API
    console.log('\n📋 步驟 3: 獲取 profile')
    const profileResponse = await fetch(`${BACKEND_URL}/store/affiliate/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${loginData.token}`
      }
    })
    
    const profileData = await profileResponse.json()
    console.log('✅ Profile 資料:', {
      status: profileResponse.status,
      partner_name: profileData.partner ? profileData.partner.name : null,
      partner_code: profileData.partner ? profileData.partner.partner_code : null
    })
    
    console.log('\n🎉 === 所有 API 測試完成 ===')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
  }
}

testLoginAndEarnings()
