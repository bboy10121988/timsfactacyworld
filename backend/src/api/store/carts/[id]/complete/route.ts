import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { EntityManager } from "typeorm"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  const cartId = req.params.id
  const { payment_captured = false } = req.body as { payment_captured?: boolean } || {}
  
  console.log(`🛒 Completing cart: ${cartId}, payment_captured: ${payment_captured}`)
  
  try {
    const manager = req.scope.resolve("manager") as EntityManager
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
    
    // 7. 檢查是否為宅配訂單，如果是則發送訂單摘要到儲存端點
    const shippingMethod = cart.shipping_methods?.[0]
    const isHomeDelivery = shippingMethod?.name?.includes('宅配') || 
                          shippingMethod?.name?.toLowerCase().includes('home') ||
                          (cart.metadata && (cart.metadata as any).shipping_type === 'home_delivery')
    
    if (isHomeDelivery) {
      try {
        console.log('🚚 Detected home delivery order, sending order summary for storage...')
        
        // 準備訂單摘要資料用於儲存
        const orderSummary = {
          // 基本訂單資訊
          order_id: savedOrder.id,
          cart_id: cart.id,
          order_number: savedOrder.id, // 訂單編號
          
          // 訂單狀態
          status: savedOrder.status,
          payment_status: savedOrder.payment_status,
          fulfillment_status: savedOrder.fulfillment_status,
          
          // 金額資訊
          subtotal: savedOrder.subtotal || 0,
          shipping_total: savedOrder.shipping_total || 0,
          tax_total: savedOrder.tax_total || 0,
          total: savedOrder.total,
          currency_code: savedOrder.currency_code,
          
          // 客戶資訊
          customer: {
            email: savedOrder.email,
            customer_id: savedOrder.customer_id,
            name: savedOrder.shipping_address ? 
                  `${savedOrder.shipping_address.first_name || ''} ${savedOrder.shipping_address.last_name || ''}`.trim() : 
                  null,
            phone: savedOrder.shipping_address?.phone || null
          },
          
          // 配送資訊
          shipping: {
            method: shippingMethod?.name || 'Home Delivery',
            address: {
              recipient_name: savedOrder.shipping_address ? 
                             `${savedOrder.shipping_address.first_name || ''} ${savedOrder.shipping_address.last_name || ''}`.trim() : 
                             null,
              address_line_1: savedOrder.shipping_address?.address_1 || '',
              address_line_2: savedOrder.shipping_address?.address_2 || '',
              city: savedOrder.shipping_address?.city || '',
              province: savedOrder.shipping_address?.province || '',
              postal_code: savedOrder.shipping_address?.postal_code || '',
              country_code: savedOrder.shipping_address?.country_code || '',
              phone: savedOrder.shipping_address?.phone || ''
            }
          },
          
          // 訂單商品摘要
          items: savedOrder.items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total || (item.unit_price * item.quantity),
            thumbnail: item.thumbnail
          })),
          
          // 時間資訊
          created_at: savedOrder.created_at,
          updated_at: new Date().toISOString(),
          
          // 系統資訊
          source: 'medusa',
          order_type: 'home_delivery',
          metadata: {
            cart_metadata: cart.metadata,
            order_metadata: savedOrder.metadata,
            shipping_method_id: shippingMethod?.id
          }
        }
        
        // 發送訂單摘要到儲存端點
        const fetch = (await import('node-fetch')).default
        const storageUrl = process.env.ORDER_STORAGE_URL || 'http://localhost:9000/app/orders'
        
        const storageResponse = await fetch(storageUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Medusa-Order-Storage/1.0',
            'X-Order-Source': 'medusa-homedelivery'
          },
          body: JSON.stringify(orderSummary)
        })
        
        if (storageResponse.ok) {
          const result = await storageResponse.json()
          console.log(`✅ Order summary sent successfully to storage endpoint: ${storageUrl}`)
          console.log(`📋 Storage response:`, result)
        } else {
          console.warn(`⚠️ Order storage failed: ${storageResponse.status} ${storageResponse.statusText}`)
          const errorText = await storageResponse.text()
          console.warn(`❌ Storage error details:`, errorText)
        }
        
      } catch (storageError) {
        console.error('💥 Error sending order summary to storage:', storageError)
        // 不影響主流程，只記錄錯誤
      }
    }
    
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
