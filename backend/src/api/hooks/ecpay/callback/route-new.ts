import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { getTradeMapping, removeTradeMapping } from "../../../../utils/trade-mapping"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('🔔 ECPay Callback received!')
  console.log('📦 Callback payload:', JSON.stringify(req.body, null, 2))

  const {
    RtnCode,
    RtnMsg,
    MerchantTradeNo,
    TradeNo,
    PaymentDate,
    PaymentType,
    PaymentTypeChargeFee,
    TradeAmt,
    SimulatePaid
  } = req.body

  // 根據 ECPay 文檔，付款成功時 RtnCode 為 "1"
  if (RtnCode === "1") {
    console.log('✅ ECPay payment successful!')
    
    try {
      // 從 trade mapping 中查找對應的購物車
      const tradeMapping = getTradeMapping(MerchantTradeNo)
      
      if (!tradeMapping) {
        console.error('❌ Cart not found for MerchantTradeNo:', MerchantTradeNo)
        return res.status(404).json({ 
          success: false, 
          error: 'Cart not found for this trade number',
          merchantTradeNo: MerchantTradeNo
        })
      }

      console.log('🎯 Found cart for callback:', tradeMapping.cartId)

      // 建立訂單
      const query = req.scope.resolve("query")
      
      // 獲取購物車詳細資料
      const cartData = await query.graph({
        entity: "cart",
        fields: ["*", "items.*", "items.variant.*", "items.variant.product.*", "shipping_address.*", "billing_address.*"],
        filters: { id: tradeMapping.cartId }
      })

      if (!cartData || cartData.length === 0) {
        console.error('❌ Cart data not found:', tradeMapping.cartId)
        return res.status(404).json({ 
          success: false, 
          error: 'Cart data not found' 
        })
      }

      const cart = cartData[0]
      console.log('📋 Cart details for order creation:', {
        id: cart.id,
        total: cart.total,
        itemsCount: cart.items?.length || 0
      })

      // 創建訂單（簡化版本）
      const orderData = {
        cart_id: cart.id,
        status: "pending",
        payment_status: "captured",
        fulfillment_status: "not_fulfilled",
        currency_code: cart.currency_code || "TWD",
        email: cart.email,
        region_id: cart.region_id,
        customer_id: cart.customer_id,
        sales_channel_id: cart.sales_channel_id,
        shipping_address: cart.shipping_address,
        billing_address: cart.billing_address || cart.shipping_address,
        items: cart.items,
        metadata: {
          ecpay_trade_no: MerchantTradeNo,
          ecpay_payment_date: PaymentDate,
          ecpay_payment_type: PaymentType,
          ecpay_trade_amt: TradeAmt,
          payment_provider: "ecpay"
        }
      }

      console.log('🛒 Creating order with data:', JSON.stringify(orderData, null, 2))
      
      // 使用 Store API 創建訂單
      const storeApiUrl = `http://localhost:9000/store/orders`
      const storeResponse = await fetch(storeApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'
        },
        body: JSON.stringify(orderData)
      })

      if (storeResponse.ok) {
        const orderResult = await storeResponse.json()
        console.log('🎉 Order created successfully:', orderResult)
        
        // 清理 trade mapping
        removeTradeMapping(MerchantTradeNo)
        
        return res.status(200).json({ 
          success: true, 
          orderId: orderResult.id || orderResult.order?.id,
          message: "Order created successfully"
        })
      } else {
        const errorText = await storeResponse.text()
        console.error('❌ Failed to create order via Store API:', errorText)
        
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create order',
          details: errorText
        })
      }

    } catch (error) {
      console.error('❌ Error processing ECPay callback:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      })
    }
  } else {
    console.log('❌ ECPay payment failed or pending. RtnCode:', RtnCode, 'RtnMsg:', RtnMsg)
    return res.status(400).json({ 
      success: false, 
      error: 'Payment failed or pending',
      rtnCode: RtnCode,
      rtnMsg: RtnMsg
    })
  }
}
