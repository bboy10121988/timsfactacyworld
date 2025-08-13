const { Client } = require('pg')

// 模擬 AffiliateMinimalService 的 getEarningsHistory 方法
async function testServiceDirectly() {
  console.log('🧪 直接測試 AffiliateMinimalService.getEarningsHistory 方法...\n')

  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'medusa_0525',
    user: 'raychou',
    password: '1012'
  })

  try {
    await client.connect()
    console.log('✅ 資料庫連接成功')

    // 模擬 getEarningsHistory 方法的邏輯
    const affiliateCode = 'AF633804XWI7KU'
    const page = 1
    const limit = 10
    const offset = (page - 1) * limit

    console.log(`\n📊 查詢收益歷史: ${affiliateCode}, 第 ${page} 頁, 每頁 ${limit} 筆`)

    // 主查詢 - 獲取收益記錄
    const earningsQuery = `
      SELECT 
        ar.id,
        ar.order_id,
        ar.order_total,
        ar.commission_amount,
        ar.commission_rate,
        ar.status,
        ar.converted_at,
        ar.created_at,
        ap.name as partner_name,
        ap.affiliate_code
      FROM affiliate_referral ar
      JOIN affiliate_partner ap ON ar.affiliate_partner_id = ap.id
      WHERE ar.converted_at IS NOT NULL 
        AND ar.order_id IS NOT NULL
        AND ap.affiliate_code = $1
      ORDER BY ar.converted_at DESC
      LIMIT $2 OFFSET $3
    `

    const earnings = await client.query(earningsQuery, [affiliateCode, limit, offset])

    console.log(`✅ 找到 ${earnings.rows.length} 筆收益記錄`)

    // 轉換數據格式（模擬服務方法的轉換邏輯）
    const formattedEarnings = earnings.rows.map((earning, index) => ({
      id: earning.id,
      partnerId: earning.affiliate_partner_id,
      orderId: earning.order_id,
      orderNumber: `TIM${earning.order_id}`, // 生成訂單號格式
      customerEmail: 'customer@example.com', // 此處可能需要從訂單表JOIN獲取
      productName: '商品名稱', // 此處可能需要從訂單表JOIN獲取
      orderAmount: earning.order_total ? Math.round(earning.order_total) : 0, // 以分為單位
      commissionAmount: earning.commission_amount ? Math.round(earning.commission_amount) : 0, // 以分為單位
      commissionRate: earning.commission_rate ? earning.commission_rate / 100 : 0, // 轉為小數
      status: earning.status,
      createdAt: earning.converted_at || earning.created_at,
      paidAt: earning.status === 'paid' ? earning.converted_at : undefined
    }))

    console.log('\n🎯 格式化後的收益記錄:')
    formattedEarnings.forEach((earning, index) => {
      console.log(`${index + 1}. 訂單: ${earning.orderNumber}`)
      console.log(`   ID: ${earning.id}`)
      console.log(`   金額: $${(earning.orderAmount / 100).toFixed(2)}`)
      console.log(`   佣金: $${(earning.commissionAmount / 100).toFixed(2)} (${(earning.commissionRate * 100)}%)`)
      console.log(`   狀態: ${earning.status}`)
      console.log(`   時間: ${earning.createdAt}`)
      if (earning.paidAt) {
        console.log(`   支付時間: ${earning.paidAt}`)
      }
      console.log('')
    })

    // 計算總數查詢
    const countQuery = `
      SELECT COUNT(*) as total
      FROM affiliate_referral ar
      JOIN affiliate_partner ap ON ar.affiliate_partner_id = ap.id
      WHERE ar.converted_at IS NOT NULL 
        AND ar.order_id IS NOT NULL
        AND ap.affiliate_code = $1
    `

    const countResult = await client.query(countQuery, [affiliateCode])
    const total = parseInt(countResult.rows[0].total)

    console.log(`📈 總計: ${total} 筆收益記錄`)
    console.log(`📄 總頁數: ${Math.ceil(total / limit)}`)

    // 模擬 API 響應格式
    const apiResponse = {
      success: true,
      data: {
        earnings: formattedEarnings,
        total: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    }

    console.log('\n🔄 API 響應格式預覽:')
    console.log(JSON.stringify(apiResponse, null, 2))

    console.log('\n✅ 服務方法測試完成！')

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error)
  } finally {
    await client.end()
    console.log('🔌 資料庫連接已關閉')
  }
}

// 執行測試
testServiceDirectly()
  .then(() => {
    console.log('\n🎉 收益歷史服務測試成功完成！')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ 測試失敗:', error)
    process.exit(1)
  })
