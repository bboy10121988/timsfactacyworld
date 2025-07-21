import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../../../services/ecpay"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('🚀 ECPay create-payment API called')
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2))
  console.log('🔑 API Key:', typeof req.headers['x-publishable-api-key'] === 'string' ? req.headers['x-publishable-api-key'].substring(0, 10) + '...' : req.headers['x-publishable-api-key'])
  
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

    // 產生唯一訂單編號
    const merchantTradeNo = `ORDER${Date.now().toString().slice(-7)}`
    
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
      ReturnURL: returnUrl || `${backendUrl}/store/ecpay/callback`, // 後端回調
      ClientBackURL: clientBackUrl || `${frontendUrl}/api/ecpay/success`, // 前端成功頁面
      ChoosePayment: choosePayment || "ALL",
      EncryptType:1,
    }

    console.log('🚚 送給綠界的參數:', JSON.stringify(ecpayParams, null, 2))

    // 將 MerchantTradeNo 保存到 Cart 的 metadata 中，以便 callback 時能找到對應的 Cart
    try {
      const manager: any = req.scope.resolve("manager")
      const cartRepository = manager.getRepository("Cart")
      
      const existingCart = await cartRepository.findOne({ where: { id: cart.id } })
      if (existingCart) {
        existingCart.metadata = {
          ...existingCart.metadata,
          ecpay_merchant_trade_no: merchantTradeNo,
          ecpay_created_at: new Date().toISOString(),
          ecpay_total_amount: totalAmount
        }
        await cartRepository.save(existingCart)
        console.log('✅ Cart metadata updated with MerchantTradeNo:', merchantTradeNo)
      }
    } catch (metadataError) {
      console.warn('⚠️ Failed to update cart metadata:', metadataError)
      // 繼續處理，不中斷付款流程
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
