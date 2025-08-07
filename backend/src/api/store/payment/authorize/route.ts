import { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const body = req.body as { cartId?: string; providerId?: string }
    const { cartId, providerId } = body

    if (!cartId || !providerId) {
      return res.status(400).json({
        error: "cartId 和 providerId 是必需的"
      })
    }

    // 獲取購物車
    const cartModuleService = req.scope.resolve("cartModuleService") as any
    const cart = await cartModuleService.retrieveCart(cartId, {
      relations: ["payment_collection", "payment_collection.payment_sessions"]
    })

    if (!cart) {
      return res.status(404).json({
        error: "找不到購物車"
      })
    }

    // 獲取支付模組
    const paymentModuleService = req.scope.resolve("paymentModuleService") as any
    
    // 找到對應的支付會話
    const paymentSession = cart.payment_collection?.payment_sessions?.find(
      (session: any) => session.provider_id === providerId
    )

    if (!paymentSession) {
      return res.status(404).json({
        error: "找不到對應的支付會話"
      })
    }

    console.log("🔐 準備調用 authorizePayment，paymentSession:", paymentSession)

    // 調用支付提供商的 authorizePayment 方法
    const authResult = await paymentModuleService.authorizePaymentSession(
      paymentSession.id,
      {
        // 傳遞必要的上下文數據
        context: {
          cart_id: cartId,
          session_id: paymentSession.id
        }
      }
    )

    console.log("✅ authorizePayment 結果:", authResult)

    return res.json(authResult)

  } catch (error) {
    console.error("❌ 支付授權錯誤:", error)
    
    if (error instanceof MedusaError) {
      return res.status(error.type === "not_found" ? 404 : 400).json({
        error: error.message
      })
    }

    return res.status(500).json({
      error: "支付授權失敗",
      details: error instanceof Error ? error.message : "未知錯誤"
    })
  }
}
