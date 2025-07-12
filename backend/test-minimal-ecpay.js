// 使用最基本的 ECPay 設定進行測試
const ECPayAIO = require('ecpay_aio_nodejs')

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: '3002607',
    HashKey: 'pwFHCqoQZGmho4w6',
    HashIV: 'EkRm7iFT261dpevs',
  },
  IgnorePayment: [], // 完全不忽略任何付款方式
  IsProjectContractor: false,
}

const ecpay = new ECPayAIO(options)

const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const hour = String(now.getHours()).padStart(2, '0')
const minute = String(now.getMinutes()).padStart(2, '0')
const second = String(now.getSeconds()).padStart(2, '0')
const tradeDate = `${year}/${month}/${day} ${hour}:${minute}:${second}`

const trade = {
  MerchantTradeNo: `TEST${Date.now().toString().slice(-13)}`,
  MerchantTradeDate: tradeDate,
  TotalAmount: 10, // 改為最小金額 10 元
  TradeDesc: 'Test',
  ItemName: 'Test',
  ReturnURL: 'https://www.ecpay.com.tw',
  ClientBackURL: 'https://www.ecpay.com.tw',
  PaymentType: 'aio',
  ChoosePayment: 'ALL', // 改為 ALL，讓綠界自動決定
  EncryptType: 1,
}

console.log('測試最基本參數:')
console.log(JSON.stringify(trade, null, 2))

try {
  const html = ecpay.payment_client.aio_check_out_all(trade)
  console.log('✅ 成功，HTML 長度:', html.length)
  
  const fs = require('fs')
  fs.writeFileSync('/Users/raychou/medusa_0525/test-minimal.html', html)
  console.log('最基本測試表單已儲存: test-minimal.html')
  
} catch (error) {
  console.error('❌ 失敗:', error.message)
}
