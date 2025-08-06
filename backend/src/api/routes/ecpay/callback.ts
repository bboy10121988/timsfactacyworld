import { Router } from "express"

export default (router: Router) => {
  const ecpayRouter = Router()
  router.use("/ecpay", ecpayRouter)

  /**
   * 處理 ECPay 支付完成後的回調
   * ECPay 將透過 POST 方法發送支付結果到這個端點
   */
  ecpayRouter.post("/callback", async (req, res) => {
    const payload = req.body
    
    // 記錄回調數據，方便調試
    console.log("收到 ECPay 回調數據:", payload)
    
    try {
      // 1. 驗證回調數據的真實性
      // 在這裡應該使用 ECPay SDK 驗證數據簽名
      
      // 2. 解析支付狀態
      const isSuccessful = payload.RtnCode === "1" // ECPay 成功代碼是 1
      
      // 3. 獲取訂單/購物車 ID
      // ECPay 的 MerchantTradeNo 我們之前設置為 cart.id_timestamp
      const merchantTradeNo = payload.MerchantTradeNo
      const cartId = merchantTradeNo.split('_')[0]
      
      // 4. 獲取 Medusa 服務
      const cartService = req.scope.resolve("cartService")
      const orderService = req.scope.resolve("orderService")
      const paymentProviderService = req.scope.resolve("paymentProviderService")
      
      if (isSuccessful) {
        // 5. 更新支付狀態為成功
        // 這裡具體的實現取決於您的業務邏輯
        
        // 如果需要，完成訂單
        try {
          // 這裡可能需要完成訂單處理邏輯
          console.log(`訂單支付成功: ${cartId}`)
        } catch (error) {
          console.error("處理成功訂單時出錯:", error)
        }
      } else {
        // 處理支付失敗的情況
        console.error(`支付失敗: ${payload.RtnMsg}`)
      }
      
      // 6. 回應 ECPay，告知我們已接收到回調
      // ECPay 期望得到一個特定格式的回應
      res.send("1|OK")
    } catch (error) {
      console.error("處理 ECPay 回調時出錯:", error)
      res.status(500).send("0|Error")
    }
  })

  /**
   * 客戶端重定向端點
   * 當客戶完成支付後，ECPay 會將客戶重定向到這個端點
   */
  ecpayRouter.get("/return", (req, res) => {
    // 這裡您可以重定向客戶到訂單確認頁面
    res.redirect("/order/confirmation")
  })

  return router
}
