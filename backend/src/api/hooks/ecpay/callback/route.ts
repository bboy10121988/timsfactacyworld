import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  const timestamp = new Date().toISOString()
  console.log('🔔 ========== ECPay Webhook Callback Received ==========')
  console.log(`⏰ Timestamp: ${timestamp}`)
  console.log(`🌐 Request URL: ${req.url}`)
  console.log(`📡 Request Method: ${req.method}`)
  console.log(`🔗 Request Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`📦 Raw Callback Data:`, JSON.stringify(req.body, null, 2))
  
  try {
    const callbackData = req.body as any
    const { 
      MerchantTradeNo, 
      RtnCode, 
      RtnMsg, 
      TradeNo, 
      TradeAmt, 
      PaymentDate,
      PaymentType,
      PaymentTypeChargeFee,
      TradeDate,
      CheckMacValue
    } = callbackData

    console.log(`💳 ECPay Transaction Details:`)
    console.log(`   - MerchantTradeNo: ${MerchantTradeNo}`)
    console.log(`   - RtnCode: ${RtnCode}`)
    console.log(`   - RtnMsg: ${RtnMsg}`)
    console.log(`   - TradeNo: ${TradeNo}`)
    console.log(`   - TradeAmt: ${TradeAmt}`)
    console.log(`   - PaymentDate: ${PaymentDate}`)
    console.log(`   - PaymentType: ${PaymentType}`)

    // 檢查支付是否成功
    if (RtnCode !== '1') {
      console.log(`❌ Payment failed with code ${RtnCode}: ${RtnMsg}`)
      return res.status(200).send('0|Payment failed')
    }

    console.log('✅ Payment successful!')
    console.log('📝 TODO: Process cart and create order (service integration needed)')
    
    // 暫時回傳成功，等服務整合完成後再處理實際邏輯
    console.log('✅ Sending success response to ECPay: 1|OK')
    return res.status(200).send('1|OK')

  } catch (error) {
    console.error('❌ ECPay callback processing error:', error)
    return res.status(200).send('0|Processing error')
  }
}
