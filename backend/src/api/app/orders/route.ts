import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// 定義訂單摘要資料類型（用於儲存）
interface OrderSummaryForStorage {
  // 基本訂單資訊
  order_id: string
  cart_id: string
  order_number: string
  
  // 訂單狀態
  status: string
  payment_status: string
  fulfillment_status: string
  
  // 金額資訊
  subtotal: number
  shipping_total: number
  tax_total: number
  total: number
  currency_code: string
  
  // 客戶資訊
  customer: {
    email: string
    customer_id?: string
    name?: string
    phone?: string
  }
  
  // 配送資訊
  shipping: {
    method: string
    address: {
      recipient_name?: string
      address_line_1: string
      address_line_2?: string
      city: string
      province?: string
      postal_code: string
      country_code: string
      phone: string
    }
  }
  
  // 訂單商品摘要
  items: Array<{
    product_id?: string
    variant_id?: string
    title: string
    quantity: number
    unit_price: number
    total_price: number
    thumbnail?: string
  }>
  
  // 時間資訊
  created_at: string
  updated_at: string
  
  // 系統資訊
  source: string
  order_type: string
  metadata?: any
}

// 訂單儲存端點
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  console.log('� Order Storage Endpoint - Received order summary:', new Date().toISOString())
  
  try {
    const orderSummary = req.body as OrderSummaryForStorage
    
    // 記錄收到的訂單摘要
    console.log('📦 Order Summary for Storage:', {
      order_id: orderSummary.order_id,
      order_number: orderSummary.order_number,
      customer_email: orderSummary.customer.email,
      total: orderSummary.total,
      currency: orderSummary.currency_code,
      items_count: orderSummary.items?.length || 0,
      shipping_method: orderSummary.shipping.method,
      order_type: orderSummary.order_type
    })
    
    // 驗證必要欄位
    if (!orderSummary.order_id || !orderSummary.customer.email || !orderSummary.shipping.address) {
      console.error('❌ Missing required fields for order storage')
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for order storage',
        required_fields: ['order_id', 'customer.email', 'shipping.address']
      })
    }
    
    // 模擬訂單儲存邏輯
    console.log('� Storing order summary...')
    console.log(`   📋 Order ID: ${orderSummary.order_id}`)
    console.log(`   👤 Customer: ${orderSummary.customer.email}`)
    console.log(`   📍 Address: ${orderSummary.shipping.address.address_line_1}, ${orderSummary.shipping.address.city}`)
    console.log(`   💰 Total: ${orderSummary.currency_code} ${orderSummary.total}`)
    console.log(`   📦 Items: ${orderSummary.items.length} items`)
    console.log(`   🚚 Shipping: ${orderSummary.shipping.method}`)
    
    // 詳細商品資訊
    console.log('🛍️  Order Items:')
    orderSummary.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} - Qty: ${item.quantity} - Price: ${orderSummary.currency_code} ${item.unit_price}`)
    })
    
    // 這裡可以加入實際的儲存邏輯
    // 例如：
    // - 儲存到資料庫
    // - 發送到外部系統
    // - 觸發履行流程
    // - 發送確認郵件
    
    // 模擬儲存成功
    const storageResult = {
      stored_order_id: orderSummary.order_id,
      storage_id: `storage_${Date.now()}`,
      stored_at: new Date().toISOString(),
      status: 'stored_successfully'
    }
    
    console.log('✅ Order summary stored successfully:', storageResult)
    
    // 成功回應
    return res.status(200).json({
      success: true,
      message: 'Order summary stored successfully',
      data: storageResult,
      processed_at: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('💥 Error storing order summary:', error)
    return res.status(500).json({
      success: false,
      message: 'Error storing order summary',
      error: error.message
    })
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<any> {
  return res.json({
    message: 'Order Storage Endpoint',
    description: 'This endpoint receives and stores order summaries from Medusa',
    methods: ['POST'],
    trigger: 'When a home delivery cart is completed in Medusa',
    storage_purpose: 'Store order summaries for external systems and fulfillment',
    expected_data: {
      order_id: 'string - Unique order identifier',
      order_number: 'string - Human readable order number',
      status: 'string - Order status (pending, completed, etc.)',
      payment_status: 'string - Payment status (captured, pending, etc.)',
      fulfillment_status: 'string - Fulfillment status (not_fulfilled, fulfilled, etc.)',
      total: 'number - Total order amount',
      currency_code: 'string - Currency code (TWD, USD, etc.)',
      customer: {
        email: 'string - Customer email',
        name: 'string - Customer full name',
        phone: 'string - Customer phone number'
      },
      shipping: {
        method: 'string - Shipping method name',
        address: 'object - Complete shipping address'
      },
      items: 'array - Order items with product details',
      source: 'string - Source system (medusa)',
      order_type: 'string - Order type (home_delivery)'
    },
    response_format: {
      success: 'boolean',
      message: 'string',
      data: 'object - Storage result',
      processed_at: 'string - ISO timestamp'
    }
  })
}
