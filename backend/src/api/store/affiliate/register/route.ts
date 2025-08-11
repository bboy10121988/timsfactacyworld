import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateService from "../../../../modules/affiliate/services/affiliate"

/**
 * POST /store/affiliate/register
 * 註冊聯盟夥伴（支援 ?ref= 或 body.referred_by_code）
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as any
    const { name, email, password } = body
    // 從 query 或 body 取得 ref 推薦碼
    const referred_by_code = (req.query?.ref as string) || body.referred_by_code || null

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "缺少必要資料：name, email, password" })
    }

    // 使用資料庫版本的服務
    const affiliateService = req.scope.resolve("affiliate") as any
    const partner = await affiliateService.createPartner({ ...body, referred_by_code })
    return res.json({ success: true, message: "註冊成功，請等待審核", partner })
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
