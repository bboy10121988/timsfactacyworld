#!/usr/bin/env node

// 測試聯盟夥伴註冊 API
const testRegistration = async () => {
  const testData = {
    name: "測試用戶",
    email: "test@example.com",
    phone: "0912345678",
    company: "測試公司"
  }

  try {
    console.log('正在測試聯盟夥伴註冊 API...')
    console.log('測試資料:', testData)

    const response = await fetch('http://localhost:9000/store/affiliate/partners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('回應狀態:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('錯誤回應:', errorText)
      return
    }

    const result = await response.json()
    console.log('成功回應:', JSON.stringify(result, null, 2))

  } catch (error) {
    console.error('測試失敗:', error.message)
  }
}

testRegistration()
