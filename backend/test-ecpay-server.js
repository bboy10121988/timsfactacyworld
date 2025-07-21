const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// ECPay Callback 測試端點
app.post('/ecpay/callback', (req, res) => {
  console.log('🔔 ECPay callback received:', new Date().toISOString())
  console.log('📦 Callback body:', req.body)
  
  const { RtnCode, MerchantTradeNo, TradeNo, TradeAmt, PaymentDate, PaymentType } = req.body
  
  // 模擬處理邏輯
  if (RtnCode === "1") {
    console.log('✅ 付款成功，處理訂單...')
    console.log(`📋 訂單編號: ${MerchantTradeNo}`)
    console.log(`💰 金額: ${TradeAmt}`)
    console.log(`📅 付款時間: ${PaymentDate}`)
    
    // 這裡應該：
    // 1. 查找對應的購物車
    // 2. 建立訂單
    // 3. 更新狀態
    
    res.send("1|OK")
  } else {
    console.log('❌ 付款失敗')
    res.send("0|Failed")
  }
})

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ECPay Test Server Running' })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`🚀 ECPay 測試服務器運行在 http://localhost:${PORT}`)
  console.log(`📍 Callback URL: http://localhost:${PORT}/ecpay/callback`)
})

module.exports = app
