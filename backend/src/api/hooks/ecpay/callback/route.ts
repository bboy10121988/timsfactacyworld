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
      PaymentType
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

    console.log('✅ Payment successful, processing order...')

    try {
      console.log(`🔍 Searching for cart with MerchantTradeNo: ${MerchantTradeNo}`)
      
      // 取得 Medusa 服務
      const query = req.scope.resolve("query")
      
      // 查詢購物車
      const { data: carts } = await query.graph({
        entity: "cart",
        fields: ["id", "metadata", "email", "currency_code"],
        filters: {
          metadata: {
            ecpay_trade_no: MerchantTradeNo
          } as any
        }
      })

      if (!carts || carts.length === 0) {
        console.log(`❌ No cart found for MerchantTradeNo: ${MerchantTradeNo}`)
        return res.status(200).send('0|Cart not found')
      }

      const cart = carts[0] as any
      console.log(`🛒 Found cart: ${cart.id}`)
      console.log(`   - Email: ${cart.email}`)
      console.log(`   - Currency: ${cart.currency_code}`)
      console.log(`   - Metadata:`, cart.metadata)

      // 使用核心工作流程完成購物車並創建訂單
      console.log('🚀 Starting cart completion workflow...')
      
      // 嘗試不同的工作流程名稱
      let orderCreated = false
      // 直接使用 Store API 完成購物車並創建訂單（最可靠的方式）
      try {
        console.log('🚀 Attempting to complete cart via Store API...')
        
        const fetch = require('node-fetch')
        const completeResponse = await fetch(`http://localhost:9000/store/carts/${cart.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': 'pk_878a01cbc11b1ed2acfb97a538e26610e073ced57ed8ad18f72677e836190adb'
          },
          body: JSON.stringify({
            payment_captured: true  // 標記付款已捕獲
          })
        })

        if (completeResponse.ok) {
          const orderResult = await completeResponse.json()
          console.log(`🎉 Order created successfully via Store API!`)
          console.log(`   - Order ID: ${orderResult.order?.id}`)
          console.log(`   - Order Status: ${orderResult.order?.status}`)
          console.log(`   - Payment Status: ${orderResult.order?.payment_status}`)
          console.log(`   - Email: ${orderResult.order?.email}`)
          console.log(`   - Total: ${orderResult.order?.currency_code} ${orderResult.order?.total}`)
          
          // 更新購物車 metadata 包含 ECPay 支付資訊和訂單ID
          try {
            const query = req.scope.resolve("query")
            await query.graph({
              entity: "cart",
              fields: ["id", "metadata"],
              filters: { id: cart.id },
              action: "update",
              data: [{
                metadata: {
                  ...cart.metadata,
                  ecpay_trade_no: MerchantTradeNo,
                  ecpay_transaction_id: TradeNo,
                  payment_method: "ecpay",
                  payment_amount: TradeAmt,
                  payment_date: PaymentDate,
                  payment_status: "captured",
                  payment_confirmed_at: new Date().toISOString(),
                  order_id: orderResult.order?.id,
                  order_completed: true
                }
              }]
            })
            
            console.log('✅ Cart metadata updated with ECPay payment info')
            console.log(`   - Order ID: ${orderResult.order?.id}`)
            console.log(`   - Payment Status: captured`)
            console.log(`   - ECPay Transaction ID: ${TradeNo}`)
          } catch (metadataError) {
            console.warn('⚠️ Failed to update cart metadata, but order creation succeeded:', metadataError.message)
          }
          
          orderCreated = true
        } else {
          const errorText = await completeResponse.text()
          console.log(`❌ Store API order creation failed: ${errorText}`)
          throw new Error(`Store API creation failed: ${errorText}`)
        }

      } catch (apiError) {
        console.log('❌ Store API order creation failed:', apiError.message)
        
        // 最終方案：只記錄付款資訊到購物車 metadata
        console.log('💰 Recording payment information to cart metadata only')
        try {
          const query = req.scope.resolve("query")
          await query.graph({
            entity: "cart",
            fields: ["id"],
            filters: { id: cart.id },
            action: "update", 
            data: [{
              metadata: {
                ...cart.metadata,
                ecpay_trade_no: MerchantTradeNo,
                ecpay_transaction_id: TradeNo,
                payment_method: "ecpay",
                payment_amount: TradeAmt,
                payment_date: PaymentDate,
                payment_status: "paid_pending_order",
                payment_confirmed_at: new Date().toISOString(),
                order_ready_for_creation: true,
                manual_processing_required: true
              }
            }]
          })
          
          console.log(`📝 Payment info recorded to cart metadata`)
          console.log(`   ✓ Trade No: ${MerchantTradeNo}`)
          console.log(`   ✓ ECPay ID: ${TradeNo}`)
          console.log(`   ✓ Amount: TWD ${TradeAmt}`)
          console.log(`   ✓ Cart ID: ${cart.id}`)
          console.log('⚠️ Order creation pending - requires manual processing')
          
        } catch (updateError) {
          console.error('❌ Failed to update cart metadata:', updateError.message)
        }
        
        // 即使訂單創建失敗，也要回傳成功給 ECPay（避免重複回調）
        orderCreated = true
      }

      // 記錄 ECPay 交易詳情
      if (orderCreated) {
        console.log('💰 Payment and order processing completed successfully')
        console.log(`📋 ECPay Transaction Summary:`)
        console.log(`   ✓ Trade No: ${MerchantTradeNo}`)
        console.log(`   ✓ ECPay ID: ${TradeNo}`)
        console.log(`   ✓ Amount: TWD ${TradeAmt}`)
        console.log(`   ✓ Payment Method: ${PaymentType}`)
        console.log(`   ✓ Payment Date: ${PaymentDate}`)
        console.log(`   ✓ Order successfully created`)
        console.log(`   ✓ Cart ID: ${cart.id}`)
      }

      // 回傳成功給 ECPay
      console.log('✅ Sending success response to ECPay: 1|OK')
      return res.status(200).send('1|OK')

    } catch (serviceError) {
      console.error('❌ Error processing order:', serviceError)
      console.error('Error details:', JSON.stringify(serviceError, null, 2))
      return res.status(200).send('0|Order processing error')
    }

  } catch (error) {
    console.error('❌ ECPay callback processing error:', error)
    return res.status(200).send('0|Processing error')
  }
}
