import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateService from "../../../../services/affiliate-real"

const affiliateService = new AffiliateService()

/**
 * POST /store/affiliate/login
 * 聯盟夥伴登入
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as {
      email: string
      password: string
    }

    const { email, password } = body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "缺少必要資料：email, password"
      })
    }

    const result = await affiliateService.loginPartner(email, password)

    return res.json({
      success: true,
      message: "登入成功",
      partner: result.partner,
      token: result.token
    })

  } catch (error: any) {
    console.error("登入錯誤:", error)
    return res.status(401).json({
      success: false,
      message: error.message || "登入失敗"
    })
  }
}
