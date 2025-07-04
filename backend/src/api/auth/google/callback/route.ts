import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // 添加 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  const { code, redirect_uri } = req.body as { code?: string, redirect_uri?: string }
  
  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" })
  }

  try {
    // 使用傳入的 redirect_uri 或預設值
    const callbackUri = redirect_uri || process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/tw/auth/google/callback"
    
    // 使用授權碼交換 access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUri,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      return res.status(400).json({ error: "Failed to exchange code for token", details: tokenData })
    }

    // 使用 access token 獲取用戶信息
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    
    if (!userResponse.ok) {
      return res.status(400).json({ error: "Failed to fetch user data", details: userData })
    }

    // 檢查用戶是否已存在
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    let customer
    try {
      const existingCustomers = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "last_name"],
        filters: { email: userData.email }
      })
      
      customer = existingCustomers.data[0]
    } catch (error) {
      console.log("Error querying customer:", error)
    }

    if (!customer) {
      // 創建新客戶
      const customerModule = req.scope.resolve("customerModuleService") as any
      
      try {
        const newCustomer = await customerModule.createCustomers({
          email: userData.email,
          first_name: userData.given_name || userData.name?.split(' ')[0] || '',
          last_name: userData.family_name || userData.name?.split(' ').slice(1).join(' ') || '',
        })
        customer = newCustomer
      } catch (error) {
        console.log("Error creating customer:", error)
        return res.status(500).json({ error: "Failed to create customer account" })
      }
    }

    // 生成 JWT token 給前端
    const authModule = req.scope.resolve("authModuleService") as any
    
    try {
      const { token } = await authModule.authenticate("customer", {
        entity_id: customer.id,
      })

      return res.json({
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
        }
      })
    } catch (error) {
      console.log("Error generating auth token:", error)
      return res.status(500).json({ error: "Failed to generate authentication token" })
    }

  } catch (error) {
    console.error("Google OAuth error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
