import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../../../services/ecpay"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  try {
    console.log('🧪 Testing ECPay service...')
    
    // 首先測試 ECPay SDK 能否正常導入
    let ECPayAIO
    try {
      ECPayAIO = (await import("ecpay_aio_nodejs")).default
      console.log('✅ ECPay SDK imported successfully')
    } catch (importError) {
      console.error('❌ Failed to import ECPay SDK:', importError)
      return res.status(500).json({
        success: false,
        error: "Failed to import ECPay SDK",
        details: (importError as Error).message
      })
    }
    
    // 測試 ECPay 配置
    const options = {
      OperationMode: process.env.NODE_ENV === "production" ? "Production" : "Test",
      MercProfile: {
        MerchantID: process.env.ECPAY_MERCHANT_ID || "3002607",
        HashKey: process.env.ECPAY_HASH_KEY || "pwFHCqoQZGmho4w6",
        HashIV: process.env.ECPAY_HASH_IV || "EkRm7iFT261dpevs",
      },
      IgnorePayment: [],
      IsProjectContractor: false,
    }
    
    console.log('🧪 ECPay options:', {
      ...options,
      MercProfile: {
        ...options.MercProfile,
        HashKey: '***' + options.MercProfile.HashKey.slice(-4),
        HashIV: '***' + options.MercProfile.HashIV.slice(-4)
      }
    })
    
    // 初始化 ECPay 實例
    let ecpay
    try {
      ecpay = new ECPayAIO(options)
      console.log('✅ ECPay instance created successfully')
    } catch (initError) {
      console.error('❌ Failed to create ECPay instance:', initError)
      return res.status(500).json({
        success: false,
        error: "Failed to create ECPay instance",
        details: (initError as Error).message
      })
    }
    
    // 測試基本的付款參數
    const testParams = {
      MerchantID: options.MercProfile.MerchantID,
      MerchantTradeNo: `TEST${Date.now()}`,
      MerchantTradeDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace(/[-T]/g, '/').replace(/:\d{2}$/, ''),
      PaymentType: "aio",
      TotalAmount: "100",
      TradeDesc: "測試訂單付款",
      ItemName: "測試商品 x 1",
      ReturnURL: process.env.ECPAY_RETURN_URL || "http://localhost:9000/store/ecpay/callback",
      ChoosePayment: "ALL",
      EncryptType: 1,
    }
    
    console.log('🧪 Test parameters:', testParams)
    
    // 嘗試生成付款表單
    let html
    try {
      html = ecpay.payment_client.aio_check_out_all(testParams)
      console.log('✅ Payment form generated successfully')
      console.log('📄 HTML type:', typeof html)
      console.log('📄 HTML length:', html?.length || 0)
    } catch (paymentError) {
      console.error('❌ Failed to generate payment form:', paymentError)
      return res.status(500).json({
        success: false,
        error: "Failed to generate payment form",
        details: (paymentError as Error).message
      })
    }
    
    return res.json({
      success: true,
      message: "ECPay service test completed",
      results: {
        sdkImported: true,
        instanceCreated: true,
        paymentFormGenerated: true,
        htmlType: typeof html,
        htmlLength: html?.length || 0,
        hasForm: html?.includes('<form') || false,
        preview: html?.substring(0, 500) + '...'
      },
      config: {
        operationMode: options.OperationMode,
        merchantId: options.MercProfile.MerchantID
      }
    })
    
  } catch (error: any) {
    console.error('🧪 ECPay test failed with unexpected error:', error)
    
    return res.status(500).json({
      success: false,
      error: "Unexpected error during ECPay test",
      message: error.message,
      stack: error.stack
    })
  }
}
