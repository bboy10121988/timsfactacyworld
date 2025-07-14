import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  console.log('Google 登入 API 被調用')
  console.log('收到的 body:', req.body)
  
  try {
    const { google_id, email, first_name, last_name, avatar } = req.body as {
      google_id: string
      email: string
      first_name: string
      last_name: string
      avatar?: string
    }

    console.log('解析後的資料:', { google_id, email, first_name, last_name, avatar })

    if (!google_id || !email) {
      console.log('缺少必要參數:', { google_id, email })
      res.status(400).json({ error: "Google ID and email are required" })
      return
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const customerModule = req.scope.resolve("customer") as any

    // 查找現有客戶 - 使用 query graph
    let existingCustomers: any[] = []
    try {
      const result = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "last_name", "metadata"],
        filters: { email } as any
      })
      existingCustomers = result.data || []
      console.log('查找現有客戶結果:', existingCustomers)
    } catch (queryError) {
      console.error("Query error:", queryError)
      // 如果查詢失敗，假設沒有現有客戶，繼續創建
    }

    let customer = existingCustomers?.[0]

    if (!customer) {
      // 創建新客戶
      try {
        customer = await customerModule.createCustomers({
          email,
          first_name,
          last_name,
          metadata: {
            google_id,
            avatar,
            auth_provider: 'google'
          }
        })
        console.log('創建新客戶成功:', customer)
      } catch (error: any) {
        console.error("Error creating customer:", error)
        res.status(500).json({ error: "Failed to create customer account" })
        return
      }
    } else if (!customer.metadata?.google_id) {
      // 更新現有客戶
      try {
        customer = await customerModule.updateCustomers(customer.id, {
          metadata: {
            ...customer.metadata,
            google_id,
            avatar,
            auth_provider: 'google'
          }
        })
        console.log('更新現有客戶成功:', customer)
      } catch (error: any) {
        console.error("Error updating customer:", error)
        res.status(500).json({ error: "Failed to update customer account" })
        return
      }
    } else {
      console.log('找到現有的 Google 客戶:', customer)
    }

    // 直接返回客戶資訊，讓前端處理認證
    console.log('返回客戶資訊給前端處理認證')

    res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        metadata: customer.metadata
      },
      // 暫時不包含 access_token，讓前端自行處理認證
    })

  } catch (error: any) {
    console.error("Google 登入後端錯誤:", error)
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    })
  }
}
