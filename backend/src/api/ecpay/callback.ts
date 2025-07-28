import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../services/ecpay"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log('🔔 ECPay callback received at /api/ecpay/callback:', new Date().toISOString())
  console.log('📦 Callback body:', JSON.stringify(req.body, null, 2))
  
  const body = req.body as any
  const { 
    MerchantID,
    MerchantTradeNo, 
    RtnCode, 
    RtnMsg, 
    TradeNo, 
    TradeAmt, 
    PaymentDate, 
    PaymentType,
    CheckMacValue 
  } = body

  try {
    // 1. 驗證 ECPay CheckMacValue (安全性檢查)
    const ecpayService = new EcpayService()
    const isValidCallback = ecpayService.verifyCallback(body)
    
    if (!isValidCallback) {
      console.error('❌ ECPay callback verification failed')
      return res.status(400).json({ error: 'Invalid callback verification' })
    }
    
    console.log('✅ ECPay callback verification passed')
    console.log(`💰 Payment info: TradeNo=${TradeNo}, Amount=${TradeAmt}, Status=${RtnCode}`)

    // 2. 根據付款狀態處理訂單
    if (RtnCode === "1") {
      console.log('✅ Payment successful, updating order status...')
      
      // TODO: 這裡應該要更新 Medusa 的 payment session 和訂單狀態
      // 目前先返回成功
      
      console.log('📧 Payment success notification sent')
    } else {
      console.log(`❌ Payment failed: ${RtnMsg}`)
      
      // TODO: 處理付款失敗的情況
    }

    // 3. 回應 ECPay（必須返回 "1|OK" 表示成功收到）
    console.log('✅ Callback processed successfully, responding to ECPay')
    return res.status(200).send("1|OK")

  } catch (error) {
    console.error('💥 ECPay callback error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // 提供一個簡單的健康檢查端點
  console.log('🏥 ECPay callback health check')
  return res.status(200).json({ 
    status: 'ok', 
    message: 'ECPay callback endpoint is working',
    timestamp: new Date().toISOString()
  })
}