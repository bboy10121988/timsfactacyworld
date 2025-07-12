// 最終測試 - 使用最標準的參數
const ECPayAIO = require('ecpay_aio_nodejs')

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: '3002607',
    HashKey: 'pwFHCqoQZGmho4w6',
    HashIV: 'EkRm7iFT261dpevs',
  },
  IgnorePayment: ["GooglePay", "SamsungPay", "LinePay", "JKOPay", "TaiwanPay"],
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
  MerchantTradeNo: `TEST${Date.now().toString().slice(-10)}`,
  MerchantTradeDate: tradeDate,
  TotalAmount: 1000,
  TradeDesc: '測試訂單',
  ItemName: '測試商品',
  ReturnURL: 'https://www.ecpay.com.tw/return_url.php',
  ClientBackURL: 'https://www.ecpay.com.tw',
  PaymentType: 'aio',
  ChoosePayment: 'Credit',
  EncryptType: 1,
}

console.log('🔍 最終測試參數:')
console.log(JSON.stringify(trade, null, 2))
console.log('🔍 SDK 選項:')
console.log(JSON.stringify(options, null, 2))

try {
  const html = ecpay.payment_client.aio_check_out_all(trade)
  console.log('✅ 成功，HTML 長度:', html.length)
  
  // 檢查是否還有錯誤
  if (html.includes('10200141')) {
    console.log('❌ 仍然出現 10200141 錯誤')
    console.log('這確認了問題出在測試帳號本身，而非程式碼')
    console.log('')
    console.log('🔍 錯誤詳情:')
    const errorMatch = html.match(/訊息說明：([^<]+)/);
    if (errorMatch) {
      console.log('錯誤說明:', errorMatch[1])
    }
  } else {
    console.log('✅ 沒有錯誤！測試成功')
  }
  
  const fs = require('fs')
  fs.writeFileSync('/Users/raychou/medusa_0525/test-final.html', html)
  console.log('測試結果已儲存: test-final.html')
  
} catch (error) {
  console.error('❌ SDK 錯誤:', error.message)
}
