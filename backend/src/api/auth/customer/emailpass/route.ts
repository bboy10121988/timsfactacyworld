import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { AuthenticateCustomerType } from "@medusajs/framework/types"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { email, password } = req.body

  // 驗證必填欄位
  if (!email || !password) {
    res.status(400).json({ 
      error: "請提供電子郵件和密碼" 
    })
    return
  }

  // 驗證電子郵件格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400).json({ 
      error: "請輸入有效的電子郵件地址" 
    })
    return
  }

  try {
    // 使用 Medusa 框架的認證
    const body: AuthenticateCustomerType = {
      provider: "emailpass",
      email,
      password
    }

    // 呼叫框架的標準認證
    const result = await req.scope.resolve("auth").authenticate(body)

    if (!result.success) {
      res.status(401).json({ 
        error: "電子郵件或密碼錯誤" 
      })
      return
    }

    // 設置 CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.STORE_CORS || 'http://localhost:8000')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    res.status(200).json(result.result)

  } catch (error: any) {
    console.error("Customer login error:", error)
    res.status(401).json({ 
      error: "電子郵件或密碼錯誤" 
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
