import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { InitiatePaymentInput, InitiatePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, ProviderWebhookPayload, WebhookActionResult, AuthorizePaymentInput, AuthorizePaymentOutput, RefundPaymentInput, RefundPaymentOutput, UpdatePaymentInput, UpdatePaymentOutput } from "@medusajs/types";
import ECPayAIO from "ecpay_aio_nodejs"

/**
 * ECPay 信用卡支付服務
 */
class EcpayPaymentService extends AbstractPaymentProvider {
  static identifier = "ecpay_credit_card";
  private ecpaySDK_: any;

  constructor(
    private readonly options: Record<string, unknown> = {}
  ) {
    super(options);

    try {
      // 初始化 ECPay SDK
      const ecpayOptions = {
        OperationMode: this.options.is_production ? 'Production' : 'Test',
        MercProfile: {
          MerchantID: this.options.merchant_id as string,
          HashKey: this.options.hash_key as string,
          HashIV: this.options.hash_iv as string,
        },
        IgnorePayment: [],
        IsProjectContractor: false,
      };

      this.ecpaySDK_ = new ECPayAIO(ecpayOptions);
    } catch (error) {
      console.error("❌ ECPay SDK 初始化失敗：", error);
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    console.log("🚀 initiatePayment 被調用，input:", input);
    const { amount, currency_code } = input;

    const paymentId = `ecpay_${Date.now()}`;
    return {
      id: paymentId,
      data: {
        id: paymentId,
        amount,
        currency_code,
        status: "pending",
        payment_type: "Credit",
        merchant_id: this.options.merchant_id,
      },
    };
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    console.log("� getPaymentStatus 被調用，input:", input);
    // ECPay 需要透過 webhook 來獲取付款狀態
    return {
      status: "pending" // 預設為等待中，實際狀態透過 webhook 更新
    };
  }

  async capturePayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    console.log("� capturePayment 被調用，paymentData:", paymentData);
    return {
      id: paymentData.id,
      status: "captured"
    };
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    console.log("🔐 authorizePayment 被調用，input:", input);
    // 對於 ECPay，我們無法在後端授權支付，因為它需要重定向到 ECPay 的頁面
    return { 
      status: "requires_more",
      data: {
        id: input.data?.id || `auth_${Date.now()}`,
        status: "requires_more"
      }
    };
  }

  async cancelPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    console.log("❌ cancelPayment 被調用，paymentData:", paymentData);
    return {
      id: paymentData.id,
      status: "canceled"
    };
  }

  async deletePayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown>> {
    console.log("🗑️ deletePayment 被調用，paymentSessionData:", paymentSessionData);
    return {
      id: paymentSessionData.id,
      status: "deleted"
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    console.log("� refundPayment 被調用，input:", input);
    // ECPay 的退款通常需要額外的 API 調用
    return {
      
    };
  }

  async retrievePayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    console.log("🔍 retrievePayment 被調用，paymentData:", paymentData);
    return {
      id: paymentData.id,
      status: "authorized" // 或其他適當的狀態
    };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    console.log("� updatePayment 被調用，input:", input);
    return {
      
    };
  }

  async getWebhookActionAndData(data: { data: Record<string, unknown>; rawData: string | Buffer<ArrayBufferLike>; headers: Record<string, unknown>; }): Promise<WebhookActionResult> {
    console.log("� getWebhookActionAndData 被調用，data:", data);
    const ecpayData = data.data;
    
    // 解析 ECPay 回調數據
    const isSuccessful = ecpayData.RtnCode === "1";
    
    if (isSuccessful) {
      return {
        action: "captured",
      };
    } else {
      return {
        action: "failed",
      };
    }
  }

  async generateEcpayForm(cart: any) {
    if (!this.ecpaySDK_) {
      console.error("❌ ECPay SDK 尚未初始化");
      return null;
    }
    
    try {
      console.log("🏗️ 生成 ECPay 表單，cart:", cart);
      // 生成將提交到 ECPay 的表單
      const form = this.ecpaySDK_.payment_client.aio_check_out_all({
        MerchantTradeNo: `${cart.id}_${Date.now()}`,
        MerchantTradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        TotalAmount: cart.total,
        TradeDesc: '來自商店的訂單',
        ItemName: cart.items?.map((item: any) => `${item.title} x ${item.quantity}`).join('#') || '商品',
        ReturnURL: (this.options.return_url as string) || 'http://localhost:9000/ecpay/callback',
        ChoosePayment: 'Credit',
        ClientBackURL: (this.options.client_back_url as string) || 'http://localhost:3000/order/confirmation',
        OrderResultURL: (this.options.client_back_url as string) || 'http://localhost:3000/order/confirmation',
      });
      
      return form;
    } catch (error) {
      console.error("❌ 生成 ECPay 表單失敗：", error);
      return null;
    }
  }
}

export default EcpayPaymentService;
