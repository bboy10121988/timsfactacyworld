import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { EntityManager } from "typeorm"
import { generateEntityId } from "@medusajs/framework/utils"

interface BankTransferRequest {
  cart_id: string
}

export const POST = async (
  req: MedusaRequest<BankTransferRequest>,
  res: MedusaResponse
) => {
  try {
    const { cart_id } = req.body

    if (!cart_id) {
      return res.status(400).json({
        error: "cart_id is required"
      })
    }

    console.log(`🏦 處理銀行轉帳訂單建立，Cart ID: ${cart_id}`)

    // 獲取資料庫連接
    const manager = req.scope.resolve("manager") as EntityManager
    
    // 先獲取購物車資料
    console.log(`📋 正在獲取購物車資料...`)
    const cartResponse = await fetch(`http://localhost:9000/store/carts/${cart_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': req.headers['x-publishable-api-key'] as string
      }
    })

    if (!cartResponse.ok) {
      console.error('❌ 無法獲取購物車資料')
      return res.status(400).json({
        error: "Cart not found"
      })
    }

    const cartData = await cartResponse.json()
    const cart = cartData.cart

    console.log(`📦 購物車資料: 商品數量 ${cart.items?.length || 0}, 總金額: ${cart.total}`)

    // 檢查購物車是否有商品
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        error: "Cart is empty"
      })
    }

    // 生成銀行轉帳資訊
    const bankTransferInfo = {
      bank_name: "台灣銀行",
      account_name: "Tim's Fantasy World",
      account_number: "123-456-789-001",
      reference_number: `TIM-${Date.now()}`,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days later
      notes: "請在轉帳時註明參考編號，並保留轉帳收據作為付款證明。",
      instructions: [
        "1. 登入您的網路銀行或前往銀行櫃台",
        "2. 選擇轉帳功能",
        "3. 輸入收款帳戶資訊",
        "4. 在備註欄填入參考編號",
        "5. 確認轉帳金額並完成轉帳",
        "6. 保留轉帳收據作為付款證明"
      ]
    }

    // 開始資料庫事務
    console.log(`💾 開始寫入訂單到資料庫...`)
    const result = await manager.transaction(async (transactionalEntityManager: EntityManager) => {
      // 生成真正的 Medusa 訂單 ID
      const orderId = generateEntityId("", "order")
      
      // 1. 建立主訂單記錄
      const orderData = {
        id: orderId,
        region_id: cart.region_id,
        customer_id: cart.customer_id,
        email: cart.email || "bank.transfer.test@example.com",
        currency_code: cart.currency_code || "TWD",
        status: "pending",
        sales_channel_id: cart.sales_channel_id,
        shipping_address_id: cart.shipping_address?.id,
        billing_address_id: cart.billing_address?.id,
        metadata: {
          payment_method: "bank_transfer",
          bank_transfer_info: bankTransferInfo,
          cart_id: cart_id,
          bank_transfer_created_at: new Date().toISOString()
        },
        created_at: new Date(),
        updated_at: new Date()
      }

      console.log(`📝 插入訂單記錄: ${orderId}`)
      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into("order")
        .values(orderData)
        .execute()

      // 2. 建立訂單商品項目
      for (const item of cart.items) {
        const lineItemId = generateEntityId("", "oli")
        const lineItemData = {
          id: lineItemId,
          order_id: orderId,
          title: item.title || item.product_title,
          subtitle: item.subtitle,
          thumbnail: item.thumbnail,
          variant_id: item.variant_id,
          product_id: item.product_id,
          product_title: item.product_title,
          product_description: item.product_description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: new Date(),
          updated_at: new Date()
        }

        console.log(`📦 插入商品項目: ${item.title} x ${item.quantity}`)
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into("order_line_item")
          .values(lineItemData)
          .execute()
      }

      return orderId
    })

    console.log(`✅ 銀行轉帳訂單成功寫入資料庫！訂單 ID: ${result}`)
    
    return res.status(200).json({
      success: true,
      order_id: result,
      cart_id: cart_id,
      bank_transfer_info: bankTransferInfo,
      message: "銀行轉帳訂單建立成功並已存入資料庫，請按照銀行轉帳資訊完成付款",
      status: "pending_payment",
      order: {
        id: result,
        total: cart.total,
        currency_code: cart.currency_code,
        email: cart.email,
        created_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Bank transfer order creation error:", error)
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
