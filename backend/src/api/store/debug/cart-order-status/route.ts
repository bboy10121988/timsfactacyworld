import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  try {
    const manager: any = req.scope.resolve("manager")
    const cartRepository = manager.getRepository("Cart")
    const orderRepository = manager.getRepository("Order")
    
    // 獲取最近的 5 個 cart
    const recentCarts = await cartRepository.find({
      order: { created_at: "DESC" },
      take: 5,
      relations: ['items']
    })
    
    // 獲取最近的 5 個 order
    const recentOrders = await orderRepository.find({
      order: { created_at: "DESC" },
      take: 5
    })
    
    const debug = {
      totalCarts: await cartRepository.count(),
      totalOrders: await orderRepository.count(),
      recentCarts: recentCarts.map(cart => ({
        id: cart.id,
        email: cart.email,
        completed_at: cart.completed_at,
        created_at: cart.created_at,
        metadata: cart.metadata,
        itemCount: cart.items?.length || 0
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        email: order.email,
        status: order.status,
        payment_status: order.payment_status,
        total: order.total,
        created_at: order.created_at,
        metadata: order.metadata
      }))
    }
    
    return res.json(debug)
    
  } catch (error: any) {
    console.error('Debug API error:', error)
    return res.status(500).json({ 
      error: "Debug failed",
      details: error.message 
    })
  }
}
