// 測試 ECPay SDK 的 ChoosePayment 行為
const ECPayAIO = require('ecpay_aio_nodejs')

const options = {
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
    'BARCODE',
    'ApplePay',
    'GooglePay',
    'BNPL'
  ],
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

// 測試不同的 ChoosePayment 值
const paymentMethods = ['Credit', 'WebATM', 'ATM', 'CVS', 'ALL']

for (const method of paymentMethods) {
  console.log(`\n=== 測試 ChoosePayment: ${method} ===`)
  
  const trade = {
    MerchantTradeNo: `TEST${Date.now().toString().slice(-10)}${Math.random().toString().slice(-3)}`,
    MerchantTradeDate: tradeDate,
    TotalAmount: 100,
    TradeDesc: '測試訂單',
    ItemName: '測試商品',
    ReturnURL: 'http://localhost:8000/api/ecpay/callback',
    ClientBackURL: 'http://localhost:8000/order/success',
    PaymentType: 'aio',
    ChoosePayment: method,
    EncryptType: 1,
    NeedExtraPaidInfo: 'N',
    InvoiceMark: 'N'
  }

  try {
    const html = ecpay.payment_client.aio_check_out_all(trade)
    console.log(`✅ ${method} 成功，HTML 長度:`, html.length)
    
    // 檢查實際的 ChoosePayment 值
    const choosepaymentMatch = html.match(/name="ChoosePayment"[^>]*value="([^"]*)"/)
    if (choosepaymentMatch) {
      console.log(`實際 ChoosePayment 值: ${choosepaymentMatch[1]}`)
    }
    
    // 如果是 Credit，嘗試立即創建一個測試表單
    if (method === 'Credit') {
      console.log('HTML 預覽:', html.substring(0, 200) + '...')
      
      // 將 HTML 寫入檔案供測試
      const fs = require('fs')
      fs.writeFileSync(`/Users/raychou/medusa_0525/backend/test-form-${method}.html`, html)
      console.log(`測試表單已儲存為 test-form-${method}.html`)
    }
    
  } catch (error) {
    console.error(`❌ ${method} 失敗:`, error.message)
  }
  
  // 避免請求太快
  await new Promise(resolve => setTimeout(resolve, 100))
}

console.log('\n=== 完成測試 ===')
