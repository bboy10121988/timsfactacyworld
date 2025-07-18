import ECPayAIO from "ecpay_aio_nodejs"

interface MerchantTradeData {
  MerchantTradeNo: string
  MerchantTradeDate: string
  TotalAmount: number
  TradeDesc: string
  ItemName: string
  ReturnURL: string
  ClientBackURL?: string
  PaymentType: string
  ChoosePayment: string
  EncryptType: number
  NeedExtraPaidInfo?: string
  InvoiceMark?: string
}

class EcpayService {
  protected readonly merchantID_: string
  protected readonly hashKey_: string
  protected readonly hashIV_: string
  protected readonly baseUrl_: string

  constructor(container?: any) {
    // 使用官方唯一的測試帳號
    this.merchantID_ = process.env.ECPAY_MERCHANT_ID || "3002607"
    this.hashKey_ = process.env.ECPAY_HASH_KEY || "pwFHCqoQZGmho4w6" 
    this.hashIV_ = process.env.ECPAY_HASH_IV || "EkRm7iFT261dpevs"
    this.baseUrl_ = process.env.ECPAY_BASE_URL || "https://payment-stage.ecpay.com.tw"
  }

  async createPayment(order, shipping_address) {
    // 驗證收件資訊
    if (!shipping_address ||
        !shipping_address.first_name || 
        !shipping_address.last_name ||
        !shipping_address.address_1 ||
        !shipping_address.city ||
        !shipping_address.phone) {
      throw new Error("請先填寫完整收件資訊")
    }

    const options = {
      OperationMode: 'Test', // Test 或 Production
      MercProfile: {
        MerchantID: this.merchantID_,
        HashKey: this.hashKey_,
        HashIV: this.hashIV_,
      },
      IgnorePayment: [], // 必須設為空陣列，避免 undefined.join 錯誤
      IsProjectContractor: false,
    }

    const ecpay = new ECPayAIO(options)
    const baseUrl = process.env.STORE_URL || "http://localhost:8000"

    const items = order.items.map(item => `${item.title} x ${item.quantity}`).join("#")

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    const tradeDate = `${year}/${month}/${day} ${hour}:${minute}:${second}` // ECPay 正確格式

    const trade: MerchantTradeData = {
      MerchantTradeNo: `TEST${Date.now().toString().slice(-10)}`, // 改為 TEST 開頭，和成功測試一樣
      MerchantTradeDate: tradeDate,
      TotalAmount: order.total || 1000, // 若無金額則預設 1000
      TradeDesc: "測試訂單",
      ItemName: items || "測試商品",
      ReturnURL: process.env.ECPAY_RETURN_URL || "https://www.ecpay.com.tw/return_url.php",
      ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL || "https://www.ecpay.com.tw",
      PaymentType: "aio",
      ChoosePayment: "ALL",
      EncryptType: 1,
    }

    console.log('ECPay 交易參數:', JSON.stringify(trade, null, 2))
    console.log('ECPay 設定選項:', JSON.stringify(options, null, 2))
    console.log('使用的 MerchantID:', this.merchantID_)
    console.log('使用的 HashKey:', this.hashKey_.substring(0, 4) + '****')
    console.log('使用的 HashIV:', this.hashIV_.substring(0, 4) + '****')

    try {
      console.log('🔄 開始呼叫 ECPay SDK...')
      console.log('ECPay 實例建立完成:', !!ecpay.payment_client)
      const html = ecpay.payment_client.aio_check_out_all(trade)
      console.log('✅ ECPay SDK 呼叫成功，HTML 長度:', html.length)
      if (html.includes('錯誤') || html.includes('失敗') || html.includes('10200141')) {
        console.log('⚠️  HTML 可能包含錯誤訊息:')
        console.log(html)
        return html
      }
      if (!html.includes('<form') || !html.includes('MerchantID')) {
        console.log('⚠️  HTML 格式異常:')
        console.log(html)
      }
      console.log('HTML 前 300 字元:', html.substring(0, 300) + '...')
      return html
    } catch (ecpayError: any) {
      console.error('❌ ECPay SDK 錯誤:', ecpayError)
      console.error('錯誤類型:', typeof ecpayError)
      console.error('錯誤詳情:', ecpayError.stack || ecpayError)
      throw new Error(`ECPay 處理失敗: ${ecpayError.message}`)
    }
  }
}

export default EcpayService
