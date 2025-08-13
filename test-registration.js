const BACKEND_URL = 'http://localhost:9000'

async function testRegister() {
  console.log('🧪 測試註冊 API...')
  
  // 生成隨機用戶資料避免重複
  const timestamp = Date.now()
  const testData = {
    name: `測試用戶${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'test123456',
    phone: '0912-345-678',
    website: 'https://test.example.com'
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/store/affiliate/partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'
      },
      body: JSON.stringify(testData)
    })
    
    console.log('📨 註冊響應狀態:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 註冊成功:', result)
      return result.partner
    } else {
      const error = await response.text()
      console.log('❌ 註冊失敗:', error)
    }
  } catch (error) {
    console.error('🚨 註冊請求錯誤:', error)
  }
}

async function checkDatabaseAfterRegistration() {
  console.log('\n🔍 檢查註冊後資料庫狀況...')
  // 這裡可以再次查詢資料庫確認新用戶是否已創建
}

async function main() {
  console.log('=== 測試夥伴註冊功能 ===\n')
  
  const newPartner = await testRegister()
  if (newPartner) {
    console.log(`\n🎉 成功創建新夥伴: ${newPartner.name} (${newPartner.email})`)
    console.log(`📝 Partner ID: ${newPartner.id}`)
    console.log(`🔗 Partner Code: ${newPartner.uniqueCode}`)
  }
  
  await checkDatabaseAfterRegistration()
}

main().catch(console.error)
