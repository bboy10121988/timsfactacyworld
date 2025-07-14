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
  const { cart_id, customer_id, shipping_address, shipping_method } = body
  
  console.log('📦 收到的參數:')
  console.log('- cart_id:', cart_id)
  console.log('- customer_id:', customer_id)
  console.log('- shipping_address:', !!shipping_address ? '✅ 有地址' : '❌ 無地址')
  console.log('- shipping_method:', shipping_method)

  try {
    // 暫時使用模擬數據進行測試
    const mockCart = {
      id: cart_id,
      total: 100, // 測試最小金額
      items: [
        {
          title: "測試商品A",
          quantity: 1,
          unit_price: 100
        }
      ]
    }

    console.log('💰 使用固定金額 100 元進行測試')
    console.log('📦 模擬購物車:', JSON.stringify(mockCart, null, 2))

    // 直接實例化 ECPay 服務
    const ecpayService = new EcpayService({})

    // 2. 建立訂單資料結構
    const orderData = {
      id: mockCart.id,
      total: 100, // 固定使用 100 元
      items: mockCart.items.map((item: any) => ({
        title: item.title || "商品",
        quantity: item.quantity,
        unit_price: item.unit_price || 0
      }))
    }

    console.log('📋 ECPay 訂單資料:', JSON.stringify(orderData, null, 2))
    console.log('🏠 收件地址:', JSON.stringify(shipping_address, null, 2))

    // 3. 產生 ECPay 付款表單
    console.log('🔄 開始調用 ECPay 服務...')
    const html = await ecpayService.createPayment(orderData, shipping_address)
    
    console.log('✅ ECPay 服務調用成功')
    console.log('返回 HTML 長度:', html?.length || 0)
    
    if (!html || html.length < 100) {
      console.log('⚠️  ECPay 返回的 HTML 太短，可能有問題')
      console.log('HTML 內容:', html)
    }
    
    res.json({ html })
  } catch (error: any) {
    console.error('ECPay API Error:', error)
    res.status(500).json({ error: error.message })
  }
}
