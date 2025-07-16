import { IPaymentProvider } from "@medusajs/framework/types"

class ECPayPaymentProvider implements IPaymentProvider {
  static identifier = "ecpay"

  constructor(private container: any, private options: any) {}

  async initiatePayment(data: any) {
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

  async authorizePayment(paymentSessionData: any, context: any) {
    // 處理綠界授權
    return {
      status: "authorized",
      data: paymentSessionData
    }
  }

  async capturePayment(paymentData: any) {
    // 捕獲支付
    return {
      status: "captured",
      data: paymentData
    }
  }

  async refundPayment(paymentData: any, refundAmount: number) {
    // 處理退款
    return {
      status: "refunded",
      data: { refund_amount: refundAmount }
    }
  }

  async cancelPayment(paymentData: any) {
    // 取消支付
    return {
      status: "canceled",
      data: paymentData
    }
  }

  async deletePayment(paymentSessionData: any) {
    // 刪除支付會話
    return
  }

  async getPaymentStatus(paymentSessionData: any) {
    // 獲取支付狀態
    return "pending"
  }

  async updatePayment(context: any) {
    // 更新支付
    return {
      session_data: context.paymentSessionData
    }
  }
}

export default ECPayPaymentProvider
