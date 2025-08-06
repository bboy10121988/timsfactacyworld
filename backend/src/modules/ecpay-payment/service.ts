import { AbstractPaymentProvider } from "@medusajs/utils"
import { 
  ProviderWebhookPayload,
  WebhookActionResult,
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  PaymentSessionStatus
} from "@medusajs/types"
import EcpayService from "../../services/ecpay"

interface EcpayOptions {
  merchant_id: string
  hash_key: string
  hash_iv: string
  base_url?: string
  return_url?: string
  client_back_url?: string
}

export default class EcpayPaymentProvider extends AbstractPaymentProvider<EcpayOptions> {
  static identifier = "ecpay"
  
  protected options_: EcpayOptions
  protected ecpayService_: EcpayService

  constructor(container: any, options: EcpayOptions) {
    super(container, options)
    this.options_ = options
    this.ecpayService_ = new EcpayService()
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    try {
      console.log('🎯 ECPay initiatePayment called:', {
        amount: input.amount,
        currency: input.currency_code,
        context: input.context
      })

      // 建立 ECPay 交易參數
      const tradeNo = `ORDER_${input.context?.customer?.id || Date.now()}_${Date.now()}`
      
      const ecpayParams = {
        MerchantTradeNo: tradeNo,
        TotalAmount: Number(input.amount),
        TradeDesc: `Order ${input.context?.customer?.id || 'N/A'}`,
        ItemName: `Order ${input.context?.customer?.id || 'N/A'}`,
        ReturnURL: this.options_.return_url || `${process.env.BACKEND_URL}/api/ecpay/callback`,
        ClientBackURL: this.options_.client_back_url || `${process.env.FRONTEND_URL}/checkout/payment-result`,
        PaymentType: 'aio',
        ChoosePayment: 'ALL' // 預設允許所有支付方式
      }

      console.log('🔧 ECPay params for initiation:', ecpayParams)

      // 產生付款表單
      const paymentForm = await this.ecpayService_.createPayment(ecpayParams)

      return {
        id: tradeNo,
        status: "pending",
        data: {
          trade_no: tradeNo,
          payment_form: paymentForm
        }
      }
    } catch (error) {
      console.error('❌ ECPay initiatePayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment initiation failed")
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    try {
      console.log('🔄 ECPay updatePayment called:', {
        amount: input.amount,
        currency: input.currency_code
      })

      // ECPay 通常不支援修改已建立的交易，需要重新建立
      const tradeNo = `ORDER_${input.context?.customer?.id || Date.now()}_${Date.now()}`
      
      const ecpayParams = {
        MerchantTradeNo: tradeNo,
        TotalAmount: Number(input.amount),
        TradeDesc: `Updated Order ${input.context?.customer?.id || 'N/A'}`,
        ItemName: `Updated Order ${input.context?.customer?.id || 'N/A'}`,
        ReturnURL: this.options_.return_url || `${process.env.BACKEND_URL}/api/ecpay/callback`,
        ClientBackURL: this.options_.client_back_url || `${process.env.FRONTEND_URL}/checkout/payment-result`,
        PaymentType: 'aio',
        ChoosePayment: 'ALL'
      }

      const paymentForm = await this.ecpayService_.createPayment(ecpayParams)

      return {
        status: "pending",
        data: {
          trade_no: tradeNo,
          payment_form: paymentForm
        }
      }
    } catch (error) {
      console.error('❌ ECPay updatePayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment update failed")
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    try {
      console.log('✅ ECPay authorizePayment called:', input)

      // ECPay 的支付授權通常在 callback 中處理
      // 這裡返回授權成功的狀態
      return {
        status: "authorized" as PaymentSessionStatus,
        data: input.data || {}
      }
    } catch (error) {
      console.error('❌ ECPay authorizePayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment authorization failed")
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    try {
      console.log('💰 ECPay capturePayment called:', input)

      // ECPay 通常是即時扣款，不需要額外的 capture 步驟
      return {
        data: input.data || {}
      }
    } catch (error) {
      console.error('❌ ECPay capturePayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment capture failed")
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    try {
      console.log('❌ ECPay cancelPayment called:', input)

      // ECPay 的取消支付邏輯
      return {
        data: input.data || {}
      }
    } catch (error) {
      console.error('❌ ECPay cancelPayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment cancellation failed")
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    try {
      console.log('↩️ ECPay refundPayment called:', {
        amount: input.amount,
        data: input.data
      })

      // ECPay 退款邏輯（需要實作 ECPay 退款 API）
      // 目前先返回成功狀態
      return {
        data: {
          refund_amount: input.amount,
          ...input.data
        }
      }
    } catch (error) {
      console.error('❌ ECPay refundPayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment refund failed")
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    try {
      console.log('🔍 ECPay retrievePayment called:', input)

      // 查詢 ECPay 支付狀態
      return {
        data: input.data || {}
      }
    } catch (error) {
      console.error('❌ ECPay retrievePayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment retrieval failed")
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    try {
      console.log('🗑️ ECPay deletePayment called:', input)

      // 檢查是否有支付會話數據
      if (!input.data || !input.data.trade_no) {
        throw new Error("Missing payment session data")
      }

      // 記錄刪除操作
      console.log('🔍 Deleting ECPay payment session:', input.data.trade_no)

      // ECPay 沒有提供直接刪除支付會話的API，所以我們只需返回成功
      // 實際支付會話會在ECPay系統中自動過期
      return {
        data: {
          deleted: true,
          trade_no: input.data.trade_no,
          message: "ECPay payment session marked as deleted"
        }
      }
    } catch (error) {
      console.error('❌ ECPay deletePayment error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment deletion failed")
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    try {
      console.log('📊 ECPay getPaymentStatus called:', input)

      // 根據支付資料判斷狀態
      const paymentData = input.data || {}
      
      if (paymentData.RtnCode === '1') {
        return {
          status: "captured"
        }
      } else if (paymentData.RtnCode === '0') {
        return {
          status: "authorized"
        }
      } else {
        return {
          status: "pending"
        }
      }
    } catch (error) {
      console.error('❌ ECPay getPaymentStatus error:', error)
      throw new Error(error instanceof Error ? error.message : "Payment status retrieval failed")
    }
  }

  async processWebhook(data: ProviderWebhookPayload): Promise<WebhookActionResult> {
    try {
      console.log('🌐 ECPay webhook received:', data)

      // 驗證 ECPay webhook
      const isValid = this.ecpayService_.verifyCallback(data.payload as any)
      
      if (!isValid) {
        throw new Error('Invalid ECPay callback')
      }

      const payload = data.payload as any
      
      // 根據 ECPay 回調結果處理
      if (payload.RtnCode === '1') {
        return {
          action: "authorized",
          data: payload
        }
      } else {
        return {
          action: "failed",
          data: payload
        }
      }
    } catch (error) {
      console.error('❌ ECPay webhook processing error:', error)
      throw new Error(error instanceof Error ? error.message : "Webhook processing failed")
    }
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    try {
      console.log('🔍 ECPay getWebhookActionAndData called:', payload)

      // 驗證 ECPay webhook 資料
      const isValid = this.ecpayService_.verifyCallback(payload as any)
      
      if (!isValid) {
        throw new Error('Invalid ECPay callback signature')
      }

      const ecpayData = payload as any
      
      // 根據 ECPay 回調結果決定動作
      if (ecpayData.RtnCode === '1') {
        return {
          action: "authorized",
          data: ecpayData
        }
      } else {
        return {
          action: "failed", 
          data: ecpayData
        }
      }
    } catch (error) {
      console.error('❌ ECPay getWebhookActionAndData error:', error)
      throw new Error(error instanceof Error ? error.message : "Webhook action processing failed")
    }
  }
}
