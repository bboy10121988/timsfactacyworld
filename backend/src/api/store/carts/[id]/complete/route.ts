import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  const cartId = req.params.id
  const { payment_captured = false } = req.body || {}
  
  console.log(`🛒 Completing cart: ${cartId}, payment_captured: ${payment_captured}`)
  
  try {
    const manager: any = req.scope.resolve("manager")
    const cartRepository = manager.getRepository("Cart")
    const orderRepository = manager.getRepository("Order")
    
    // 1. 找到購物車
    const cart = await cartRepository.findOne({ 
      where: { id: cartId },
      relations: ['items', 'items.variant', 'items.variant.product', 'shipping_address', 'billing_address', 'region']
    })
    
    if (!cart) {
      console.error(`❌ Cart not found: ${cartId}`)
      return res.status(404).json({ error: "Cart not found" })
    }
    
    console.log(`📦 Found cart with ${cart.items?.length || 0} items`)
    console.log(`📦 Cart details:`, {
      id: cart.id,
      email: cart.email,
      customer_id: cart.customer_id,
      region_id: cart.region_id,
      currency: cart.region?.currency_code,
      completed_at: cart.completed_at,
      metadata: cart.metadata
    })
    
    // 2. 檢查購物車是否已經完成
    if (cart.completed_at) {
      console.log('⚠️ Cart already completed')
      const existingOrder = await orderRepository.findOne({ 
        where: { cart_id: cartId }
      })
      
      if (existingOrder) {
        return res.json({ 
          order: existingOrder,
          message: "Cart already completed"
        })
      }
    }
    
    // 3. 驗證購物車必要資訊
    if (!cart.items || cart.items.length === 0) {
      console.error(`❌ Cart is empty: ${cartId}`)
      return res.status(400).json({ error: "Cart is empty" })
    }
    
    if (!cart.email) {
      console.error(`❌ Cart missing email: ${cartId}`)
      return res.status(400).json({ error: "Email is required" })
    }
    
    if (!cart.shipping_address) {
      console.error(`❌ Cart missing shipping address: ${cartId}`)
      return res.status(400).json({ error: "Shipping address is required" })
    }
    
    // 4. 計算總金額
    const subtotal = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity)
    }, 0)
    
    const shipping_total = cart.shipping_total || 0
    const tax_total = cart.tax_total || 0
    const total = subtotal + shipping_total + tax_total
    
    // 5. 創建訂單
    const orderData = {
      cart_id: cartId,
      customer_id: cart.customer_id,
      email: cart.email,
      region_id: cart.region_id,
      currency_code: cart.region?.currency_code || 'TWD',
      subtotal: subtotal,
      tax_total: tax_total,
      shipping_total: shipping_total,
      total: total,
      status: payment_captured ? 'pending' : 'pending', // 訂單狀態
      payment_status: payment_captured ? 'captured' : 'awaiting', // 付款狀態：如果已付款則為 captured
      fulfillment_status: 'not_fulfilled', // 履行狀態
      shipping_address: cart.shipping_address,
      billing_address: cart.billing_address || cart.shipping_address,
      items: cart.items.map((item: any) => ({
        variant_id: item.variant_id,
        product_id: item.variant?.product_id,
        title: item.title || item.variant?.title || item.variant?.product?.title,
        description: item.description,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.unit_price * item.quantity,
        metadata: item.metadata
      })),
      metadata: cart.metadata
    }
    
    console.log('🏗️ Creating order with data:', {
      cart_id: orderData.cart_id,
      email: orderData.email,
      total: orderData.total,
      items_count: orderData.items.length
    })
    
    const order = orderRepository.create(orderData)
    const savedOrder = await orderRepository.save(order)
    
    // 6. 標記購物車為已完成
    cart.completed_at = new Date()
    await cartRepository.save(cart)
    
    console.log(`✅ Order created successfully: ${savedOrder.id}`)
    
    return res.json({
      order: savedOrder,
      message: "Cart completed successfully"
    })
    
  } catch (error: any) {
    console.error('💥 Error completing cart:', error)
    return res.status(500).json({ 
      error: "Failed to complete cart",
      details: error.message 
    })
  }
}
