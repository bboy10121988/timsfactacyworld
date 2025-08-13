const axios = require('axios');

const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'

async function makeRequest(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY
  }

  return axios({
    url,
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    data: options.body ? JSON.parse(options.body) : options.data,
    timeout: 10000
  })
}

async function testExistingPartner() {
  console.log('=== 測試現有合作夥伴功能 ===\n')

  try {
    // 1. 先嘗試登入測試帳號
    console.log('1. 測試合作夥伴登入...')
    const loginResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/login`, {
      method: 'POST',
      data: {
        email: 'ming@example.com',
        password: 'password123'
      }
    })
    
    console.log('登入結果:', loginResponse.data)
    
    if (loginResponse.data.success && loginResponse.data.partner) {
      const partner = loginResponse.data.partner
      console.log(`✅ 登入成功！合作夥伴: ${partner.name} (ID: ${partner.id})`)
      
      // 2. 測試獲取個人資料
      console.log('\n2. 測試獲取個人資料...')
      const profileResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile?partnerId=${partner.id}`)
      console.log('個人資料結果:', profileResponse.data)
      
      if (profileResponse.data.success) {
        console.log('✅ 成功獲取個人資料')
        
        // 3. 測試更新個人資料
        console.log('\n3. 測試更新個人資料...')
        const updateResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile`, {
          method: 'PUT',
          data: {
            partnerId: partner.id,
            name: partner.name,
            phone: '0987654321',
            website: 'https://updated-website.com',
            socialMedia: '更新的社群媒體',
            address: '更新的地址'
          }
        })
        console.log('更新個人資料結果:', updateResponse.data)
        
        if (updateResponse.data.success) {
          console.log('✅ 個人資料更新成功')
        }
        
        // 4. 測試更新付款資訊
        console.log('\n4. 測試更新付款資訊...')
        const paymentResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/payment`, {
          method: 'PUT',
          data: {
            partnerId: partner.id,
            accountName: '測試帳戶名稱',
            bankCode: '822',
            accountNumber: '1234567890123',
            taxId: '12345678'
          }
        })
        console.log('更新付款資訊結果:', paymentResponse.data)
        
        if (paymentResponse.data.success) {
          console.log('✅ 付款資訊更新成功')
        }

        // 5. 測試統計資料
        console.log('\n5. 測試獲取統計資料...')
        const statsResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/partners/${partner.id}/stats`)
        console.log('統計資料結果:', statsResponse.data)
        
        if (statsResponse.data.success) {
          console.log('✅ 統計資料獲取成功')
        }

      }
    } else {
      console.log('❌ 登入失敗，無法進行進一步測試')
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:')
    if (error.response) {
      console.error('狀態碼:', error.response.status)
      console.error('回應:', error.response.data)
    } else {
      console.error('錯誤:', error.message)
    }
  }
}

testExistingPartner().then(() => {
  console.log('\n=== 測試完成 ===')
}).catch((error) => {
  console.error('測試失敗:', error)
})
