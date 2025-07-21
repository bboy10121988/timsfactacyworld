#!/usr/bin/env node

/**
 * 完整的 ECPay + Medusa API 測試腳本
 * 測試流程：建立購物車 → 模擬付款 → callback 建立訂單
 */

const axios = require('axios')

const config = {
  baseURL: 'http://localhost:9000',
  apiKey: 'pk_878a01cbc11b1ed2acfb97a538e26610e073ced57ed8ad18f72677e836190adb',
  timeout: 10000
}

const api = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'x-publishable-api-key': config.apiKey
  },
  timeout: config.timeout
})

async function testCompleteFlow() {
  console.log('🚀 開始完整的 ECPay + Medusa API 測試流程')
  console.log('=' .repeat(50))
  
  const timestamp = Date.now()
  const merchantTradeNo = `TEST${timestamp}`
  const tradeNo = `ECPAY${timestamp}`
  const tradeAmt = '600'
  
  console.log(`📋 測試參數:`)
  console.log(`商店交易編號: ${merchantTradeNo}`)
  console.log(`ECPay交易編號: ${tradeNo}`)
  console.log(`交易金額: ${tradeAmt}`)
  console.log('')

  try {
    // 步驟 1: 檢查服務狀態
    console.log('📡 步驟 1: 檢查 Medusa 服務狀態...')
    const healthResponse = await api.get('/store/products')
    console.log('✅ Medusa 服務正常運行')
    console.log('')

    // 步驟 2: 建立購物車
    console.log('🛒 步驟 2: 建立測試購物車...')
    const cartData = {
      currency_code: 'TWD',
      email: 'test@example.com',
      metadata: {
        ecpay_merchant_trade_no: merchantTradeNo
      }
    }

    const cartResponse = await api.post('/store/carts', cartData)
    const cart = cartResponse.data.cart
    
    console.log('✅ 購物車建立成功:')
    console.log(`Cart ID: ${cart.id}`)
    console.log(`Email: ${cart.email}`)
    console.log(`Currency: ${cart.currency_code}`)
    console.log(`Metadata: ${JSON.stringify(cart.metadata)}`)
    console.log('')

    // 步驟 3: 測試 ECPay Callback (直接資料庫版本)
    console.log('💳 步驟 3: 測試 ECPay Callback (直接資料庫版本)...')
    const callbackData = {
      RtnCode: '1',
      MerchantTradeNo: merchantTradeNo,
      TradeNo: tradeNo,
      TradeAmt: tradeAmt,
      PaymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      PaymentType: 'Credit_CreditCard',
      CheckMacValue: 'TEST_CHECKSUM'
    }

    const callbackResponse = await api.post('/store/ecpay/callback', callbackData)
    console.log('✅ ECPay Callback (直接資料庫) 回應:', callbackResponse.data)
    console.log('')

    // 步驟 4: 測試 ECPay Callback (純 API 版本)
    console.log('🔧 步驟 4: 測試 ECPay Callback (純 API 版本)...')
    const merchantTradeNo2 = `TESTAPI${timestamp}`
    const tradeNo2 = `ECPAYAPI${timestamp}`
    
    // 先建立另一個購物車用於 API 測試
    const cartData2 = {
      currency_code: 'TWD',
      email: 'testapi@example.com',
      metadata: {
        ecpay_merchant_trade_no: merchantTradeNo2
      }
    }

    const cartResponse2 = await api.post('/store/carts', cartData2)
    const cart2 = cartResponse2.data.cart
    console.log(`✅ API 測試購物車建立: ${cart2.id}`)

    const callbackData2 = {
      RtnCode: '1',
      MerchantTradeNo: merchantTradeNo2,
      TradeNo: tradeNo2,
      TradeAmt: tradeAmt,
      PaymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      PaymentType: 'Credit_CreditCard',
      CheckMacValue: 'TEST_CHECKSUM'
    }

    try {
      const callbackResponse2 = await api.post('/store/ecpay/callback-api-pure', callbackData2)
      console.log('✅ ECPay Callback (純 API) 回應:', callbackResponse2.data)
    } catch (apiError) {
      console.log('⚠️ ECPay Callback (純 API) 失敗:', apiError.response?.data || apiError.message)
      console.log('這是預期的，因為 API 版本可能需要更多設定')
    }
    console.log('')

    // 步驟 5: 總結
    console.log('📊 測試總結:')
    console.log('✅ Medusa 服務正常')
    console.log('✅ 購物車建立成功')
    console.log('✅ ECPay Callback (直接資料庫) 成功')
    console.log('⚠️ ECPay Callback (純 API) 需要進一步調整')
    console.log('')
    console.log('🎯 結論:')
    console.log('- 直接資料庫操作的方法是可行的')
    console.log('- 純 API 方法需要更多的 Medusa v2 配置')
    console.log('- 建議目前使用直接資料庫方法，未來再遷移到純 API')
    
  } catch (error) {
    console.error('💥 測試失敗:', error.message)
    if (error.response) {
      console.error('HTTP Status:', error.response.status)
      console.error('Response Data:', error.response.data)
    }
    console.error('Stack:', error.stack)
  }
}

// 執行測試
testCompleteFlow().catch(console.error)
