import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email, password } = req.body
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // 驗證必填欄位
    if (!email || !password) {
      return res.status(400).json({ 
        error: "請提供電子郵件和密碼" 
      })
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "請輸入有效的電子郵件地址" 
      })
    }

    try {
      // 查找客戶
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email"],
        filters: { email }
      })

      if (!customers || customers.length === 0) {
        return res.status(401).json({ 
          error: "電子郵件或密碼錯誤" 
        })
      }

      // 使用 Medusa 的認證服務
      const authService = req.scope.resolve("authService")
      const result = await authService.authenticate("customer", {
        body: { email, password }
      })

      if (!result || !result.success) {
        return res.status(401).json({ 
          error: "電子郵件或密碼錯誤" 
        })
      }

      // 設置 CORS headers
      res.setHeader('Access-Control-Allow-Origin', process.env.STORE_CORS || 'http://localhost:8000')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      res.status(200).json({ 
        token: result.authUser?.app_metadata?.jwt || result.token,
        message: "登入成功" 
      })
    } catch (authError: any) {
      console.error("Authentication error:", authError)
      return res.status(401).json({ 
        error: "電子郵件或密碼錯誤" 
      })
    }
  } catch (error: any) {
    console.error("Customer login error:", error)
    res.status(500).json({ 
      error: "登入失敗，請稍後再試" 
    })
  }
}

export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', process.env.STORE_CORS || 'http://localhost:8000')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(200).end()
}
