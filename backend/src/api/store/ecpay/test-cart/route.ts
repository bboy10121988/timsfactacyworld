import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  try {
    console.log('🧪 Testing cart data structure...')
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2))
    
    const { cart, customer, shippingAddress, shippingMethod, selectedStore } = req.body as any
    
    const analysis = {
      cart: {
        exists: !!cart,
        id: cart?.id,
        total: cart?.total,
        totalType: typeof cart?.total,
        items: cart?.items ? {
          count: cart.items.length,
          structure: cart.items.map((item: any, index: number) => ({
            index,
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            variant: {
              title: item.variant?.title,
              product_title: item.variant?.product?.title
            }
          }))
        } : null
      },
      customer: {
        exists: !!customer,
        id: customer?.id,
        email: customer?.email
      },
      shippingAddress: {
        exists: !!shippingAddress,
        structure: shippingAddress ? Object.keys(shippingAddress) : []
      },
      shippingMethod: {
        exists: !!shippingMethod,
        value: shippingMethod
      },
      selectedStore: {
        exists: !!selectedStore,
        structure: selectedStore ? Object.keys(selectedStore) : []
      }
    }
    
    console.log('📊 Cart analysis:', JSON.stringify(analysis, null, 2))
    
    return res.json({
      success: true,
      message: "Cart data analysis completed",
      analysis
    })
    
  } catch (error: any) {
    console.error('🧪 Cart analysis failed:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
