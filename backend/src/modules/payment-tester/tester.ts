import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { InitiatePaymentInput, InitiatePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, ProviderWebhookPayload, WebhookActionResult, AuthorizePaymentInput, AuthorizePaymentOutput, RefundPaymentInput, RefundPaymentOutput, UpdatePaymentInput, UpdatePaymentOutput } from "@medusajs/types";
import ECPayAIO from "ecpay_aio_nodejs"


class MyPaymentService extends AbstractPaymentProvider{
    static identifier = "my-payment-service"
    private ecpaySDK_: any;

    constructor(cradle: Record<string, unknown>, options?: Record<string, unknown>) {
        super(cradle, options);

        console.log("constructor",process.env.ECPAY_MERCHANT_ID)

        try {
            // 初始化 ECPay SDK
            const ecpayOptions = {
                OperationMode: process.env.ECPAY_IS_PRODUCTION === 'true' ? 'Production' : 'Test',
                MercProfile: {
                    MerchantID: process.env.ECPAY_MERCHANT_ID || "2000132",
                    HashKey: process.env.ECPAY_HASH_KEY || "ejCk326UnaZWKisg",
                    HashIV: process.env.ECPAY_HASH_IV || "q9jcZX8Ib9LM8wYk",
                },
                IgnorePayment: [],
                IsProjectContractor: false,
            };

            this.ecpaySDK_ = new ECPayAIO(ecpayOptions);
            console.log("✅ ECPay SDK 初始化成功");
        } catch (error) {
            console.error("❌ ECPay SDK 初始化失敗：", error);
        }
    }

    async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
        console.log("🚀 ECPay initiatePayment 被調用，input:", input);
        const { amount, currency_code } = input;

        const paymentId = `ecpay_${Date.now()}`;

        console.log("merchant_id:", process.env.ECPAY_MERCHANT_ID || "2000132");

        return {
            id: paymentId,
            data: {
                id: paymentId,
                amount,
                currency_code,
                status: "pending",
                payment_type: "ECPay_Credit",
                merchant_id: process.env.ECPAY_MERCHANT_ID,
            }
        }
    }

    async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
        console.log("📊 ECPay getPaymentStatus 被調用，input:", input);
        // ECPay 需要透過 webhook 來獲取付款狀態
        return {
            status: "pending" // 預設為等待中，實際狀態透過 webhook 更新
        }
    }

    async capturePayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
        return {
            id: paymentData.id,
            status: "captured"
        }
    }

    async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
        console.log("🔐 ECPay authorizePayment 被調用，input:", input);
        
        // 對於 ECPay，我們需要重定向到 ECPay 的頁面
        // 先嘗試生成表單，如果成功就返回需要更多操作的狀態
        try {
            // 檢查是否有額外的上下文資料
            const context = input.context as any;
            if (context?.cart_id) {
                console.log("✅ 找到購物車 ID，準備生成重定向 URL");
                
                return {
                    status: "requires_more",
                    data: {
                        id: input.data?.id || `ecpay_auth_${Date.now()}`,
                        status: "requires_more",
                        redirect_url: await this.generateEcpayRedirectUrl(input),
                        // 添加額外資訊，前端可以用來決定如何處理
                        payment_method: "ecpay",
                        requires_form: true
                    }
                }
            } else {
                console.log("⚠️ 沒有購物車資料，返回基本重定向");
                return {
                    status: "requires_more",
                    data: {
                        id: input.data?.id || `ecpay_auth_${Date.now()}`,
                        status: "requires_more",
                        redirect_url: await this.generateEcpayRedirectUrl(input)
                    }
                }
            }
        } catch (error) {
            console.error("❌ ECPay authorizePayment 錯誤:", error);
            return {
                status: "error",
                data: {
                    id: input.data?.id || `ecpay_auth_error_${Date.now()}`,
                    status: "error",
                    error: "支付授權失敗"
                }
            }
        }
    }

    async cancelPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
        return {
            id: paymentData.id,
            status: "canceled"
        }
    }

    async deletePayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown>> {
        return {
            id: paymentSessionData.id,
            status: "deleted"
        }
    }

    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
        return {
            
        }
    }

    async retrievePayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
        return {
            id: paymentData.id,
            status: "authorized"
        }
    }

    async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
        return {
            
            
        }
    }

    async getWebhookActionAndData(data: { data: Record<string, unknown>; rawData: string | Buffer<ArrayBufferLike>; headers: Record<string, unknown>; }): Promise<WebhookActionResult> {
        console.log("🔗 ECPay getWebhookActionAndData 被調用，data:", data);
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

    // ECPay 專用方法：生成付款表單
    async generateEcpayForm(cart: any) {
        if (!this.ecpaySDK_) {
            console.error("❌ ECPay SDK 尚未初始化");
            return null;
        }
        
        try {
            console.log("🏗️ 生成 ECPay 表單，cart:", cart);
            // 生成將提交到 ECPay 的表單
            const form = this.ecpaySDK_.payment_client.aio_check_out_all({
                MerchantTradeNo: `TEST_${cart.id || Date.now()}_${Date.now()}`,
                MerchantTradeDate: this.getTaiwanDateTimeString(),
                TotalAmount: cart.total || cart.amount || 100,
                TradeDesc: '測試商店訂單',
                ItemName: cart.items?.map((item: any) => `${item.title} x ${item.quantity}`).join('#') || '測試商品',
                ReturnURL: process.env.ECPAY_RETURN_URL || 'http://localhost:9000/ecpay/callback',
                ChoosePayment: 'Credit',
                ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL || 'http://localhost:3000/order/confirmation',
                OrderResultURL: process.env.ECPAY_CLIENT_BACK_URL || 'http://localhost:3000/order/confirmation',
            });
            
            return form;
        } catch (error) {
            console.error("❌ 生成 ECPay 表單失敗：", error);
            return null;
        }
    }

    // 生成重定向 URL（如果需要）
    private async generateEcpayRedirectUrl(input: AuthorizePaymentInput): Promise<string> {
        // 這裡可以實作生成 ECPay 重定向 URL 的邏輯
        // 目前返回預設的 ECPay 測試環境 URL
        const isProduction = process.env.ECPAY_IS_PRODUCTION === 'true';
        return isProduction 
            ? 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5' 
            : 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
    }

    // 取得台灣時區的 YYYY/MM/DD HH:mm:ss
    private getTaiwanDateTimeString(): string {
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

}

export default MyPaymentService;