import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import EcpayService from "../../services/ecpay"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('🔔 ECPay callback received:', new Date().toISOString())
  console.log('📦 Callback body:', req.body)
  
  const body = req.body as any
  const { RtnCode, MerchantTradeNo, TradeNo, TradeAmt, PaymentDate, PaymentType, CheckMacValue } = body

  try {
    // 1. 驗證 ECPay CheckMacValue (安全性檢查)
    const ecpayService = new EcpayService()
    const isValidCallback = ecpayService.verifyCallback(body)
    
    if (!isValidCallback) {
      console.error('❌ ECPay callback verification failed')
      return res.status(400).send("0|CheckMacValue Invalid")
    }

    console.log('✅ ECPay callback verification passed')

    // 2. 依 MerchantTradeNo 找 cart
    const manager: any = req.scope.resolve("manager")
    const cartRepository = manager.getRepository("Cart")
    
    let cart: any = null
    
    // 方法1: 使用 metadata 查詢
    try {
      const carts = await cartRepository.find({
        where: {
          completed_at: null
        }
      })
      
      for (const c of carts) {
        console.log(`Cart ${c.id} metadata:`, c.metadata)
        if (c.metadata && 
            typeof c.metadata === 'object' && 
            (c.metadata as any).ecpay_merchant_trade_no === MerchantTradeNo) {
          cart = c
          console.log(`✅ Found cart via manual search: ${cart.id}`)
          break
        }
      }
    } catch (searchError) {
      console.warn('⚠️ Failed to search carts:', searchError)
    }
    
    if (!cart) {
      console.error(`❌ Cart not found for MerchantTradeNo: ${MerchantTradeNo}`)
      return res.status(404).send("0|Cart Not Found")
    }

    console.log(`📋 Found cart: ${cart.id}`)

    // 3. 檢查付款狀態並完成訂單
    if (RtnCode === "1") {
      console.log('💰 Payment successful, completing order...')
      
      try {
        // 使用 HTTP 請求完成購物車（更可靠的方式）
        const fetch = (await import('node-fetch')).default
        const backendUrl = process.env.BACKEND_URL || "http://localhost:9000"
        const completeUrl = `${backendUrl}/store/carts/${cart.id}/complete`
        
        const response = await fetch(completeUrl, { 
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify({ payment_captured: true })
        })
        
        if (response.ok) {
          const result: any = await response.json()
          console.log('✅ Order completed successfully:', result)
          
          // 如果有訂單 ID，更新 metadata
          if (result.order?.id) {
            try {
              const orderRepository = manager.getRepository("Order")
              const existingOrder = await orderRepository.findOne({ where: { id: result.order.id } })
              
              if (existingOrder) {
                existingOrder.metadata = {
                  ...existingOrder.metadata,
                  ecpay_merchant_trade_no: MerchantTradeNo,
                  ecpay_trade_no: TradeNo,
                  ecpay_payment_date: PaymentDate,
                  ecpay_payment_type: PaymentType,
                  ecpay_trade_amt: TradeAmt
                }
                await orderRepository.save(existingOrder)
                console.log('✅ Order metadata updated successfully')
              }
            } catch (metadataError) {
              console.warn('⚠️ Failed to update order metadata:', metadataError)
            }
          }
        } else {
          console.error('❌ Failed to complete cart:', response.statusText)
          throw new Error(`Failed to complete cart: ${response.statusText}`)
        }
        
      } catch (completeError) {
        console.error('❌ Error completing cart:', completeError)
        throw completeError
      }
      
    } else {
      console.log(`❌ Payment failed with RtnCode: ${RtnCode}`)
      // 可以在這裡處理付款失敗的邏輯
    }
    
    // 回應 ECPay 成功收到 callback
    res.send("1|OK")
    
  } catch (error) {
    console.error('💥 ECPay callback error:', error)
    res.status(500).send("0|Error")
  }
}
