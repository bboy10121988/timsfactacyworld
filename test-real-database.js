const fetch = require('node-fetch')

async function testRealDatabaseData() {
  console.log('🧪 測試真實資料庫數據...')
  
  try {
    // 使用實際存在的夥伴ID
    const partnerId = 'aff_partner_013' // 從資料庫中的實際partner_id
    
    const url = `http://localhost:9000/store/affiliate/earnings?partnerId=${partnerId}&page=1&limit=10&type=all&month=all`
    console.log('🔗 API URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'x-publishable-api-key': 'pk_test_123456789' // 添加必要的API key
      }
    })
    
    const data = await response.json()
    
    console.log('📊 結果:')
    console.log('- 狀態碼:', response.status)
    console.log('- 成功:', data.success)
    
    if (data.success && data.data) {
      console.log('- 總筆數:', data.data.total)
      console.log('- 收益列表長度:', data.data.earnings?.length || 0)
      
      // 顯示前3筆收益詳情
      if (data.data.earnings && data.data.earnings.length > 0) {
        console.log('\n📝 收益詳情:')
        data.data.earnings.slice(0, 3).forEach((earning, i) => {
          console.log(`${i + 1}. 訂單ID: ${earning.order_id}`)
          console.log(`   訂單金額: ${earning.order_amount}`)
          console.log(`   傭金金額: ${earning.commission_amount}`)
          console.log(`   狀態: ${earning.status}`)
          console.log(`   日期: ${earning.created_at}`)
          console.log('')
        })
        
        // 計算總金額
        const totalOrderAmount = data.data.earnings.reduce((sum, e) => sum + parseFloat(e.order_amount || 0), 0)
        const totalCommission = data.data.earnings.reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0)
        console.log('📈 統計:')
        console.log(`- 總訂單金額: ${totalOrderAmount}`)
        console.log(`- 總傭金金額: ${totalCommission}`)
      }
    } else {
      console.log('- 錯誤:', data.message || '未知錯誤')
      console.log('- 詳細回應:', JSON.stringify(data, null, 2))
    }
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error.message)
  }
}

testRealDatabaseData()
