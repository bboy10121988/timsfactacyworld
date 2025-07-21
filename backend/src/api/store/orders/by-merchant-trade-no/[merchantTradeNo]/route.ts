import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  const merchantTradeNo = req.params.merchantTradeNo
  
  console.log(`🔍 Searching for order with MerchantTradeNo: ${merchantTradeNo}`)
  
  try {
    const manager: any = req.scope.resolve("manager")
    const orderRepository = manager.getRepository("Order")
    
    // 查詢包含指定 MerchantTradeNo 的訂單
    let order: any = null
    
    try {
      // 方式1: 使用 jsonb 查詢
      const orders = await orderRepository.createQueryBuilder("order")
        .where("order.metadata ::jsonb @> :metadata", {
          metadata: JSON.stringify({ ecpay_merchant_trade_no: merchantTradeNo })
        })
        .getMany()
      
      if (orders.length > 0) {
        order = orders[0]
        console.log(`✅ Found order via metadata query: ${order.id}`)
      }
    } catch (queryError) {
      console.error('❌ Error querying orders with jsonb:', queryError)
      
      // 方式2: 手動查詢所有訂單
      const allOrders = await orderRepository.find()
      
      order = allOrders.find((o: any) => 
        o.metadata && 
        typeof o.metadata === 'object' && 
        (o.metadata as any).ecpay_merchant_trade_no === merchantTradeNo
      )
      
      if (order) {
        console.log(`✅ Found order via fallback search: ${order.id}`)
      }
    }
    
    if (!order) {
      console.log(`❌ Order not found for MerchantTradeNo: ${merchantTradeNo}`)
      return res.status(404).json({ error: "Order not found" })
    }
    
    // 返回訂單資訊（不包含敏感資訊）
    const orderInfo = {
      id: order.id,
      status: order.status,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      total: order.total,
      currency_code: order.currency_code,
      created_at: order.created_at,
      email: order.email,
      metadata: order.metadata
    }
    
    console.log(`✅ Returning order info for: ${order.id}`)
    return res.json(orderInfo)
    
  } catch (error: any) {
    console.error('💥 Error fetching order:', error)
    return res.status(500).json({ 
      error: "Failed to fetch order",
      details: error.message 
    })
  }
}
