import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateService from "../../../../../../services/affiliate-real"

const affiliateService = new AffiliateService()

/**
 * GET /store/affiliate/partners/{id}/stats
 * 取得聯盟夥伴統計資料
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params

    // JWT 驗證
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      try {
        const decoded = affiliateService.verifyToken(token)
        // 驗證是否為同一個夥伴或管理員
        if (decoded.partnerId !== id) {
          return res.status(403).json({ success: false, message: "權限不足" })
        }
      } catch (tokenError) {
        return res.status(401).json({ success: false, message: "無效的認證 token" })
      }
    }

    const stats = await affiliateService.getPartnerStats(id)

    return res.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error("取得統計資料錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "取得統計資料失敗"
    })
  }
}
