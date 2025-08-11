import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/affiliate/register
 * 註冊聯盟夥伴（支援推薦制 ?ref= 或 body.referred_by_code）
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as any
    const { name, email, password, phone, website } = body
    // 從 query 或 body 取得 ref 推薦碼
    const referred_by_code = (req.query?.ref as string) || body.referred_by_code || null

    console.log("=== 收到註冊請求 ===")
    console.log("Body:", { name, email, phone, website, referred_by_code })

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "缺少必要資料：name, email" })
    }

    // 使用更新的聯盟服務
    const affiliateService = req.scope.resolve("affiliate") as any
    const result = await affiliateService.createPartner({ 
      name, 
      email, 
      phone,
      website,
      referred_by_code 
    })

    if (result.success) {
      console.log(`✅ 聯盟夥伴註冊成功: ${name} (${email})`)
      if (referred_by_code) {
        console.log(`🔗 推薦人: ${referred_by_code}`)
      }
    }
    
    return res.json(result)
  } catch (error: any) {
    console.error("註冊錯誤:", error)
    
    // 改善錯誤處理
    let statusCode = 400
    let message = error.message || "註冊失敗"
    
    if (message.includes("此電子郵件已被使用")) {
      message = "此電子郵件已經註冊過聯盟帳號"
      statusCode = 409
    }
    
    return res.status(statusCode).json({ success: false, message })
  }
}
