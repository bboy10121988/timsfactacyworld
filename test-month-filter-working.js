const fetch = require('node-fetch')

async function testMonthFilter() {
  console.log('🧪 測試月份篩選功能...')
  
  try {
    const partnerId = '8bec60a4-ac3c-47af-b2e4-f2b9cfad5b19' // 測試用夥伴ID
    
    // 測試不同月份
    const testCases = [
      { month: 'all', description: '全部月份' },
      { month: '2025-08', description: '2025年8月' },
      { month: '2025-07', description: '2025年7月' },
      { month: '2024-12', description: '2024年12月' }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n📅 測試 ${testCase.description}...`)
      
      const url = `http://localhost:9000/store/affiliate/earnings?partnerId=${partnerId}&page=1&limit=5&type=all&month=${testCase.month}`
      console.log('🔗 API URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('📊 結果:')
      console.log('- 狀態碼:', response.status)
      console.log('- 成功:', data.success)
      
      if (data.success && data.data) {
        console.log('- 總筆數:', data.data.total)
        console.log('- 當前頁筆數:', data.data.earnings?.length || 0)
        console.log('- 總頁數:', data.data.totalPages)
        
        // 顯示第一筆記錄的詳情
        if (data.data.earnings && data.data.earnings.length > 0) {
          const firstEarning = data.data.earnings[0]
          console.log('- 第一筆記錄:')
          console.log('  - 日期:', firstEarning.created_at)
          console.log('  - 金額:', firstEarning.commission_amount)
          console.log('  - 狀態:', firstEarning.status)
        }
      } else {
        console.log('- 錯誤:', data.message || '未知錯誤')
      }
    }
    
    console.log('\n✅ 月份篩選測試完成!')
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error.message)
  }
}

testMonthFilter()
