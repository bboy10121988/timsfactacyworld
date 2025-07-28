import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../services/ecpay"

interface ECPayPaymentRequest {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  paymentMethod: 'credit' | 'atm'
  description?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log('💳 ECPay payment initiation request:', new Date().toISOString())
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2))
  
  const { 
    orderId, 
    amount, 
    customerName, 
    customerEmail, 
    paymentMethod,
    description = '商品購買'
  } = req.body as ECPayPaymentRequest

  // 驗證必要參數
  if (!orderId || !amount || !customerName || !customerEmail || !paymentMethod) {
    console.error('❌ Missing required payment parameters')
    return res.status(400).json({ 
      error: 'Missing required parameters',
      required: ['orderId', 'amount', 'customerName', 'customerEmail', 'paymentMethod']
    })
  }

  try {
    const ecpayService = new EcpayService()
    
    // 建立 ECPay 交易參數
    const tradeNo = `ORDER_${orderId}_${Date.now()}`
    console.log(`🎯 Creating ECPay transaction: ${tradeNo}`)

    const ecpayParams = {
      MerchantTradeNo: tradeNo,
      TotalAmount: amount,
      TradeDesc: description,
      ItemName: description,
      ReturnURL: `${process.env.BACKEND_URL}/api/ecpay/callback`,
      ClientBackURL: `${process.env.FRONTEND_URL}/checkout/payment-result`,
      PaymentType: 'aio',
      ChoosePayment: paymentMethod === 'credit' ? 'Credit' : 'ATM'
    }

    console.log('🔧 ECPay parameters:', JSON.stringify(ecpayParams, null, 2))

    // 產生 ECPay 付款表單 HTML
    const paymentForm = await ecpayService.createPayment(ecpayParams)
    
    console.log('✅ ECPay payment form generated successfully')
    console.log(`🌐 Payment method: ${paymentMethod === 'credit' ? '信用卡' : 'ATM轉帳'}`)

    return res.status(200).json({
      success: true,
      tradeNo,
      paymentForm,
      redirectUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
      message: `ECPay ${paymentMethod === 'credit' ? '信用卡' : 'ATM轉帳'} 付款表單已產生`
    })

  } catch (error) {
    console.error('💥 ECPay payment initiation error:', error)
    return res.status(500).json({ 
      error: 'Payment initiation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // 提供 API 文檔和狀態檢查
  console.log('📖 ECPay payment API documentation request')
  
  return res.status(200).json({
    name: 'ECPay Payment API',
    version: '1.0.0',
    description: 'ECPay 綠界支付 API 端點',
    endpoints: {
      POST: {
        description: '建立 ECPay 支付請求',
        parameters: {
          orderId: 'string (required) - 訂單ID',
          amount: 'number (required) - 支付金額',
          customerName: 'string (required) - 客戶姓名',
          customerEmail: 'string (required) - 客戶Email',
          paymentMethod: 'string (required) - 支付方式: credit|atm',
          description: 'string (optional) - 商品描述'
        }
      }
    },
    supportedPaymentMethods: [
      { code: 'credit', name: '綠界刷卡', description: 'Credit card payment via ECPay' },
      { code: 'atm', name: '銀行轉帳(手動)', description: 'ATM/Bank transfer payment' }
    ],
    status: 'active',
    timestamp: new Date().toISOString()
  })
}
