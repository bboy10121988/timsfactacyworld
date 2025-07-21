#!/usr/bin/env node

/**
 * 終端機測試工具：透過 Medusa API 建立訂單
 * 用途：測試從 ECPay callback 透過 Medusa API 建立訂單的功能
 */

const axios = require('axios')

const BACKEND_URL = 'http://localhost:9000'

// 測試資料
const testData = {
  merchantTradeNo: `TEST${Date.now()}`,
  tradeNo: `ECPAY${Date.now()}`,
  tradeAmt: '2100',
  paymentType: 'Credit_CreditCard',
  paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
}

console.log('🧪 ECPay Callback API 測試工具')
console.log('=====================================')
console.log('測試資料:')
console.log(JSON.stringify(testData, null, 2))
console.log('')

async function testMedusaAPI() {
  console.log('🔍 步驟 1: 檢查後端服務狀態...')
  
  try {
    // 檢查後端是否正在運行
    const healthCheck = await axios.get(`${BACKEND_URL}/store/products`, {
      timeout: 5000
    })
    
    console.log('✅ 後端服務正常運行')
  } catch (error) {
    console.error('❌ 後端服務無法連接:', error.message)
    console.error('請先啟動後端服務: cd backend && npm run dev')
    return
  }

  console.log('')
  console.log('🛒 步驟 2: 模擬建立測試購物車...')
  
  try {
    // 這裡我們模擬購物車已存在的情況
    // 在實際情況中，購物車會在結帳流程中建立
    console.log('📝 模擬購物車資料:')
    console.log(`Cart ID: cart_${Date.now()}`)
    console.log(`MerchantTradeNo: ${testData.merchantTradeNo}`)
    console.log('✅ 測試購物車準備完成')
    
  } catch (error) {
    console.error('❌ 建立測試購物車失敗:', error.message)
    return
  }

  console.log('')
  console.log('💳 步驟 3: 模擬 ECPay callback...')
  
  try {
    const callbackData = {
      RtnCode: '1', // 付款成功
      MerchantTradeNo: testData.merchantTradeNo,
      TradeNo: testData.tradeNo,
      TradeAmt: testData.tradeAmt,
      PaymentDate: testData.paymentDate,
      PaymentType: testData.paymentType,
      CheckMacValue: 'TEST_CHECKSUM'
    }

    console.log('📦 發送 callback 資料:', JSON.stringify(callbackData, null, 2))

    // 測試原本的直接資料庫版本
    console.log('')
    console.log('🗃️ 測試原始版本 (直接資料庫)...')
    const dbResponse = await axios.post(`${BACKEND_URL}/store/ecpay/callback`, callbackData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })
    
    console.log(`✅ 直接資料庫版本回應: ${dbResponse.data}`)

    // 測試新的 API 版本
    console.log('')
    console.log('🔧 測試 API 版本...')
    try {
      const apiResponse = await axios.post(`${BACKEND_URL}/store/ecpay/callback-api`, callbackData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      })
      
      console.log(`✅ API 版本回應: ${apiResponse.data}`)
      
    } catch (apiError) {
      console.error('❌ API 版本失敗:', apiError.response?.data || apiError.message)
      console.error('這可能是因為 Medusa API 需要認證或服務尚未正確設定')
    }
    
  } catch (error) {
    console.error('❌ Callback 測試失敗:', error.message)
    if (error.response) {
      console.error('回應狀態:', error.response.status)
      console.error('回應內容:', error.response.data)
    }
    return
  }

  console.log('')
  console.log('📊 步驟 4: 檢查結果...')
  
  try {
    // 這裡可以透過其他方式檢查訂單是否建立成功
    // 例如查詢資料庫或透過 Admin API
    console.log('💡 建議檢查方式:')
    console.log('1. 登入 Medusa Admin 查看訂單列表')
    console.log('2. 檢查資料庫 "order" 表格')
    console.log('3. 查找包含 ecpay_merchant_trade_no 的訂單')
    
  } catch (error) {
    console.error('❌ 結果檢查失敗:', error.message)
  }

  console.log('')
  console.log('🎉 測試完成!')
  console.log('=====================================')
}

// 主要執行函數
async function main() {
  try {
    await testMedusaAPI()
  } catch (error) {
    console.error('💥 測試執行失敗:', error.message)
    process.exit(1)
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main()
}

module.exports = { testMedusaAPI }
