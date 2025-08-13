const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af' // 正確的 publishable key

async function makeRequest(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY
  }

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  })
}

async function testProfileAPI() {
  console.log('=== 測試個人資料 API ===')
  
  try {
    // 1. 測試獲取個人資料 (使用測試合作夥伴 ID)
    console.log('1. 測試獲取個人資料...')
    const getResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile?partnerId=test-partner-id`, {
      method: 'GET'
    })
    
    const getResult = await getResponse.json()
    console.log('獲取個人資料結果:', getResult)
    
    if (!getResult.success) {
      console.log('✅ 預期的錯誤：找不到合作夥伴 (這是正常的，因為使用了測試 ID)')
    }

    // 2. 測試更新個人資料
    console.log('\n2. 測試更新個人資料...')
    const updateResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile`, {
      method: 'PUT',
      body: JSON.stringify({
        partnerId: 'test-partner-id',
        name: '測試名稱',
        phone: '0912345678',
        website: 'https://test.com'
      })
    })
    
    const updateResult = await updateResponse.json()
    console.log('更新個人資料結果:', updateResult)

    // 3. 測試更新密碼
    console.log('\n3. 測試更新密碼...')
    const passwordResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/password`, {
      method: 'PUT',
      body: JSON.stringify({
        partnerId: 'test-partner-id',
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      })
    })
    
    const passwordResult = await passwordResponse.json()
    console.log('更新密碼結果:', passwordResult)

    // 4. 測試更新付款資訊
    console.log('\n4. 測試更新付款資訊...')
    const paymentResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/payment`, {
      method: 'PUT',
      body: JSON.stringify({
        partnerId: 'test-partner-id',
        accountName: '測試帳戶',
        bankCode: '822',
        accountNumber: '1234567890',
        taxId: '12345678'
      })
    })
    
    const paymentResult = await paymentResponse.json()
    console.log('更新付款資訊結果:', paymentResult)

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

async function testWithRealPartner() {
  console.log('\n=== 測試使用真實合作夥伴 ID ===')
  
  try {
    // 先嘗試獲取現有合作夥伴
    console.log('獲取現有合作夥伴列表...')
    const partnersResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/partners`, {
      method: 'GET'
    })
    
    const partnersResult = await partnersResponse.json()
    console.log('合作夥伴列表:', partnersResult)
    
    if (partnersResult.success && partnersResult.partners && partnersResult.partners.length > 0) {
      const firstPartner = partnersResult.partners[0]
      console.log(`\n使用第一個合作夥伴進行測試: ${firstPartner.name} (ID: ${firstPartner.id})`)
      
      // 測試獲取個人資料
      const profileResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile?partnerId=${firstPartner.id}`, {
        method: 'GET'
      })
      
      const profileResult = await profileResponse.json()
      console.log('真實合作夥伴個人資料:', profileResult)
      
      if (profileResult.success) {
        console.log('✅ 成功獲取真實合作夥伴資料')
      }
    } else {
      console.log('⚠️  沒有找到現有合作夥伴，無法測試真實資料')
    }

  } catch (error) {
    console.error('真實合作夥伴測試錯誤:', error)
  }
}

// 執行測試
console.log('開始測試新的 API 端點...\n')

testProfileAPI().then(() => {
  return testWithRealPartner()
}).then(() => {
  console.log('\n=== 測試完成 ===')
}).catch((error) => {
  console.error('測試失敗:', error)
})
