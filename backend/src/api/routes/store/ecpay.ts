import { Router } from "express"

export default (router: Router) => {
  const ecpayRouter = Router()
  router.use("/ecpay", ecpayRouter)

  /**
   * 生成 ECPay 付款表單的 API 端點
   * 前端會傳送購物車 ID 和支付提供者 ID
   */
  ecpayRouter.post("/generate-form", async (req, res) => {
    const { cart_id, provider_id } = req.body
    
    if (!cart_id) {
      return res.status(400).json({ message: "購物車 ID 不能為空" })
    }
    
    if (!provider_id) {
      return res.status(400).json({ message: "支付提供者 ID 不能為空" })
    }
    
    try {
      // 獲取必要的服務
      const cartService = req.scope.resolve("cartService") as any
      const paymentProviderService = req.scope.resolve("paymentProviderService") as any
      
      // 檢查購物車是否存在
      const cart = await cartService.retrieve(cart_id, {
        relations: ["items", "region", "shipping_methods", "shipping_address"],
      })
      
      if (!cart) {
        return res.status(404).json({ message: "找不到購物車" })
      }
      
      // 檢查支付提供者是否存在
      const provider = paymentProviderService.retrieveProvider(provider_id)
      
      if (!provider) {
        return res.status(404).json({ message: "找不到支付提供者" })
      }
      
      // 生成 ECPay 表單
      // 假設支付提供者有 generateEcpayForm 方法
      if (typeof (provider as any).generateEcpayForm !== "function") {
        return res.status(400).json({ 
          message: "所選支付提供者不支援 ECPay 表單生成",
          provider_id
        })
      }
      
      const form = await (provider as any).generateEcpayForm(cart)
      
      if (!form) {
        return res.status(500).json({ message: "生成表單時發生錯誤" })
      }
      
      // 回傳表單 HTML
      return res.json({ html: form, success: true })
    } catch (error) {
      console.error("生成 ECPay 表單時發生錯誤:", error)
      return res.status(500).json({ 
        message: error.message || "生成表單時發生未知錯誤",
        error: error.stack
      })
    }
  })

  return router
}
