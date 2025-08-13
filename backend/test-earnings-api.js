const { Client } = require('pg')

async function testEarningsAPI() {
  console.log('🧪 測試收益歷史 API 功能...\n')

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

    // 1. 檢查現有的收益數據
    console.log('\n📊 檢查現有收益數據:')
    const existingEarnings = await client.query(`
      SELECT 
        ar.id,
        ar.order_id,
        ar.order_total,
        ar.commission_amount,
        ar.commission_rate,
        ar.status,
        ar.converted_at,
        ap.name as partner_name,
        ap.affiliate_code
      FROM affiliate_referral ar
      JOIN affiliate_partner ap ON ar.affiliate_partner_id = ap.id
      WHERE ar.converted_at IS NOT NULL 
        AND ar.order_id IS NOT NULL
      ORDER BY ar.converted_at DESC
      LIMIT 5
    `)

    if (existingEarnings.rows.length > 0) {
      console.log(`找到 ${existingEarnings.rows.length} 筆現有收益記錄:`)
      existingEarnings.rows.forEach(record => {
        const orderTotal = record.order_total ? (record.order_total / 100).toFixed(2) : '0.00'
        const commission = record.commission_amount ? (record.commission_amount / 100).toFixed(2) : '0.00'
        console.log(`- ${record.partner_name} (${record.affiliate_code}): 訂單 ${record.order_id}, $${orderTotal}, 佣金 $${commission}, 狀態: ${record.status}`)
      })
    } else {
      console.log('❌ 沒有找到現有收益數據')
    }

    // 2. 創建測試收益數據（如果需要）
    const testPartner = await client.query(
      'SELECT * FROM affiliate_partner WHERE affiliate_code = $1 LIMIT 1', 
      ['AF633804XWI7KU']
    )

    if (testPartner.rows.length > 0) {
      console.log('\n🔧 創建測試收益數據:')
      const partnerId = testPartner.rows[0].id
      
      // 創建幾筆測試收益記錄
      const testOrders = [
        { orderId: `test_order_${Date.now()}_1`, amount: 50000, commission: 5000, status: 'confirmed' },
        { orderId: `test_order_${Date.now()}_2`, amount: 30000, commission: 3000, status: 'pending' },
        { orderId: `test_order_${Date.now()}_3`, amount: 75000, commission: 7500, status: 'paid' }
      ]

      for (const order of testOrders) {
        const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
        
        await client.query(`
          INSERT INTO affiliate_referral (
            id, affiliate_partner_id, referral_code, order_id, 
            order_total, commission_rate, commission_amount, status, 
            clicked_at, converted_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW(), NOW())
        `, [
          referralId, 
          partnerId, 
          'AF633804XWI7KU', 
          order.orderId,
          order.amount,
          10, // 10% 佣金率
          order.commission,
          order.status
        ])

        console.log(`✅ 創建測試收益: ${order.orderId}, $${(order.amount/100).toFixed(2)}, 佣金 $${(order.commission/100).toFixed(2)}, 狀態: ${order.status}`)
      }
    }

    // 3. 測試 AffiliateMinimalService 的 getEarningsHistory 方法
    console.log('\n🔍 測試收益歷史查詢功能:')
    
    // 模擬服務查詢
    const earningsQuery = await client.query(`
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
      WHERE ap.affiliate_code = $1
        AND ar.converted_at IS NOT NULL
        AND ar.order_id IS NOT NULL
      ORDER BY ar.converted_at DESC
      LIMIT 10
    `, ['AF633804XWI7KU'])

    console.log(`查詢結果: 找到 ${earningsQuery.rows.length} 筆收益記錄`)
    earningsQuery.rows.forEach((record, index) => {
      const orderTotal = record.order_total ? (record.order_total / 100).toFixed(2) : '0.00'
      const commission = record.commission_amount ? (record.commission_amount / 100).toFixed(2) : '0.00'
      const rate = record.commission_rate ? (record.commission_rate) : 0
      console.log(`${index + 1}. 訂單: ${record.order_id}`)
      console.log(`   金額: $${orderTotal}, 佣金: $${commission} (${rate}%), 狀態: ${record.status}`)
      console.log(`   轉換時間: ${record.converted_at}`)
    })

    // 4. 測試統計數據
    console.log('\n📈 測試收益統計:')
    const statsQuery = await client.query(`
      SELECT 
        COUNT(*) as total_earnings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_earnings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_earnings,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_earnings,
        COALESCE(SUM(commission_amount), 0) as total_commission_cents,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN commission_amount ELSE 0 END), 0) as confirmed_commission_cents,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending_commission_cents
      FROM affiliate_referral ar
      JOIN affiliate_partner ap ON ar.affiliate_partner_id = ap.id
      WHERE ap.affiliate_code = $1
        AND ar.converted_at IS NOT NULL
        AND ar.order_id IS NOT NULL
    `, ['AF633804XWI7KU'])

    if (statsQuery.rows.length > 0) {
      const stats = statsQuery.rows[0]
      console.log('收益統計概覽:')
      console.log(`- 總收益記錄: ${stats.total_earnings}`)
      console.log(`- 已確認: ${stats.confirmed_earnings}`)
      console.log(`- 待處理: ${stats.pending_earnings}`)
      console.log(`- 已支付: ${stats.paid_earnings}`)
      console.log(`- 總佣金: $${(stats.total_commission_cents / 100).toFixed(2)}`)
      console.log(`- 已確認佣金: $${(stats.confirmed_commission_cents / 100).toFixed(2)}`)
      console.log(`- 待處理佣金: $${(stats.pending_commission_cents / 100).toFixed(2)}`)
    }

    console.log('\n🎉 收益API功能測試完成！')

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error)
  } finally {
    await client.end()
    console.log('🔌 資料庫連接已關閉')
  }
}

// 執行測試
testEarningsAPI()
  .then(() => {
    console.log('\n✅ 測試腳本執行完畢')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ 測試腳本執行失敗:', error)
    process.exit(1)
  })
