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
    const body = req.body as { cartId?: string }
    const { cartId } = body

    if (!cartId) {
      return res.status(400).json({
        error: "cartId 是必需的"
      })
    }

    // 獲取購物車
    const cartModuleService = req.scope.resolve("cartModuleService") as any
    const cart = await cartModuleService.retrieveCart(cartId, {
      relations: ["items", "shipping_methods", "payment_collection", "payment_collection.payment_sessions"]
    })

    if (!cart) {
      return res.status(404).json({
        error: "找不到購物車"
      })
    }

    // 找到 ECPay 支付會話
    const paymentSession = cart.payment_collection?.payment_sessions?.find(
      (session: any) => session.provider_id === "pp_my-payment-service_my-payment-service"
    )

    if (!paymentSession) {
      return res.status(404).json({
        error: "找不到 ECPay 支付會話"
      })
    }

    // 獲取支付提供商實例
    const paymentModuleService = req.scope.resolve("paymentModuleService") as any
    
    // 通過支付模組獲取提供商實例
    const provider = await paymentModuleService.retrieveProvider("my-payment-service")
    
    if (!provider) {
      return res.status(404).json({
        error: "找不到支付提供商"
      })
    }

    console.log("🏗️ 準備生成 ECPay 表單，cart:", {
      id: cart.id,
      total: cart.total,
      items: cart.items?.length || 0
    })

    // 調用支付提供商的 generateEcpayForm 方法
    const htmlForm = await provider.generateEcpayForm(cart)

    if (!htmlForm) {
      return res.status(500).json({
        error: "無法生成 ECPay 支付表單"
      })
    }

    console.log("✅ ECPay 表單生成成功")

    return res.json({
      htmlForm,
      success: true
    })

  } catch (error) {
    console.error("❌ 生成 ECPay 表單錯誤:", error)
    
    if (error instanceof MedusaError) {
      return res.status(error.type === "not_found" ? 404 : 400).json({
        error: error.message
      })
    }

    return res.status(500).json({
      error: "生成 ECPay 表單失敗",
      details: error instanceof Error ? error.message : "未知錯誤"
    })
  }
}
