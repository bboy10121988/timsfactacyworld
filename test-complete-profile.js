const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'

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

async function testCompleteProfileUpdate() {
  console.log('=== 測試完整的個人資料更新功能 ===\n')

  try {
    // 1. 先登入獲取合作夥伴 ID
    console.log('1. 登入測試帳號...')
    const loginResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'ming@example.com',
        password: 'password123'
      })
    })
    
    const loginResult = await loginResponse.json()
    
    if (!loginResult.success || !loginResult.partner) {
      console.log('❌ 登入失敗')
      return
    }

    const partnerId = loginResult.partner.id
    console.log(`✅ 登入成功！合作夥伴 ID: ${partnerId}`)

    // 2. 獲取目前的個人資料
    console.log('\n2. 獲取目前的個人資料...')
    const currentProfileResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile?partnerId=${partnerId}`)
    const currentProfile = await currentProfileResponse.json()
    console.log('目前個人資料:', JSON.stringify(currentProfile.partner, null, 2))

    // 3. 更新個人資料 (包含所有新欄位)
    console.log('\n3. 更新個人資料...')
    const updateData = {
      partnerId: partnerId,
      name: '小明的購物分享 (已更新)',
      phone: '0988777666',
      website: 'https://ming-shopping.blog.tw',
      socialMedia: 'Instagram: @ming_shopping, Facebook: 小明購物分享',
      address: '台北市信義區信義路五段7號101樓'
    }

    console.log('更新資料:', updateData)

    const updateResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    const updateResult = await updateResponse.json()
    console.log('更新結果:', JSON.stringify(updateResult, null, 2))

    // 4. 再次獲取個人資料驗證
    console.log('\n4. 驗證更新結果...')
    const finalProfileResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile?partnerId=${partnerId}`)
    const finalProfile = await finalProfileResponse.json()
    console.log('最終個人資料:', JSON.stringify(finalProfile.partner, null, 2))

    // 5. 更新付款資訊
    console.log('\n5. 更新付款資訊...')
    const paymentUpdateData = {
      partnerId: partnerId,
      accountName: '王小明',
      bankCode: '822',
      accountNumber: '1234567890123456',
      taxId: 'A123456789'
    }

    console.log('付款更新資料:', paymentUpdateData)

    const paymentResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/payment`, {
      method: 'PUT',
      body: JSON.stringify(paymentUpdateData)
    })
    
    const paymentResult = await paymentResponse.json()
    console.log('付款更新結果:', JSON.stringify(paymentResult, null, 2))

    // 6. 最終驗證所有資料
    console.log('\n6. 最終驗證所有資料...')
    const verificationResponse = await makeRequest(`${BACKEND_URL}/store/affiliate/profile?partnerId=${partnerId}`)
    const verification = await verificationResponse.json()
    console.log('最終驗證結果:', JSON.stringify(verification.partner, null, 2))

    // 檢查哪些欄位成功更新了
    const partner = verification.partner
    console.log('\n=== 更新狀態檢查 ===')
    console.log('姓名:', partner.name || '❌ 未更新')
    console.log('電話:', partner.phone || '❌ 未更新')
    console.log('網站:', partner.website || '❌ 未更新')
    console.log('社交媒體:', partner.socialMedia || '❌ 未更新')
    console.log('地址:', partner.address || '❌ 未更新')
    console.log('帳戶名稱:', partner.accountName || '❌ 未更新')
    console.log('銀行代碼:', partner.bankCode || '❌ 未更新')
    console.log('帳號:', partner.accountNumber || '❌ 未更新')
    console.log('統一編號:', partner.taxId || '❌ 未更新')

    console.log('\n✅ 完整測試完成！')

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

testCompleteProfileUpdate()
