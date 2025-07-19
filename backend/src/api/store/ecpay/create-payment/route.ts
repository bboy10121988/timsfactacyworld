import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../../../services/ecpay"
import crypto from "crypto"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  try {
    // log scope keys for debug
    console.log('scope keys:', Object.keys(req.scope.registrations))
    const { cart, choosePayment, returnUrl, clientBackUrl } = req.body as any
    if (!cart || !cart.items || !cart.total) {
      return res.status(400).json({ error: '缺少購物車資料' })
    }
    // 產生唯一 MerchantTradeNo
    const merchantTradeNo = `ORDER${Date.now().toString().slice(-7)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`
    // 組裝參數
    const paymentParams = {
      MerchantTradeNo: merchantTradeNo,
      TotalAmount: Math.round(cart.total),
      ItemName: cart.items.map((item: any) => `${(item.title || item.variant?.title || item.variant?.product?.title || "商品").replace(/[#&<>%\r\n]/g, '')} x ${item.quantity}`).join('#'),
      TradeDesc: "網站訂單付款",
      ReturnURL: returnUrl || process.env.ECPAY_RETURN_URL,
      ChoosePayment: choosePayment || "ALL",
      ClientBackURL: clientBackUrl || process.env.ECPAY_CLIENT_BACK_URL,
      PaymentType: "aio",
      EncryptType: 1,
    }
    const ecpayService = new EcpayService()
    const html = await ecpayService.createPayment(paymentParams)
    res.json({ html })
    // 嘗試寫入 cart metadata，但不影響付款流程
    try {
      const manager: any = req.scope.resolve("manager")
      const cartRepository = manager.getRepository("Cart")
      const cartEntity = await cartRepository.findOne({ where: { id: cart.id } })
      if (cartEntity) {
        cartEntity.metadata = { ...cartEntity.metadata, ecpay_merchant_trade_no: merchantTradeNo }
        await cartRepository.save(cartEntity)
      }
    } catch (err) {
      console.warn("寫入 cart metadata 失敗，不影響付款流程", err)
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
