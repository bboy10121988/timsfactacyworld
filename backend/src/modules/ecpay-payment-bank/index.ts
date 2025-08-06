import { ModuleProviderExports } from "@medusajs/framework/types"
import EcpayPaymentProvider from "../ecpay-payment/service"

// 創建一個新的類而不是使用 Object.create
class EcpayBankTransferProvider extends EcpayPaymentProvider {
  // 靜態識別符屬性
  static identifier = "ecpay_bank_transfer"

  // 覆寫支付初始化方法，指定支付方式為 ATM
  async initiatePayment(input) {
    console.log("🏦 使用銀行轉帳方式支付")
    // 在這裡可以為 ATM 支付添加特殊邏輯
    return super.createPayment(input)
  }

  // 覆寫生成 ECPay 表單的方法，將支付方式改為 ATM
  async generateEcpayForm(cart) {
    if (!this.ecpaySDK_) {
      console.error("ECPay SDK 尚未初始化");
      return null;
    }
    
    try {
      // 生成將提交到 ECPay 的表單，但指定為 ATM 支付方式
      const form = this.ecpaySDK_.aio_check_out_all({
        MerchantTradeNo: `${cart.id}_${Date.now()}`,
        MerchantTradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        TotalAmount: cart.total,
        TradeDesc: '來自商店的訂單',
        ItemName: cart.items.map(item => `${item.title} x ${item.quantity}`).join('#'),
        ReturnURL: this.options_.return_url || 'http://localhost:9000/ecpay/callback',
        ChoosePayment: 'ATM', // 這裡指定為 ATM 支付
        ClientBackURL: this.options_.client_back_url || 'http://localhost:3000/order/confirmation',
        OrderResultURL: this.options_.client_back_url || 'http://localhost:3000/order/confirmation',
      });
      
      return form;
    } catch (error) {
      console.error("生成 ECPay ATM 表單失敗：", error);
      return null;
    }
  }

  // 覆寫創建支付方法，確保支付類型為 ATM
  async createPayment(context) {
    const paymentData = await super.createPayment(context);
    paymentData.data.payment_type = "ATM";
    return paymentData;
  }
}

// 輸出提供者識別符，方便調試
console.log("❗ Registering payment provider with identifier:", EcpayBankTransferProvider.identifier)

const services = [EcpayBankTransferProvider]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
