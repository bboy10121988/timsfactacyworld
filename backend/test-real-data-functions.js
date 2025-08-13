#!/usr/bin/env node

/**
 * 聯盟系統真實數據功能測試腳本
 * 測試所有真實資料庫功能
 */

const { Client } = require('pg')

async function testRealDataFunctions() {
  console.log('🚀 開始測試聯盟系統真實數據功能...')
  
  const client = new Client({
    connectionString: 'postgresql://raychou@localhost:5432/medusa_0720_fresh'
  })
  
  try {
    await client.connect()
    console.log('✅ 數據庫連接成功')

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
    console.log(`✅ 轉換記錄創建成功: ${conversionId}`)

    // 測試統計查詢
    console.log('\n📈 測試統計查詢:')
    
    // 點擊統計
    const clickStats = await client.query(`
      SELECT 
        affiliate_code,
        COUNT(*) as total_clicks,
        COUNT(CASE WHEN converted = true THEN 1 END) as converted_clicks
      FROM affiliate_click 
      WHERE affiliate_code = 'REFA2025'
      GROUP BY affiliate_code
    `)
    console.log('點擊統計:', clickStats.rows)

    // 轉換統計
    const conversionStats = await client.query(`
      SELECT 
        affiliate_code,
        COUNT(*) as total_conversions,
        SUM(commission_amount) as total_earnings,
        AVG(commission_amount) as avg_commission
      FROM affiliate_conversion 
      WHERE affiliate_code = 'REFA2025'
      GROUP BY affiliate_code
    `)
    console.log('轉換統計:', conversionStats.rows)

    // 測試推薦關係查詢
    console.log('\n🔗 測試推薦關係查詢:')
    const referralQuery = await client.query(`
      SELECT 
        ap.name,
        ap.affiliate_code,
        ap.referred_by_code,
        COUNT(referrals.id) as total_referrals
      FROM affiliate_partner ap
      LEFT JOIN affiliate_partner referrals ON ap.affiliate_code = referrals.referred_by_code
      WHERE ap.affiliate_code IN ('REFA2025', 'REFB2025')
      GROUP BY ap.id, ap.name, ap.affiliate_code, ap.referred_by_code
      ORDER BY ap.referred_by_code NULLS FIRST
    `)
    console.log('推薦關係:', referralQuery.rows)

    // 測試聯合查詢 (點擊->轉換)
    console.log('\n🔍 測試聯合查詢:')
    const joinQuery = await client.query(`
      SELECT 
        ap.name as partner_name,
        ap.affiliate_code,
        COUNT(DISTINCT ac.id) as total_clicks,
        COUNT(DISTINCT conv.id) as total_conversions,
        SUM(conv.commission_amount) as total_earnings
      FROM affiliate_partner ap
      LEFT JOIN affiliate_click ac ON ap.affiliate_code = ac.affiliate_code
      LEFT JOIN affiliate_conversion conv ON ap.affiliate_code = conv.affiliate_code
      WHERE ap.status = 'active'
      GROUP BY ap.id, ap.name, ap.affiliate_code
      HAVING COUNT(DISTINCT ac.id) > 0 OR COUNT(DISTINCT conv.id) > 0
      ORDER BY total_earnings DESC NULLS LAST
    `)
    console.log('聯合統計:', joinQuery.rows)

    // 測試分頁查詢
    console.log('\n📄 測試分頁查詢:')
    const paginatedPartners = await client.query(`
      SELECT id, name, affiliate_code, status, created_at
      FROM affiliate_partner 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5 OFFSET 0
    `)
    console.log('分頁夥伴列表:', paginatedPartners.rows)

    // 測試狀態更新
    console.log('\n✏️  測試狀態更新:')
    await client.query(`
      UPDATE affiliate_conversion 
      SET status = 'approved', updated_at = NOW()
      WHERE id = $1
    `, [conversionId])
    console.log(`✅ 轉換狀態更新成功: ${conversionId}`)

    // 驗證更新
    const updatedConversion = await client.query(`
      SELECT status, updated_at FROM affiliate_conversion WHERE id = $1
    `, [conversionId])
    console.log('更新後的狀態:', updatedConversion.rows[0])

    // 測試複雜的推薦佣金查詢
    console.log('\n🎁 測試推薦佣金查詢:')
    const referralEarnings = await client.query(`
      SELECT 
        referrer.name as referrer_name,
        referrer.affiliate_code as referrer_code,
        referred.name as referred_name,
        referred.affiliate_code as referred_code,
        SUM(conv.commission_amount * 0.5) as potential_referral_earnings
      FROM affiliate_partner referrer
      JOIN affiliate_partner referred ON referrer.affiliate_code = referred.referred_by_code
      LEFT JOIN affiliate_conversion conv ON referred.affiliate_code = conv.affiliate_code
      WHERE conv.status IN ('approved', 'paid')
      GROUP BY referrer.id, referrer.name, referrer.affiliate_code, referred.id, referred.name, referred.affiliate_code
      ORDER BY potential_referral_earnings DESC NULLS LAST
    `)
    console.log('推薦佣金統計:', referralEarnings.rows)

    // 清理測試數據
    console.log('\n🧹 清理測試數據:')
    await client.query('DELETE FROM affiliate_conversion WHERE id = $1', [conversionId])
    await client.query('DELETE FROM affiliate_click WHERE id = $1', [clickId])
    console.log('✅ 測試數據清理完成')

    console.log('\n🎉 所有真實數據功能測試完成！')
    console.log('\n📊 測試結果總結:')
    console.log('✅ 點擊記錄 - 正常')
    console.log('✅ 轉換記錄 - 正常') 
    console.log('✅ 統計查詢 - 正常')
    console.log('✅ 推薦關係 - 正常')
    console.log('✅ 聯合查詢 - 正常')
    console.log('✅ 分頁查詢 - 正常')
    console.log('✅ 狀態更新 - 正常')
    console.log('✅ 推薦佣金 - 正常')

  } catch (error) {
    console.error('❌ 測試失敗:', error)
  } finally {
    await client.end()
  }
}

// 執行測試
if (require.main === module) {
  testRealDataFunctions().catch(console.error)
}

module.exports = { testRealDataFunctions }
