import { Router } from "express"
import cors from "cors"

export default (): Router | Router[] => {
  const router = Router()
  // 新增 favicon.ico 路由，回傳 204
  router.get('/favicon.ico', (req, res) => res.status(204).end())

  const corsOptions = {
    origin: process.env.STORE_CORS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }

  router.post("/store/ecpay/create-payment", cors(corsOptions), async (req, res) => {
    const { cart_id, customer_id, shipping_address, shipping_method } = req.body


    try {
      const orderData = {
        id: cart_id,
        total: 1000, // Demo amount in TWD
        items: [
          {
            title: "Demo Product",
            quantity: 1,
            unit_price: 1000
          }
        ]
      }

      console.log('ECPay 訂單資料:', JSON.stringify(orderData, null, 2))

      const html = `
        <form method="post" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5">
          <input type="hidden" name="MerchantID" value="${process.env.ECPAY_MERCHANT_ID || '3002607'}">
          <input type="hidden" name="MerchantTradeNo" value="DEMO${Date.now()}">
          <input type="hidden" name="MerchantTradeDate" value="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
          <input type="hidden" name="PaymentType" value="aio">
          <input type="hidden" name="TotalAmount" value="${orderData.total}">
          <input type="hidden" name="TradeDesc" value="Tim's Factory World Demo Order">
          <input type="hidden" name="ItemName" value="${orderData.items.map(item => item.title).join('#')}">
          <input type="hidden" name="ReturnURL" value="${process.env.NEXT_PUBLIC_BASE_URL}/api/ecpay/callback">
          <input type="hidden" name="ChoosePayment" value="ALL">
          <input type="hidden" name="EncryptType" value="1">
          <input type="submit" value="前往付款" class="btn btn-primary">
        </form>
      `
      
      res.json({ html })
    } catch (error: any) {
      console.error('ECPay API Error:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post("/store/ecpay/callback", async (req, res) => {
    const { RtnCode, MerchantTradeNo } = req.body

    try {
      if (RtnCode === "1") {
        console.log(`ECPay payment successful for order: ${MerchantTradeNo}`)
      }
      res.send("1|OK")
    } catch (error) {
      console.error('ECPay callback error:', error)
      res.status(500).send("0|Error")
    }
  })

  return router
}
