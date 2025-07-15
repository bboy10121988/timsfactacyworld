import { IPaymentProvider } from "@medusajs/framework/types"
import { WebhookActionResult } from "@medusajs/framework/types"

class ECPayPaymentProvider implements IPaymentProvider {
  getIdentifier(): string {
    return ECPayPaymentProvider.identifier
  }

  async retrievePayment(paymentSessionData: any): Promise<any> {
    // 取得支付資料
    return paymentSessionData
  }

  async getWebhookActionAndData(data: { data: Record<string, unknown>; rawData: string | Buffer; headers: Record<string, unknown>; }): Promise<WebhookActionResult> {
    // 處理 webhook
    return Promise.resolve({ action: "captured", data: { session_id: "", amount: 0, currency_code: "" } })
  }
  static identifier = "ecpay"

  constructor(private container: any, private options: any) {}

  async initiatePayment(data: any): Promise<any> {
    // 初始化綠界支付
    return {
      session_data: {
        id: `ecpay_${Date.now()}`,
        status: "pending",
        amount: data.amount,
        currency_code: data.currency_code,
      }
    }
  }

  async authorizePayment(data: any): Promise<any> {
    // 處理綠界授權
    return {
      status: "authorized",
      data: data
    }
  }

  async capturePayment(paymentData: any): Promise<any> {
    // 捕獲支付
    return {
      status: "captured",
      data: paymentData
    }
  }

  async refundPayment(data: any): Promise<any> {
    // 處理退款
    return {
      status: "refunded",
      data: data
    }
  }

  async cancelPayment(paymentData: any): Promise<any> {
    // 取消支付
    return {
      status: "canceled",
      data: paymentData
    }
  }

  async deletePayment(paymentSessionData: any): Promise<any> {
    // 刪除支付會話
    return
  }

  async getPaymentStatus(paymentSessionData: any): Promise<any> {
    // 獲取支付狀態
    return "pending"
  }

  async updatePayment(context: any): Promise<any> {
    // 更新支付
    return {
      session_data: context.paymentSessionData
    }
  }
}

export default ECPayPaymentProvider
