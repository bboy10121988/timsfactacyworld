// 測試前端登入 API 調用
const BACKEND_URL = 'http://localhost:9000'
const PUBLISHABLE_KEY = 'sk_9fedcb4c350478cacf19a37ca3af9aec'

async function testFrontendLogin() {
  console.log('=== 測試前端登入流程 ===')
  
  // 模擬前端 affiliateAPI.loginPartner 調用
  const url = `${BACKEND_URL}/store/affiliate/login`
  
  const requestData = {
    email: 'testuser2024@example.com',
    password: 'Test123456!'
  }
  
  console.log('發送請求到:', url)
  console.log('請求資料:', requestData)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY
      },
      body: JSON.stringify(requestData)
    })
    
    console.log('回應狀態:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 錯誤回應:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('API 成功回應:', result)
    
    if (result.success && result.partner) {
      console.log('✅ 登入成功！')
      console.log('合作夥伴資料:', result.partner)
      console.log('JWT Token:', result.token)
      
      // 測試 getAllPartners 調用（模擬 getProfile 中的調用）
      console.log('\n=== 測試獲取所有合作夥伴（模擬 getProfile） ===')
      const partnersResponse = await fetch(`${BACKEND_URL}/store/affiliate/partners?email=${encodeURIComponent(result.partner.email)}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY
        }
      })
      
      if (partnersResponse.ok) {
        const partnersResult = await partnersResponse.json()
        console.log('合作夥伴檢查結果:', partnersResult)
      } else {
        console.error('合作夥伴檢查失敗:', await partnersResponse.text())
      }
      
    } else {
      console.error('❌ 登入失敗:', result.message)
    }
    
  } catch (error) {
    console.error('請求錯誤:', error)
  }
}

// 執行測試
testFrontendLogin()
