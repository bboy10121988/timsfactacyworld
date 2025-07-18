import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../../../services/ecpay"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  console.log('🚀🚀🚀 ECPay API 被呼叫！！！')
  console.log('⏰ 時間:', new Date().toISOString())
  console.log('🌐 請求來源:', req.headers['user-agent'])
  console.log('📍 請求 IP:', req.ip || req.connection?.remoteAddress)
  console.log('🔑 API Key:', typeof req.headers['x-publishable-api-key'] === 'string' ? req.headers['x-publishable-api-key'].substring(0, 10) + '...' : req.headers['x-publishable-api-key'])
  
  const body = req.body as any
  const { cart, customer, shippingAddress, shippingMethod, choosePayment, returnUrl, clientBackUrl } = body
  
  if (!cart || !cart.items || !cart.total) {
    return res.status(400).json({ error: '缺少購物車資料' })
  }

  try {
    // 用前端傳來的 cart 組合 orderData
    const orderData = {
      id: cart.id,
      total: cart.total,
      items: cart.items.map((item: any) => ({
        title: item.title || item.variant?.title || item.variant?.product?.title || "商品",
        quantity: item.quantity,
        unit_price: item.unit_price || 0
      })),
      choosePayment: choosePayment || "ALL",
      returnUrl: returnUrl,
      clientBackUrl: clientBackUrl
    }

    // 直接實例化 ECPay 服務
    const ecpayService = new EcpayService({})

    // 產生 ECPay 付款表單，傳入動態參數
    const html = await ecpayService.createPayment(orderData, shippingAddress)
    
    res.json({ html })
  } catch (error: any) {
    console.error('ECPay API Error:', error)
    res.status(500).json({ error: error.message })
  }
}
