// 直接測試 ECPay 設定
const ECPayAIO = require('ecpay_aio_nodejs')

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: '2000132',
    HashKey: '5294y06JbISpM5x9',
    HashIV: 'v77hoKGq4kWxNNIS',
  },
  IgnorePayment: [],
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
  TotalAmount: 100, // 最小金額測試
  TradeDesc: '測試訂單',
  ItemName: '測試商品',
  ReturnURL: 'http://localhost:8000/api/ecpay/callback',
  ClientBackURL: 'http://localhost:8000/order/success',
  PaymentType: 'aio',
  ChoosePayment: 'Credit',
  EncryptType: 1,
  NeedExtraPaidInfo: 'N',
}

console.log('測試參數:')
console.log('MerchantID:', options.MercProfile.MerchantID)
console.log('交易資料:', JSON.stringify(trade, null, 2))

try {
  const html = ecpay.payment_client.aio_check_out_all(trade)
  console.log('✅ ECPay 回應成功')
  console.log('HTML 長度:', html.length)
  console.log('HTML 內容預覽:', html.substring(0, 500) + '...')
} catch (error) {
  console.error('❌ ECPay 錯誤:', error.message)
  console.error('錯誤詳情:', error)
}
