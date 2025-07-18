import { Router } from "express"
import cors from "cors"

export default (): Router | Router[] => {
  const router = Router()
  router.get('/favicon.ico', (req, res) => res.status(204).end())

  const corsOptions = {
    origin: process.env.STORE_CORS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }

  router.post("/store/ecpay/create-payment", cors(corsOptions), async (req, res) => {
    const { cart_id, shipping_address } = req.body
    const cartService = req.scope.resolve("cartService") as any
    const ecpayService = req.scope.resolve("ecpayService") as any

    try {
      const cart = await cartService.retrieve(cart_id, {
        relations: ["items", "items.variant", "items.variant.product"]
      })

      const orderData = {
        id: cart.id,
        total: cart.total || 0,
        items: cart.items.map((item: any) => ({
          title: item.title || item.variant?.title || item.variant?.product?.title || "商品",
          quantity: item.quantity,
          unit_price: item.unit_price || 0
        }))
      }

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
        await orderService.capturePayment(MerchantTradeNo)
      }
      res.send("1|OK")
    } catch (error) {
      res.status(500).send("0|Error")
    }
  })

  return router
}
