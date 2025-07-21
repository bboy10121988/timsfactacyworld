import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { customer_id, email, google_id } = req.body as {
      customer_id: string
      email: string
      google_id: string
    }

    if (!customer_id || !email || !google_id) {
      res.status(400).json({ error: "Missing required parameters" })
      return
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // 驗證客戶存在且為 Google 用戶
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email", "metadata"],
        filters: { 
          id: customer_id,
          email 
        } as any
      })

      const customer = customers?.[0]
      if (!customer) {
        res.status(404).json({ error: "Customer not found" })
        return
      }

      if (customer.metadata?.google_id !== google_id) {
        res.status(403).json({ error: "Invalid Google credentials" })
        return
      }

      // 為 Google 用戶生成會話 token
      // 由於 Google 用戶沒有密碼，我們創建一個特殊的認證會話
      const sessionData = {
        customer_id: customer.id,
        email: customer.email,
        auth_provider: 'google',
        google_id: google_id,
        issued_at: Date.now(),
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 天
      }

      // 生成簡單的 JWT 風格 token (Base64 編碼)
      const tokenData = Buffer.from(JSON.stringify(sessionData)).toString('base64')
      const token = `medusa_google_${tokenData}`

      res.status(200).json({
        success: true,
        token: token,
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name
        }
      })

    } catch (error) {
      console.error("Google auth error:", error)
      res.status(500).json({ error: "Authentication failed" })
    }

  } catch (error: any) {
    console.error("Google auth API error:", error)
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    })
  }
}
