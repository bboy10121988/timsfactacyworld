const { Client } = require('pg')

async function testRealDataFunctions() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'medusa_0525',
    user: 'raychou',
    password: '1012'
  })

  try {
    console.log('🔌 連接到 PostgreSQL 資料庫...')
    await client.connect()
    console.log('✅ 資料庫連接成功')

    // 查詢現有表結構
    console.log('\n📋 查詢資料庫表結構:')
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'affiliate%'
      ORDER BY table_name
    `)
    console.log('找到的 affiliate 相關表:')
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`)
    })

    // 查詢夥伴數據
    console.log('\n👥 查詢夥伴數據:')
    const partners = await client.query('SELECT * FROM affiliate_partner LIMIT 5')
    console.log(`找到 ${partners.rows.length} 位夥伴:`)
    partners.rows.forEach(partner => {
      console.log(`- ${partner.name} (${partner.affiliate_code}) - 狀態: ${partner.status}`)
    })

    // 查詢推薦記錄
    console.log('\n📈 查詢推薦記錄:')
    const referrals = await client.query('SELECT * FROM affiliate_referral ORDER BY created_at DESC LIMIT 10')
    console.log(`找到 ${referrals.rows.length} 筆推薦記錄:`)
    referrals.rows.forEach(ref => {
      const orderTotal = ref.order_total ? (ref.order_total / 100).toFixed(2) : '0.00'
      const commissionAmount = ref.commission_amount ? (ref.commission_amount / 100).toFixed(2) : '0.00'
      console.log(`- ${ref.referral_code}: $${orderTotal} (佣金: $${commissionAmount}) - ${ref.status}`)
    })

    // 測試點擊記錄
    console.log('\n📊 測試點擊記錄功能:')
    const clickId = `click_test_${Date.now()}`
    
    // 獲取測試夥伴
    const testPartner = await client.query('SELECT * FROM affiliate_partner WHERE affiliate_code = $1 LIMIT 1', ['REFA2025'])
    if (testPartner.rows.length === 0) {
      console.log('❌ 沒有找到測試夥伴，跳過點擊測試')
    } else {
      const partnerId = testPartner.rows[0].id
      await client.query(`
        INSERT INTO affiliate_referral (id, affiliate_partner_id, referral_code, ip_address, user_agent, status, clicked_at, order_total, commission_amount, commission_rate, created_at, updated_at)
        VALUES ($1, $2, 'REFA2025', '127.0.0.1', 'test-agent', 'pending', NOW(), 0, 0, 0, NOW(), NOW())
      `, [clickId, partnerId])
      console.log(`✅ 點擊記錄創建成功: ${clickId}`)
    }

    // 測試轉換記錄
    console.log('\n💰 測試轉換記錄功能:')
    const referralId = `ref_test_${Date.now()}`
    const orderId = `order_test_${Date.now()}`
    
    if (testPartner.rows.length > 0) {
      const partnerId = testPartner.rows[0].id
      await client.query(`
        INSERT INTO affiliate_referral (id, affiliate_partner_id, referral_code, order_id, order_total, commission_rate, commission_amount, status, clicked_at, converted_at, created_at, updated_at)
        VALUES ($1, $2, 'REFA2025', $3, 50000, 10, 5000, 'pending', NOW(), NOW(), NOW(), NOW())
      `, [referralId, partnerId, orderId])
      console.log(`✅ 轉換記錄創建成功: ${referralId}`)
    }

    // 測試統計查詢
    console.log('\n📈 測試統計查詢:')
    
    // 推薦統計
    const referralStats = await client.query(`
      SELECT 
        ar.referral_code,
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN ar.order_id IS NOT NULL THEN 1 END) as converted_referrals,
        COALESCE(SUM(ar.commission_amount), 0) as total_earnings_cents,
        COALESCE(AVG(ar.commission_amount), 0) as avg_commission_cents
      FROM affiliate_referral ar
      WHERE ar.referral_code = 'REFA2025'
      GROUP BY ar.referral_code
    `)
    
    if (referralStats.rows.length > 0) {
      const stats = referralStats.rows[0]
      console.log('推薦統計:')
      console.log(`- 總推薦數: ${stats.total_referrals}`)
      console.log(`- 轉換數: ${stats.converted_referrals}`)
      console.log(`- 總收益: $${(stats.total_earnings_cents / 100).toFixed(2)}`)
      console.log(`- 平均佣金: $${(stats.avg_commission_cents / 100).toFixed(2)}`)
    } else {
      console.log('沒有找到推薦統計數據')
    }

    // 測試推薦關係查詢
    console.log('\n🔗 測試推薦關係查詢:')
    const referralQuery = await client.query(`
      SELECT 
        ap.name as partner_name,
        ap.affiliate_code,
        ap.commission_rate,
        ap.status as partner_status,
        ar.id as referral_id,
        ar.order_id,
        ar.order_total,
        ar.commission_amount,
        ar.status as referral_status,
        ar.clicked_at,
        ar.converted_at
      FROM affiliate_partner ap
      LEFT JOIN affiliate_referral ar ON ap.id = ar.affiliate_partner_id
      WHERE ap.affiliate_code = 'REFA2025'
      ORDER BY ar.created_at DESC
      LIMIT 10
    `)
    
    console.log(`找到 ${referralQuery.rows.length} 筆推薦關係記錄:`)
    referralQuery.rows.forEach(record => {
      if (record.referral_id) {
        const orderTotal = record.order_total ? (record.order_total / 100).toFixed(2) : '0.00'
        const commissionAmount = record.commission_amount ? (record.commission_amount / 100).toFixed(2) : '0.00'
        console.log(`- 夥伴: ${record.partner_name} | 訂單: ${record.order_id || 'N/A'} | 金額: $${orderTotal} | 佣金: $${commissionAmount}`)
      } else {
        console.log(`- 夥伴: ${record.partner_name} | 尚無推薦記錄`)
      }
    })

    // 測試佣金狀態更新
    console.log('\n💳 測試佣金狀態更新:')
    const pendingCommissions = await client.query(`
      SELECT id, commission_amount, status 
      FROM affiliate_referral 
      WHERE status = 'pending' AND commission_amount > 0
      LIMIT 1
    `)
    
    if (pendingCommissions.rows.length > 0) {
      const commission = pendingCommissions.rows[0]
      await client.query(`
        UPDATE affiliate_referral 
        SET status = 'confirmed', updated_at = NOW()
        WHERE id = $1
      `, [commission.id])
      console.log(`✅ 佣金狀態更新成功: ${commission.id} -> confirmed`)
    } else {
      console.log('沒有找到待處理的佣金記錄')
    }

    // 測試夥伴驗證功能
    console.log('\n✅ 測試夥伴驗證功能:')
    const validPartner = await client.query(`
      SELECT id, name, affiliate_code, status, commission_rate
      FROM affiliate_partner 
      WHERE affiliate_code = $1 AND status = 'approved'
      LIMIT 1
    `, ['REFA2025'])
    
    if (validPartner.rows.length > 0) {
      const partner = validPartner.rows[0]
      console.log(`✅ 夥伴驗證成功: ${partner.name} (${partner.affiliate_code})`)
      console.log(`- 狀態: ${partner.status}`)
      console.log(`- 佣金率: ${partner.commission_rate}%`)
    } else {
      console.log('❌ 夥伴驗證失敗或夥伴未核准')
    }

    // 查詢支付記錄
    console.log('\n💰 查詢支付記錄:')
    const payments = await client.query('SELECT * FROM affiliate_payment ORDER BY created_at DESC LIMIT 5')
    console.log(`找到 ${payments.rows.length} 筆支付記錄:`)
    payments.rows.forEach(payment => {
      const amount = payment.amount ? (payment.amount / 100).toFixed(2) : '0.00'
      console.log(`- 夥伴ID: ${payment.affiliate_partner_id} | 金額: $${amount} | 狀態: ${payment.status}`)
    })

    console.log('\n🎉 所有真實數據功能測試完成!')

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error)
  } finally {
    await client.end()
    console.log('🔌 資料庫連接已關閉')
  }
}

// 執行測試
testRealDataFunctions()
  .then(() => {
    console.log('\n✅ 測試腳本執行完畢')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ 測試腳本執行失敗:', error)
    process.exit(1)
  })
