import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  const body = req.body as any
  const { RtnCode, MerchantTradeNo } = body

  try {
    // 1. 依 MerchantTradeNo 找 cart
    const manager: any = req.scope.resolve("manager")
    const cartRepository = manager.getRepository("Cart")
    const cart = await cartRepository.findOne({ where: { metadata: { ecpay_merchant_trade_no: MerchantTradeNo } } })

    if (!cart) {
      return res.status(404).send("0|Cart Not Found")
    }

    // 2. 呼叫 Medusa 下單 API 將 cart 轉 order
    if (RtnCode === "1") {
      // 這裡用 HTTP 請求呼叫 /store/carts/{cart.id}/complete
      const fetch = (await import('node-fetch')).default
      const backendUrl = process.env.BACKEND_URL || "http://localhost:9000"
      const completeUrl = `${backendUrl}/store/carts/${cart.id}/complete`
      const response = await fetch(completeUrl, { method: "POST" })
      const result = await response.json()
      // 可選：將 MerchantTradeNo 寫入 order metadata（需查 Medusa v2 order 寫法）
    }
    res.send("1|OK")
  } catch (error) {
    console.error('ECPay callback error:', error)
    res.status(500).send("0|Error")
  }
}
