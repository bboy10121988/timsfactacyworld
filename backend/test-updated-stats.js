const { Client } = require('pg')

async function testUpdatedStats() {
  console.log('🧪 測試更新後的統計功能...\n')

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

    const affiliateCode = 'AF633804XWI7KU'

    // 1. 獲取夥伴ID
    const partnerQuery = await client.query(
      'SELECT * FROM affiliate_partner WHERE affiliate_code = $1',
      [affiliateCode]
    )

    if (partnerQuery.rows.length === 0) {
      console.log('❌ 找不到測試夥伴')
      return
    }

    const partner = partnerQuery.rows[0]
    const partnerId = partner.id

    console.log(`\n👤 測試夥伴: ${partner.name} (${affiliateCode})`)

    // 2. 基礎統計 - 點擊數
    const clicksQuery = await client.query(`
      SELECT COUNT(*) as count
      FROM affiliate_referral
      WHERE affiliate_partner_id = $1
        AND clicked_at IS NOT NULL
    `, [partnerId])
    
    const totalClicks = parseInt(clicksQuery.rows[0].count)
    console.log(`📊 總點擊數: ${totalClicks}`)

    // 3. 轉換統計
    const conversionsQuery = await client.query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(commission_amount), 0) as total_earnings
      FROM affiliate_referral
      WHERE affiliate_partner_id = $1
        AND converted_at IS NOT NULL
    `, [partnerId])

    const totalConversions = parseInt(conversionsQuery.rows[0].count)
    const totalEarnings = parseFloat(conversionsQuery.rows[0].total_earnings) / 100
    console.log(`💰 總轉換數: ${totalConversions}`)
    console.log(`💵 總收益: $${totalEarnings.toFixed(2)}`)

    // 4. 待處理佣金
    const pendingQuery = await client.query(`
      SELECT COALESCE(SUM(commission_amount), 0) as pending_earnings
      FROM affiliate_referral
      WHERE affiliate_partner_id = $1
        AND status = 'pending'
        AND converted_at IS NOT NULL
    `, [partnerId])

    const pendingEarnings = parseFloat(pendingQuery.rows[0].pending_earnings) / 100
    console.log(`⏳ 待處理佣金: $${pendingEarnings.toFixed(2)}`)

    // 5. 本月佣金
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)
    
    const thisMonthQuery = await client.query(`
      SELECT COALESCE(SUM(commission_amount), 0) as month_earnings
      FROM affiliate_referral
      WHERE affiliate_partner_id = $1
        AND status = 'confirmed'
        AND converted_at >= $2
        AND converted_at IS NOT NULL
    `, [partnerId, thisMonthStart.toISOString()])

    const thisMonthEarnings = parseFloat(thisMonthQuery.rows[0].month_earnings) / 100
    console.log(`📅 本月佣金: $${thisMonthEarnings.toFixed(2)}`)

    // 6. 轉換率計算
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    console.log(`📈 轉換率: ${conversionRate.toFixed(2)}%`)

    // 7. 詳細收益狀態分布
    const statusQuery = await client.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(commission_amount), 0) as total_amount
      FROM affiliate_referral
      WHERE affiliate_partner_id = $1
        AND converted_at IS NOT NULL
      GROUP BY status
      ORDER BY status
    `, [partnerId])

    console.log('\n📋 收益狀態分布:')
    statusQuery.rows.forEach(row => {
      const amount = parseFloat(row.total_amount) / 100
      console.log(`- ${row.status}: ${row.count} 筆, 總計 $${amount.toFixed(2)}`)
    })

    // 8. 模擬完整的統計響應格式
    console.log('\n🔄 完整統計響應格式:')
    const statsResponse = {
      totalClicks,
      totalConversions,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      pendingEarnings: Math.round(pendingEarnings * 100) / 100,
      thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      // 可以添加其他統計數據
      totalCommissions: Math.round(totalEarnings * 100) / 100,
      monthlyCommissions: Math.round(thisMonthEarnings * 100) / 100,
      totalReferrals: 0 // 這裡可以添加推薦統計
    }

    console.log(JSON.stringify(statsResponse, null, 2))

    console.log('\n✅ 統計功能測試完成！')

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error)
  } finally {
    await client.end()
    console.log('🔌 資料庫連接已關閉')
  }
}

// 執行測試
testUpdatedStats()
  .then(() => {
    console.log('\n🎉 統計功能測試成功完成！')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ 測試失敗:', error)
    process.exit(1)
  })
