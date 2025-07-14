import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const body = req.body as any
  const { RtnCode, MerchantTradeNo } = body

  try {
    const orderService = req.scope.resolve("orderService") as any

    if (RtnCode === "1") {
      // 付款成功
      const orderId = MerchantTradeNo // 這裡可能需要轉換回原始訂單ID格式
      await orderService.capturePayment(orderId)
    }
    res.send("1|OK")
  } catch (error) {
    console.error('ECPay callback error:', error)
    res.status(500).send("0|Error")
  }
}
