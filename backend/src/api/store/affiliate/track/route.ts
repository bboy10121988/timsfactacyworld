import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateService from "../../../../services/affiliate-real"

const affiliateService = new AffiliateService()

/**
 * POST /store/affiliate/track
 * 記錄聯盟夥伴點擊
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as {
      partnerId: string
      productId?: string
      url: string
      userAgent?: string
      referrer?: string
    }

    const { partnerId, productId, url, userAgent, referrer } = body

    if (!partnerId || !url) {
      return res.status(400).json({
        success: false,
        message: "缺少必要參數：partnerId, url"
      })
    }

    const result = await affiliateService.trackClick({
      partnerId,
      productId,
      url,
      userAgent,
      referrer,
      ipAddress: req.ip || req.socket.remoteAddress
    })

    return res.json({
      success: true,
      message: "點擊已記錄",
      click: result
    })

  } catch (error: any) {
    console.error("記錄點擊錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "記錄點擊失敗"
    })
  }
}
