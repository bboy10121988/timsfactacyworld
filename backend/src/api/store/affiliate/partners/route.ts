import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateService from "../../../../services/affiliate-real"

const affiliateService = new AffiliateService()

/**
 * POST /store/affiliate/partners
 * 註冊聯盟夥伴
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as {
      name: string
      email: string
      phone?: string
      website?: string
      password: string
    }

    const { name, email, phone, website, password } = body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "缺少必要資料：name, email, password"
      })
    }

    const result = await affiliateService.createPartner({
      name,
      email,
      phone,
      website,
      password
    })

    return res.json({
      success: true,
      message: "註冊成功，請等待審核",
      partner: result
    })

  } catch (error: any) {
    console.error("註冊錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "註冊失敗"
    })
  }
}

/**
 * GET /store/affiliate/partners?email={email}
 * 檢查 email 是否已存在
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email } = req.query as { email: string }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "缺少 email 參數"
      })
    }

    const exists = await affiliateService.checkEmailExists(email)

    return res.json({
      success: true,
      exists
    })

  } catch (error: any) {
    console.error("檢查 email 錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "檢查失敗"
    })
  }
}
