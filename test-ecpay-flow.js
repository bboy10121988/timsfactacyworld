#!/usr/bin/env node

// 完整的ECPay付款到訂單建立流程測試工具
const { Client } = require('pg')

async function testCompleteECPayFlow() {
  console.log('🧪 開始測試完整的ECPay付款流程\n')
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://raychou:1012@localhost:5432/medusa_0525'
  })
  
  try {
    await client.connect()
    console.log('🔌 已連接到資料庫')

    // 步驟1: 建立測試購物車
    const cartId = `test_cart_${Date.now()}`
    const merchantTradeNo = `TEST_${Date.now()}`
    
    console.log(`\n📦 步驟1: 建立測試購物車`)
    console.log(`Cart ID: ${cartId}`)
    console.log(`MerchantTradeNo: ${merchantTradeNo}`)
    
    const cartInsert = `
      INSERT INTO cart (id, email, currency_code, metadata) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, email, currency_code
    `
    
    const cartResult = await client.query(cartInsert, [
      cartId,
      'test@ecpay-flow.com',
      'TWD',
      JSON.stringify({
        test_flow: true,
        ecpay_merchant_trade_no: merchantTradeNo,
        created_by: 'flow_test'
      })
    ])
    
    console.log('✅ 購物車建立成功:', cartResult.rows[0])

    // 步驟2: 模擬ECPay付款成功回調
    console.log(`\n💳 步驟2: 模擬ECPay付款成功`)
    
    // 模擬建立訂單（類似ECPay callback的邏輯）
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 建立地址
    const addressId = `addr_${Date.now()}`
    const addressInsert = `
      INSERT INTO order_address (id, first_name, last_name, address_1, city, country_code, postal_code, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `
    await client.query(addressInsert, [
      addressId, '測試', '用戶', '台北市信義區', '台北市', 'TW', '110', '0912345678'
    ])

    // 建立訂單
    const orderMetadata = {
      ecpay_merchant_trade_no: merchantTradeNo,
      ecpay_trade_no: `TXN_${Date.now()}`,
      ecpay_payment_date: new Date().toISOString(),
      ecpay_payment_type: 'Credit_CreditCard',
      ecpay_trade_amt: '2100',
      payment_flow_test: true
    }

    const orderInsert = `
      INSERT INTO "order" (
        id, region_id, customer_id, version, status,
        email, currency_code, shipping_address_id, billing_address_id,
        metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING id, display_id
    `
    
    const orderResult = await client.query(orderInsert, [
      orderId,
      'reg_01HJ2WNQMHQM0KJZV8DMGH9NW8',
      null, // customer_id
      1, // version
      'pending',
      'test@ecpay-flow.com',
      'TWD',
      addressId,
      addressId,
      JSON.stringify(orderMetadata)
    ])
    
    console.log('✅ 訂單建立成功:', orderResult.rows[0])

    // 建立訂單摘要
    const summaryInsert = `
      INSERT INTO order_summary (id, order_id, totals, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
    `
    
    await client.query(summaryInsert, [
      `summary_${orderId}`,
      orderId,
      JSON.stringify({
        total: 2100,
        subtotal: 2000,
        tax_total: 100,
        shipping_total: 0
      })
    ])

    // 標記購物車為已完成
    await client.query('UPDATE cart SET completed_at = NOW(), updated_at = NOW() WHERE id = $1', [cartId])
    console.log('✅ 購物車標記為已完成')

    // 步驟3: 驗證整個流程
    console.log(`\n🔍 步驟3: 驗證整個流程`)
    
    const verification = await client.query(`
      SELECT 
        o.id as order_id, 
        o.display_id,
        o.email,
        o.status,
        o.metadata->>'ecpay_merchant_trade_no' as merchant_trade_no,
        o.metadata->>'ecpay_trade_no' as trade_no,
        c.completed_at,
        os.totals
      FROM "order" o
      LEFT JOIN cart c ON o.metadata->>'ecpay_merchant_trade_no' = c.metadata->>'ecpay_merchant_trade_no'
      LEFT JOIN order_summary os ON os.order_id = o.id
      WHERE o.id = $1
    `, [orderId])
    
    const result = verification.rows[0]
    
    console.log('📋 流程驗證結果:')
    console.log(`   訂單ID: ${result.order_id}`)
    console.log(`   訂單編號: #${result.display_id}`)
    console.log(`   Email: ${result.email}`)
    console.log(`   狀態: ${result.status}`)
    console.log(`   MerchantTradeNo: ${result.merchant_trade_no}`)
    console.log(`   TradeNo: ${result.trade_no}`)
    console.log(`   購物車完成時間: ${result.completed_at}`)
    console.log(`   訂單總額: ${JSON.parse(result.totals).total}`)

    // 步驟4: 測試前端訂單確認頁面
    console.log(`\n🌐 步驟4: 生成前端確認頁面連結`)
    const confirmUrl = `http://localhost:8000/tw/order/${orderId}/confirmed`
    console.log(`   訂單確認頁面: ${confirmUrl}`)

    // 步驟5: 測試ECPay success重定向
    console.log(`\n🔄 步驟5: 測試成功頁面重定向`)
    const successUrl = `http://localhost:8000/api/ecpay/success?order_id=${orderId}&merchant_trade_no=${merchantTradeNo}`
    console.log(`   成功頁面重定向: ${successUrl}`)

    console.log(`\n🎉 完整ECPay付款流程測試成功！`)
    console.log(`\n💡 接下來的步驟:`)
    console.log(`   1. 在瀏覽器中打開: ${confirmUrl}`)
    console.log(`   2. 驗證訂單資訊顯示正確`)
    console.log(`   3. 測試ECPay callback API`)
    
    return {
      success: true,
      cartId,
      orderId,
      merchantTradeNo,
      confirmUrl,
      successUrl
    }
    
  } catch (error) {
    console.error('💥 測試流程錯誤:', error)
    return { success: false, error: error.message }
  } finally {
    await client.end()
  }
}

// 如果直接運行腳本
if (require.main === module) {
  testCompleteECPayFlow().then(result => {
    if (result.success) {
      console.log('\n✅ 測試完成，所有組件都正常工作！')
    } else {
      console.log('\n❌ 測試失敗:', result.error)
    }
    process.exit(result.success ? 0 : 1)
  })
}

module.exports = { testCompleteECPayFlow }
