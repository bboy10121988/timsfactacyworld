// 測試不同的 ECPay 設定組合
const ECPayAIO = require('ecpay_aio_nodejs')

// 測試 1: 最基本的設定
console.log('=== 測試 1: 基本設定 ===')
const options1 = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: '3002607',
    HashKey: 'pwFHCqoQZGmho4w6',
    HashIV: 'EkRm7iFT261dpevs',
  },
  IgnorePayment: [
    'WebATM',
    'ATM', 
    'CVS',
    'BARCODE'
  ],
  IsProjectContractor: false,
}

const ecpay1 = new ECPayAIO(options1)

const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const hour = String(now.getHours()).padStart(2, '0')
const minute = String(now.getMinutes()).padStart(2, '0')
const second = String(now.getSeconds()).padStart(2, '0')
const tradeDate = `${year}/${month}/${day} ${hour}:${minute}:${second}`

const trade1 = {
  MerchantTradeNo: `TEST${Date.now().toString().slice(-13)}`,
  MerchantTradeDate: tradeDate,
  TotalAmount: 100,
  TradeDesc: '測試訂單',
  ItemName: '測試商品',
  ReturnURL: 'http://localhost:8000/api/ecpay/callback',
  ClientBackURL: 'http://localhost:8000/order/success',
  PaymentType: 'aio',
  ChoosePayment: 'Credit',
  EncryptType: 1,
  NeedExtraPaidInfo: 'N',
  InvoiceMark: 'N'
}

console.log('交易資料:', JSON.stringify(trade1, null, 2))

try {
  const html1 = ecpay1.payment_client.aio_check_out_all(trade1)
  console.log('✅ 測試 1 成功，HTML 長度:', html1.length)
  
  // 檢查 HTML 中的表單
  const formMatch = html1.match(/<form[^>]*action="([^"]*)"/)
  if (formMatch) {
    console.log('表單 action:', formMatch[1])
  }
  
  // 檢查是否有錯誤信息在 HTML 中
  if (html1.includes('錯誤') || html1.includes('失敗')) {
    console.log('⚠️  HTML 可能包含錯誤訊息')
    console.log('HTML 內容片段:', html1.substring(0, 300))
  }
  
} catch (error) {
  console.error('❌ 測試 1 失敗:', error.message)
}

// 測試 2: 完全不同的設定
console.log('\n=== 測試 2: 空的 IgnorePayment ===')
const options2 = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: '3002607',
    HashKey: 'pwFHCqoQZGmho4w6',
    HashIV: 'EkRm7iFT261dpevs',
  },
  IgnorePayment: [],
  IsProjectContractor: false,
}

const ecpay2 = new ECPayAIO(options2)

const trade2 = {
  ...trade1,
  MerchantTradeNo: `TEST${Date.now().toString().slice(-13)}`,
  ChoosePayment: 'ALL'
}

try {
  const html2 = ecpay2.payment_client.aio_check_out_all(trade2)
  console.log('✅ 測試 2 成功，HTML 長度:', html2.length)
} catch (error) {
  console.error('❌ 測試 2 失敗:', error.message)
}
