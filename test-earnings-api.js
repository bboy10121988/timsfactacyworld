const BACKEND_URL = 'http://localhost:9000'

async function testEarningsAPI() {
  console.log('🧪 測試收益 API...\n')
  
  // 測試獲取小明的收益記錄
  const partnerId = 'aff_001' // 小明的 ID
  
  try {
    const response = await fetch(`${BACKEND_URL}/store/affiliate/earnings?partnerId=${partnerId}&page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'
      }
    })
    
    console.log('📡 API 響應狀態:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API 響應成功:')
      console.log('  - 收益記錄數量:', result.data?.earnings?.length || 0)
      console.log('  - 總記錄數:', result.data?.total || 0)
      console.log('  - 總頁數:', result.data?.totalPages || 0)
      
      if (result.data?.earnings?.length > 0) {
        console.log('\n📋 收益記錄範例:')
        result.data.earnings.forEach((earning, index) => {
          console.log(`  ${index + 1}. 訂單 ${earning.orderNumber}`)
          console.log(`     - 訂單金額: $${earning.orderAmount}`)
          console.log(`     - 佣金金額: $${earning.commissionAmount}`)
          console.log(`     - 狀態: ${earning.status}`)
          console.log(`     - 時間: ${earning.createdAt}`)
        })
      }
      
      return result.data
    } else {
      const error = await response.text()
      console.log('❌ API 錯誤:', error)
    }
  } catch (error) {
    console.error('🚨 請求錯誤:', error.message)
  }
}

async function testPartnerStats() {
  console.log('\n📊 測試合作夥伴統計...\n')
  
  try {
    // 測試獲取小明的資料
    const response = await fetch(`${BACKEND_URL}/store/affiliate/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af'
      }
    })
    
    console.log('📡 Profile API 狀態:', response.status)
    
    if (response.status === 401) {
      console.log('🔐 需要認證 - 這是正常的')
    } else if (response.ok) {
      const profile = await response.json()
      console.log('✅ Profile 資料:', profile)
    }
    
  } catch (error) {
    console.error('🚨 Profile 請求錯誤:', error.message)
  }
}

async function main() {
  console.log('=== 🔍 收益系統測試 ===\n')
  
  await testEarningsAPI()
  await testPartnerStats()
  
  console.log('\n🎉 測試完成！')
}

main().catch(console.error)
