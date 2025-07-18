import ECPayAIO from "ecpay_aio_nodejs"
import crypto from "crypto"

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
    // 正式環境必須設金鑰，否則報錯
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ECPAY_MERCHANT_ID || !process.env.ECPAY_HASH_KEY || !process.env.ECPAY_HASH_IV) {
        throw new Error("正式環境必須設定 ECPAY_MERCHANT_ID、ECPAY_HASH_KEY、ECPAY_HASH_IV")
      }
      this.merchantID_ = process.env.ECPAY_MERCHANT_ID
      this.hashKey_ = process.env.ECPAY_HASH_KEY
      this.hashIV_ = process.env.ECPAY_HASH_IV
    } else {
      this.merchantID_ = process.env.ECPAY_MERCHANT_ID || "2000132"
      this.hashKey_ = process.env.ECPAY_HASH_KEY || "ejCk326UnaZWKisg"
      this.hashIV_ = process.env.ECPAY_HASH_IV || "q9jcZX8Ib9LM8wYk"
    }
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

    // 新增詳細 log
    console.log('收到的 order:', JSON.stringify(order, null, 2))
    console.log('收到的 shipping_address:', JSON.stringify(shipping_address, null, 2))

    // 檢查必要欄位
    if (!order || !order.items || !order.total) {
      throw new Error('缺少購物車資料，請重新整理頁面')
    }
    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('購物車沒有商品，請重新選擇商品')
    }

    // 過濾商品名稱特殊字元，避免 ECPay 拒絕
    const safeItems = order.items.map(item => {
      const safeTitle = (item.title || "商品").replace(/[\#&<>%\r\n]/g, '')
      return `${safeTitle} x ${item.quantity}`
    })
    let itemName = safeItems.join('#')
    if (itemName.length > 400) {
      itemName = itemName.slice(0, 400)
    }

    // 金額必須大於 0
    const totalAmount = Math.round(order.total || 1000)
    if (totalAmount <= 0) {
      throw new Error('訂單金額必須大於 0')
    }

    // 根據環境自動切換 OperationMode
    const isProduction = process.env.NODE_ENV === 'production'
    const options = {
      OperationMode: isProduction ? 'Production' : 'Test', // 正式用 Production，開發用 Test
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

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    const tradeDate = `${year}/${month}/${day} ${hour}:${minute}:${second}` // ECPay 正確格式

    // 產生唯一訂單編號（時間戳+隨機碼）
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase()
    const merchantTradeNo = `ORDER${Date.now().toString().slice(-7)}${randomSuffix}`

    const trade: MerchantTradeData = {
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: tradeDate,
      TotalAmount: totalAmount, // 強制整數
      TradeDesc: "網站訂單付款",
      ItemName: itemName,
      ReturnURL: order.returnUrl || process.env.ECPAY_RETURN_URL || "https://www.ecpay.com.tw/return_url.php",
      ClientBackURL: order.clientBackUrl || process.env.ECPAY_CLIENT_BACK_URL || "https://www.ecpay.com.tw",
      PaymentType: "aio",
      ChoosePayment: order.choosePayment || "ALL", // 動態帶入
      EncryptType: 1,
      // NeedExtraPaidInfo: "N", // 可選
      // InvoiceMark: "N", // 可選
    }
    // log 出送給綠界的 trade 參數
    console.log('🚚 送給綠界的 trade 參數:', JSON.stringify(trade, null, 2))

    console.log('ECPay 交易參數:', JSON.stringify(trade, null, 2))
    console.log('ECPay 設定選項:', JSON.stringify(options, null, 2))
    console.log('使用的 MerchantID:', this.merchantID_)
    console.log('使用的 HashKey:', this.hashKey_.substring(0, 4) + '****')
    console.log('使用的 HashIV:', this.hashIV_.substring(0, 4) + '****')

    try {
      console.log('🔄 開始呼叫 ECPay SDK...')
      console.log('ECPay 實例建立完成:', !!ecpay.payment_client)
      const html = ecpay.payment_client.aio_check_out_all(trade)
      console.log('ECPay 回傳內容:', html)
      if (!html || html.length < 100 || html.includes('錯誤') || html.includes('失敗')) {
        console.log('ECPay 返回錯誤:', html)
        throw new Error(html || 'ECPay 未回傳付款表單')
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
