import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateModuleService from "../../../../modules/affiliate/service"
import { AFFILIATE_MODULE } from "../../../../modules/affiliate"

/**
 * 追蹤聯盟推薦點擊
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const affiliateModuleService: AffiliateModuleService = req.scope.resolve(
    AFFILIATE_MODULE
  )

  const body = req.body as { referral_code?: string; landing_page?: string }
  const { referral_code } = body

  if (!referral_code) {
    res.status(400).json({
      error: "Referral code is required"
    })
    return
  }

  try {
    // 根據推薦代碼查找聯盟夥伴
    const partners = await affiliateModuleService.listAffiliatePartners({
      affiliate_code: referral_code
    })

    if (!partners || partners.length === 0) {
      res.status(404).json({
        error: "Invalid referral code"
      })
      return
    }

    const partner = partners[0]

    // 獲取 IP 和 User Agent
    const ip_address = req.ip || 
      req.headers['x-forwarded-for'] as string ||
      req.connection.remoteAddress
    const user_agent = req.headers['user-agent']
    const referrer_url = req.headers.referer

    const referral = await affiliateModuleService.trackReferralClick({
      affiliate_partner_id: partner.id,
      referral_code,
      ip_address,
      user_agent,
      referrer_url
    })

    res.json({
      success: true,
      referral_id: referral.id,
      message: "Referral click tracked successfully"
    })

  } catch (error: any) {
    console.error("Error tracking referral click:", error)
    res.status(500).json({
      error: "Failed to track referral click",
      message: error.message
    })
  }
}
