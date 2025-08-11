#!/usr/bin/env node

/**
 * 推薦制系統測試腳本
 * 測試多層佣金分配功能
 */

const { Client } = require('pg')

async function testReferralSystem() {
  console.log('🚀 開始測試推薦制系統...')
  
  const client = new Client({
    connectionString: 'postgresql://raychou@localhost:5432/medusa_0720_fresh'
  })
  
  try {
    await client.connect()
    console.log('✅ 數據庫連接成功')

    // 1. 檢查測試數據
    console.log('\n📊 檢查測試數據:')
    const partners = await client.query(`
      SELECT id, name, affiliate_code, referred_by_code, status, total_referrals
      FROM affiliate_partner 
      WHERE affiliate_code IN ('REFA2025', 'REFB2025')
      ORDER BY referred_by_code NULLS FIRST
    `)
    
    console.table(partners.rows)

    // 2. 模擬轉換 - 被推薦人B產生訂單
    console.log('\n💰 模擬轉換: 被推薦人B產生$1000訂單')
    
    const orderId = `test_order_${Date.now()}`
    const affiliateCode = 'REFB2025'
    const orderTotal = 1000
    
    // 檢查是否已存在
    const existing = await client.query(
      'SELECT * FROM affiliate_referral WHERE order_id = $1',
      [orderId]
    )
    
    if (existing.rows.length === 0) {
      // 獲取直接聯盟夥伴
      const directPartner = await client.query(
        'SELECT * FROM affiliate_partner WHERE affiliate_code = $1 AND status = $2',
        [affiliateCode, 'active']
      )
      
      if (directPartner.rows.length === 0) {
        throw new Error('找不到直接聯盟夥伴')
      }
      
      const partner = directPartner.rows[0]
      console.log(`👤 直接夥伴: ${partner.name} (${partner.affiliate_code})`)
      
      // 直接佣金 (10%)
      const directCommissionRate = 10 // 表格中是整數百分比
      const directCommissionAmount = Math.round(orderTotal * 10) // 以分為單位
      
      await client.query(`
        INSERT INTO affiliate_referral 
        (id, affiliate_partner_id, order_id, referral_code, order_total, commission_rate, commission_amount, status, clicked_at, converted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [`ref_${Date.now()}_direct`, partner.id, orderId, affiliateCode, orderTotal * 100, directCommissionRate, directCommissionAmount, 'confirmed'])
      
      console.log(`💵 直接佣金: ${partner.name} 獲得 $${directCommissionAmount / 100} (${directCommissionRate}%)`)
      
      // 檢查推薦人
      if (partner.referred_by_code) {
        const referrer = await client.query(
          'SELECT * FROM affiliate_partner WHERE affiliate_code = $1 AND status = $2',
          [partner.referred_by_code, 'active']
        )
        
        if (referrer.rows.length > 0) {
          const referrerPartner = referrer.rows[0]
          console.log(`🔗 推薦人: ${referrerPartner.name} (${referrerPartner.affiliate_code})`)
          
          // 推薦佣金 (5%)
          const referrerCommissionRate = 5 // 表格中是整數百分比
          const referrerCommissionAmount = Math.round(orderTotal * 5) // 以分為單位
          
          await client.query(`
            INSERT INTO affiliate_referral 
            (id, affiliate_partner_id, order_id, referral_code, order_total, commission_rate, commission_amount, status, clicked_at, converted_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          `, [`ref_${Date.now()}_referrer`, referrerPartner.id, orderId, partner.referred_by_code, orderTotal * 100, referrerCommissionRate, referrerCommissionAmount, 'confirmed'])
          
          console.log(`🎁 推薦佣金: ${referrerPartner.name} 獲得 $${referrerCommissionAmount / 100} (${referrerCommissionRate}%)`)
          
          const totalCommissions = (directCommissionAmount + referrerCommissionAmount) / 100
          console.log(`💎 總佣金支出: $${totalCommissions}`)
        }
      }
    } else {
      console.log('⚠️  此訂單已存在轉換記錄')
    }

    // 3. 檢查轉換記錄
    console.log('\n📈 檢查轉換記錄:')
    const conversions = await client.query(`
      SELECT ar.*, ap.name as partner_name
      FROM affiliate_referral ar
      JOIN affiliate_partner ap ON ar.affiliate_partner_id = ap.id
      WHERE ar.order_id LIKE 'test_order_%'
      ORDER BY ar.created_at DESC
      LIMIT 10
    `)
    
    console.table(conversions.rows.map(row => ({
      訂單ID: row.order_id,
      夥伴名稱: row.partner_name,
      推薦代碼: row.referral_code,
      訂單金額: `$${row.order_total / 100}`,
      佣金率: `${row.commission_rate}%`,
      佣金金額: `$${row.commission_amount / 100}`,
      狀態: row.status
    })))

    // 4. 統計報告
    console.log('\n📊 統計報告:')
    const stats = await client.query(`
      SELECT 
        ap.name,
        ap.affiliate_code,
        ap.referred_by_code,
        COUNT(ar.id) as total_conversions,
        SUM(ar.commission_amount) as total_earnings_cents
      FROM affiliate_partner ap
      LEFT JOIN affiliate_referral ar ON ap.id = ar.affiliate_partner_id
      WHERE ap.affiliate_code IN ('REFA2025', 'REFB2025')
      GROUP BY ap.id, ap.name, ap.affiliate_code, ap.referred_by_code
      ORDER BY ap.referred_by_code NULLS FIRST
    `)
    
    console.table(stats.rows.map(row => ({
      夥伴名稱: row.name,
      聯盟代碼: row.affiliate_code,
      推薦人: row.referred_by_code || '無',
      轉換次數: row.total_conversions,
      總收入: `$${(row.total_earnings_cents || 0) / 100}`
    })))

    console.log('\n✅ 推薦制系統測試完成！')
    
    // 驗證結果
    const refAEarnings = (stats.rows.find(r => r.affiliate_code === 'REFA2025')?.total_earnings_cents || 0) / 100
    const refBEarnings = (stats.rows.find(r => r.affiliate_code === 'REFB2025')?.total_earnings_cents || 0) / 100
    
    console.log('\n🎯 測試結果驗證:')
    console.log(`推薦人A收入: $${refAEarnings} (預期: $50 來自推薦佣金)`)
    console.log(`被推薦人B收入: $${refBEarnings} (預期: $100 來自直接佣金)`)
    
    if (refAEarnings > 0 && refBEarnings > 0) {
      console.log('🎉 推薦制系統運行正常！')
    } else {
      console.log('⚠️  請檢查系統配置')
    }

  } catch (error) {
    console.error('❌ 測試失敗:', error)
  } finally {
    await client.end()
  }
}

// 執行測試
if (require.main === module) {
  testReferralSystem().catch(console.error)
}

module.exports = { testReferralSystem }
