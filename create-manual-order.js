#!/usr/bin/env node

// 手動建立訂單的腳本
const { Client } = require('pg')

async function createTestOrder() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://raychou:1012@localhost:5432/medusa_0525'
  })
  
  try {
    await client.connect()
    console.log('🔌 Connected to database')

    // 測試數據
    const merchantTradeNo = 'MANUAL_TEST_1753102937'
    const cartId = 'test_cart_1753102937'
    
    // 1. 檢查購物車是否存在
    const cartResult = await client.query('SELECT * FROM cart WHERE id = $1', [cartId])
    
    if (cartResult.rows.length === 0) {
      console.error(`❌ Cart not found: ${cartId}`)
      return
    }
    
    const cart = cartResult.rows[0]
    console.log(`📋 Found cart: ${cart.id}`)

    // 2. 建立訂單
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`🆔 Creating order: ${orderId}`)
    
    // 建立預設地址
    const addressId = `addr_${Date.now()}`
    const addressInsert = `
      INSERT INTO order_address (id, first_name, last_name, address_1, city, country_code, postal_code, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `
    const addressResult = await client.query(addressInsert, [
      addressId,
      '測試',
      '用戶',
      '台北市信義區',
      '台北市',
      'TW',
      '110',
      '0912345678'
    ])
    
    console.log('📍 Created address:', addressResult.rows[0].id)

    // 建立訂單
    const orderMetadata = {
      ecpay_merchant_trade_no: merchantTradeNo,
      ecpay_trade_no: 'TEST123',
      ecpay_payment_date: '2024-01-01 12:00:00',
      ecpay_payment_type: 'Credit_CreditCard',
      ecpay_trade_amt: '2100',
      cart_metadata: cart.metadata,
      manual_creation: true,
      created_via: 'manual_script'
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
      'reg_01HJ2WNQMHQM0KJZV8DMGH9NW8', // 預設region
      cart.customer_id,
      1, // version
      'pending', // status
      cart.email || 'test@example.com',
      cart.currency_code || 'TWD',
      addressId,
      addressId,
      JSON.stringify(orderMetadata)
    ])
    
    console.log('✅ Order created:', orderResult.rows[0])

    // 3. 建立訂單摘要
    const summaryInsert = `
      INSERT INTO order_summary (
        id, order_id, totals, created_at, updated_at
      ) VALUES ($1, $2, $3, NOW(), NOW())
    `
    
    const totals = {
      total: 2100,
      subtotal: 2000,
      tax_total: 100,
      shipping_total: 0
    }
    
    await client.query(summaryInsert, [
      `summary_${orderId}`,
      orderId,
      JSON.stringify(totals)
    ])
    
    console.log('✅ Order summary created')

    // 4. 標記購物車為已完成
    const cartUpdate = `
      UPDATE cart 
      SET completed_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `
    await client.query(cartUpdate, [cartId])
    console.log('✅ Cart marked as completed')

    // 5. 驗證結果
    const verification = await client.query(`
      SELECT 
        o.id as order_id, 
        o.display_id, 
        o.email, 
        o.status,
        c.completed_at
      FROM "order" o
      LEFT JOIN cart c ON c.id = $1
      WHERE o.id = $2
    `, [cartId, orderId])
    
    console.log('🎉 Manual order creation completed!')
    console.log('📋 Order details:', verification.rows[0])
    
    return {
      success: true,
      order: verification.rows[0],
      orderId: orderId
    }
    
  } catch (error) {
    console.error('💥 Error creating manual order:', error)
    return { success: false, error: error.message }
  } finally {
    await client.end()
  }
}

// 如果直接運行腳本
if (require.main === module) {
  createTestOrder().then(result => {
    console.log('Final result:', result)
    process.exit(result.success ? 0 : 1)
  })
}

module.exports = { createTestOrder }
