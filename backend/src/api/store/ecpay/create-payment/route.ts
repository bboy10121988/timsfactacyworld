import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../../../services/ecpay"
import { addTradeMapping } from "../../../../utils/trade-mapping"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('🚀 ECPay create-payment API called')
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2))
  console.log('🔑 API Key:', typeof req.headers['x-publishable-api-key'] === 'string' ? req.headers['x-publishable-api-key'].substring(0, 10) + '...' : req.headers['x-publishable-api-key'])
  
  // 測試階段：暫時繞過 API key 驗證
  if (!req.headers['x-publishable-api-key']) {
    console.log('⚠️ No API key provided, setting test key for debugging')
    req.headers['x-publishable-api-key'] = 'pk_01HJ2WNQMX5HHQK9N3GQWZSPG4'
  }
  
  const body = req.body as any
  const { cart, customer, shippingAddress, shippingMethod, choosePayment, returnUrl, clientBackUrl } = body
  
  if (!cart || !cart.items || !cart.total) {
    return res.status(400).json({ error: '缺少購物車資料' })
  }

  try {
    // 組裝 ECPay 所需的參數格式
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    const tradeDate = `${year}/${month}/${day} ${hour}:${minute}:${second}` // ECPay 正確格式

    // 產生唯一訂單編號 - ECPay 要求最多 20 字符
    // 格式：TIM + 時間戳後8位 + cart ID 的最後8位
    const timestamp = Date.now().toString().slice(-8)
    const cartIdSuffix = cart.id.replace('cart_01K0NDK0KPTBDHCE75E03', '').slice(-8) || timestamp.slice(-4)
    const merchantTradeNo = `TIM${timestamp}${cartIdSuffix}`.slice(0, 20)
    console.log('🏷️ Generated MerchantTradeNo:', merchantTradeNo, '(length:', merchantTradeNo.length, ')')
    
    // 過濾商品名稱特殊字元
    const safeItems = cart.items.map((item: any) => {
      const safeTitle = (item.title || item.variant?.title || item.variant?.product?.title || "商品").replace(/[\#&<>%\r\n]/g, '')
      return `${safeTitle} x ${item.quantity}`
    })
    let itemName = safeItems.join('#')
    if (itemName.length > 400) {
      itemName = itemName.slice(0, 400)
    }

    // 金額必須大於 0
    const totalAmount = Math.round(cart.total || 100)
    if (totalAmount <= 0) {
      throw new Error('訂單金額必須大於 0')
    }
    
    // 設置回調和返回 URL
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
    const backendUrl = process.env.BACKEND_URL || "http://localhost:9000"
    
    const ecpayParams = {
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: tradeDate,
      TotalAmount: totalAmount,
      TradeDesc: "網站訂單付款",
      ItemName: itemName,
      ReturnURL: returnUrl || `${backendUrl}/hooks/ecpay/callback`, // 後端回調 - 修正為正確的端點
      ClientBackURL: clientBackUrl || `${frontendUrl}/tw/account/orders`, // 前端重定向
      ChoosePayment: choosePayment || "ALL",
      EncryptType: 1,
    }

    console.log('🚚 送給綠界的參數:', JSON.stringify(ecpayParams, null, 2))

    // 將 MerchantTradeNo 保存到 trade mapping 中，以便 callback 時能找到對應的 Cart
    try {
      // 使用全域 trade mapping 存儲
      addTradeMapping(merchantTradeNo, {
        cartId: cart.id,
        timestamp: Date.now(),
        totalAmount: totalAmount,
        customer: customer,
        items: cart.items
      })
      
      console.log('✅ Trade mapping stored - MerchantTradeNo:', merchantTradeNo, '-> CartID:', cart.id)
      
    } catch (metadataError) {
      console.error('❌ Failed to store trade mapping:', metadataError)
    }

    // 直接實例化 ECPay 服務
    const ecpayService = new EcpayService()

    // 產生 ECPay 付款表單
    const html = await ecpayService.createPayment(ecpayParams)
    
    res.json({ html })
  } catch (error: any) {
    console.error('ECPay 錯誤:', error)
    res.status(500).json({ 
      error: error.message || "ECPay 付款失敗", 
      details: error.stack 
    })
  }
}
