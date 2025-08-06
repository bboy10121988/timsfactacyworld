/**
 * ECPay 信用卡支付服務
 */
class EcpayPaymentService {
  static identifier = "ecpay_credit_card";
  protected options_: any;
  protected ecpaySDK_: any;

  constructor(container, options) {
    this.options_ = options;

    try {
      // 動態導入 ECPay SDK
      const ecpay = require('ecpay_aio_nodejs');
      
      const ecpayOptions = {
        OperationMode: this.options_.is_production ? 'Production' : 'Test',
        MercProfile: {
          MerchantID: this.options_.merchant_id,
          HashKey: this.options_.hash_key,
          HashIV: this.options_.hash_iv,
        },
        IgnorePayment: [],
        IsProjectContractor: false,
      };

      const builder = new ecpay.payment_client(ecpayOptions);
      this.ecpaySDK_ = builder;
    } catch (error) {
      console.error("❌ ECPay SDK 初始化失敗：", error);
    }
  }

  // Medusa v2 必要方法
  async initiatePayment(input) {
    console.log("🚀 initiatePayment 被調用，input:", input);
    const { amount, currency_code, resource_id, customer } = input;

    const paymentData = {
      id: `ecpay_${Date.now()}`,
      amount,
      currency_code,
      resource_id,
      data: {
        status: "pending",
        payment_type: "Credit",
        cart_id: resource_id,
        merchant_id: this.options_.merchant_id,
      },
    };

    return paymentData;
  }

  async updatePayment(input) {
    console.log("🔄 updatePayment 被調用，input:", input);
    return input;
  }

  async getWebhookActionAndData(input) {
    console.log("🔗 getWebhookActionAndData 被調用，input:", input);
    const { data } = input;
    
    // 解析 ECPay 回調數據
    const isSuccessful = data.RtnCode === "1";
    
    if (isSuccessful) {
      return {
        action: "captured",
        data: {
          resource_id: data.CustomField1,
          amount: parseInt(data.TradeAmt, 10)
        }
      };
    } else {
      return {
        action: "failed",
        data: {
          resource_id: data.CustomField1,
          error: data.RtnMsg
        }
      };
    }
  }

  async authorizePayment(input) {
    console.log("🔐 authorizePayment 被調用，input:", input);
    // 對於 ECPay，我們無法在後端授權支付，因為它需要重定向到 ECPay 的頁面
    return { 
      status: "requires_more",
      data: input.data
    };
  }

  async cancelPayment(input) {
    console.log("❌ cancelPayment 被調用，input:", input);
    return input;
  }

  async capturePayment(input) {
    console.log("💰 capturePayment 被調用，input:", input);
    return input;
  }

  async refundPayment(input) {
    console.log("💸 refundPayment 被調用，input:", input);
    return input;
  }

  async deletePayment(input) {
    console.log("🗑️ deletePayment 被調用，input:", input);
    return input;
  }

  async generateEcpayForm(cart) {
    if (!this.ecpaySDK_) {
      console.error("❌ ECPay SDK 尚未初始化");
      return null;
    }
    
    try {
      console.log("🏗️ 生成 ECPay 表單，cart:", cart);
      // 生成將提交到 ECPay 的表單
      const form = this.ecpaySDK_.aio_check_out_all({
        MerchantTradeNo: `${cart.id}_${Date.now()}`,
        MerchantTradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        TotalAmount: cart.total,
        TradeDesc: '來自商店的訂單',
        ItemName: cart.items.map(item => `${item.title} x ${item.quantity}`).join('#'),
        ReturnURL: this.options_.return_url || 'http://localhost:9000/ecpay/callback',
        ChoosePayment: 'Credit',
        ClientBackURL: this.options_.client_back_url || 'http://localhost:3000/order/confirmation',
        OrderResultURL: this.options_.client_back_url || 'http://localhost:3000/order/confirmation',
      });
      
      return form;
    } catch (error) {
      console.error("❌ 生成 ECPay 表單失敗：", error);
      return null;
    }
  }
}

export default EcpayPaymentService;
