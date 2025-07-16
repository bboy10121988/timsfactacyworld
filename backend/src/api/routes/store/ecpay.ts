import { Router } from "express"
import cors from "cors"
import { getConfigFile } from "medusa-core-utils"
import { ConfigModule } from "@medusajs/medusa"

export default (rootDirectory: string): Router | Router[] => {
  const router = Router()
  // 新增 favicon.ico 路由，回傳 204
  router.get('/favicon.ico', (req, res) => res.status(204).end())
  const { configModule } = getConfigFile<ConfigModule>(rootDirectory, "medusa-config")
  const { projectConfig } = configModule

  const corsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  }

  router.post("/store/ecpay/create-payment", cors(corsOptions), async (req, res) => {
    const { cart_id, customer_id, shipping_address, shipping_method } = req.body

    const cartService = req.scope.resolve("cartService") as any
    const orderService = req.scope.resolve("orderService") as any
    const ecpayService = req.scope.resolve("ecpayService") as any

    try {
      // 1. 獲取購物車
      const cart = await cartService.retrieve(cart_id, {
        relations: ["items", "items.variant", "items.variant.product"]
      })

      // 2. 建立訂單資料結構（模擬，因為我們只需要用於 ECPay）
      const orderData = {
        id: cart.id,
        total: cart.total || 0,
        items: cart.items.map((item: any) => ({
          title: item.title || item.variant?.title || item.variant?.product?.title || "商品",
          quantity: item.quantity,
          unit_price: item.unit_price || 0
        }))
      }

      console.log('ECPay 訂單資料:', JSON.stringify(orderData, null, 2))

      // 3. 產生 ECPay 付款表單
      const html = await ecpayService.createPayment(orderData, shipping_address)
      res.json({ html })
    } catch (error: any) {
      console.error('ECPay API Error:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post("/store/ecpay/callback", async (req, res) => {
    const { RtnCode, MerchantTradeNo } = req.body
    const orderService = req.scope.resolve("orderService") as any

    try {
      if (RtnCode === "1") {
        // 付款成功
        const orderId = MerchantTradeNo // 這裡可能需要轉換回原始訂單ID格式
        await orderService.capturePayment(orderId)
      }
      res.send("1|OK")
    } catch (error) {
      res.status(500).send("0|Error")
    }
  })

  return router
}
