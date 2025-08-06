import { Router } from "express"
import EcpayService from "../../../services/ecpay"

export default () => {
  const router = Router()
  
  // 建立綠界付款
  router.post("/create-payment", async (req, res) => {
    try {
      // 取得 EcpayService 實例
      const ecpayService: EcpayService = req.scope.resolve("ecpayService")
      
      // 取得請求資料
      const paymentData = req.body
      
      // 驗證必要參數
      if (!paymentData.MerchantTradeNo) {
        return res.status(400).json({
          message: "缺少必要參數: MerchantTradeNo"
        })
      }
      
      if (!paymentData.TotalAmount) {
        return res.status(400).json({
          message: "缺少必要參數: TotalAmount"
        })
      }
      
      // 建立付款
      const html = await ecpayService.createPayment(paymentData)
      
      // 回傳付款表單 HTML
      return res.status(200).json({
        success: true,
        html
      })
      
    } catch (error) {
      console.error("建立綠界付款時發生錯誤:", error)
      return res.status(500).json({
        message: error.message || "建立付款時發生錯誤"
      })
    }
  })
  
  // 處理綠界回傳結果
  router.post("/return", async (req, res) => {
    try {
      // 取得 EcpayService 實例
      const ecpayService: EcpayService = req.scope.resolve("ecpayService")
      
      // 驗證回傳資料
      const isValid = ecpayService.verifyCallback(req.body)
      
      if (!isValid) {
        console.error("綠界回傳資料驗證失敗:", req.body)
        return res.status(400).send("0|Error")
      }
      
      console.log("綠界付款回調成功:", req.body)
      
      // 這裡應該處理訂單狀態更新等邏輯
      // 例如: 如果 RtnCode 為 1，則更新訂單為已付款狀態
      
      // 回傳成功訊息給綠界 (必須是 1|OK 格式)
      return res.status(200).send("1|OK")
      
    } catch (error) {
      console.error("處理綠界回傳結果時發生錯誤:", error)
      return res.status(500).send("0|Error")
    }
  })
  
  return router
}
