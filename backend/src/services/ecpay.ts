import ECPayAIO from "ecpay_aio_nodejs"
import crypto from "crypto"

interface MerchantTradeData {
  MerchantID: string
  MerchantTradeNo: string
  MerchantTradeDate: string
  PaymentType: string
  TotalAmount: number | string
  TradeDesc: string
  ItemName: string
  ReturnURL: string
  ChoosePayment: string
  CheckMacValue?: string
  EncryptType: number
  ClientBackURL?: string
  ItemURL?: string
  Remark?: string
  OrderResultURL?: string
  NeedExtraPaidInfo?: string
  IgnorePayment?: string
  PlatformID?: string
  CustomField1?: string
  CustomField2?: string
  CustomField3?: string
  CustomField4?: string
  Language?: string
  Redeem?: string
  UnionPay?: number
  MerchantMemberID?: string
  BindingCard?: number
}

// 取得台灣時區的 YYYY/MM/DD HH:mm:ss
function getTaiwanDateTimeString() {
  const now = new Date();
  now.setHours(now.getHours() + 8 - now.getTimezoneOffset() / 60);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
}

class EcpayService {
  async createPayment(params: Partial<MerchantTradeData>) {
    // 動態組裝參數，外部可傳入所有欄位，否則用預設值
    const trade: MerchantTradeData = {
      MerchantID: params.MerchantID || process.env.ECPAY_MERCHANT_ID || "2000132",
      MerchantTradeNo: params.MerchantTradeNo || `ORDER${Date.now().toString().slice(-7)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      MerchantTradeDate: params.MerchantTradeDate || getTaiwanDateTimeString(),
      PaymentType: params.PaymentType || "aio",
      TotalAmount: String(params.TotalAmount || 100),
      TradeDesc: params.TradeDesc || "網站訂單付款",
      ItemName: params.ItemName || "商品 x 1",
      ReturnURL: params.ReturnURL || process.env.ECPAY_RETURN_URL || "https://www.ecpay.com.tw/return_url.php",
      ChoosePayment: params.ChoosePayment || "ALL",
      EncryptType: typeof params.EncryptType === 'number' ? params.EncryptType : 1,
      ClientBackURL: params.ClientBackURL || process.env.ECPAY_CLIENT_BACK_URL,
      // 其他欄位可動態傳入
      ItemURL: params.ItemURL,
      Remark: params.Remark,
      OrderResultURL: params.OrderResultURL,
      NeedExtraPaidInfo: params.NeedExtraPaidInfo,
      IgnorePayment: params.IgnorePayment,
      PlatformID: params.PlatformID,
      CustomField1: params.CustomField1,
      CustomField2: params.CustomField2,
      CustomField3: params.CustomField3,
      CustomField4: params.CustomField4,
      Language: params.Language,
      Redeem: params.Redeem,
      UnionPay: params.UnionPay,
      MerchantMemberID: params.MerchantMemberID,
      BindingCard: params.BindingCard,
    }
    // 過濾掉 undefined/null
    const filteredTrade = Object.fromEntries(Object.entries(trade).filter(([_, v]) => v !== undefined && v !== null))
    // 新增 log
    console.log('送給 ECPay 的參數:', filteredTrade)
    // 初始化 ECPay SDK
    const options = {
      OperationMode: process.env.NODE_ENV === "production" ? "Production" : "Test",
      MercProfile: {
        MerchantID: process.env.ECPAY_MERCHANT_ID || "2000132",
        HashKey: process.env.ECPAY_HASH_KEY || "ejCk326UnaZWKisg",
        HashIV: process.env.ECPAY_HASH_IV || "q9jcZX8Ib9LM8wYk",
      },
      IgnorePayment: [],
      IsProjectContractor: false,
    }
    const ecpay = new ECPayAIO(options)
    // 產生付款表單 HTML
    try {
      const html = ecpay.payment_client.aio_check_out_all(filteredTrade)
      if (!html || !html.includes("<form")) {
        throw new Error("ECPay 未回傳付款表單")
      }
      return html
    } catch (err: any) {
      throw new Error("ECPay 處理失敗: " + (err.message || err))
    }
  }
}

export default EcpayService 