import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { AffiliateModuleService } from "../../../../../../modules/affiliate"

/**
 * 獲取聯盟夥伴統計數據
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const affiliateModuleService: AffiliateModuleService = req.scope.resolve(
      "affiliate"
    )

    const { id } = req.params as { id: string }

    if (!id) {
      res.status(400).json({
        error: "Partner ID is required"
      })
      return
    }

    // 獲取夥伴基本資訊
    const partners = await affiliateModuleService.listAffiliatePartners({
      id: id
    })

    if (!partners || partners.length === 0) {
      res.status(404).json({
        error: "Affiliate partner not found"
      })
      return
    }

    const partner = partners[0]

    // 獲取推薦記錄
    const referrals = await affiliateModuleService.listAffiliateReferrals({
      affiliate_partner_id: id
    })

    // 計算統計數據
    const totalClicks = referrals?.length || 0
    const confirmedReferrals = referrals?.filter(r => r.status === "confirmed") || []
    const totalConversions = confirmedReferrals.length
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    // 計算收益
    const totalCommission = confirmedReferrals.reduce((sum, referral) => {
      return sum + (referral.commission_amount || 0)
    }, 0)

    // 獲取支付記錄
    const payments = await affiliateModuleService.listAffiliatePayments({
      affiliate_partner_id: id
    })

    const paidEarnings = payments?.reduce((sum, payment) => {
      return payment.status === "completed" ? sum + payment.amount : sum
    }, 0) || 0

    const pendingEarnings = totalCommission - paidEarnings

    // 計算本月收益
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthReferrals = confirmedReferrals.filter(referral => {
      if (!referral.converted_at) return false
      const referralDate = new Date(referral.converted_at)
      return referralDate.getMonth() === currentMonth && 
             referralDate.getFullYear() === currentYear
    })

    const thisMonthEarnings = thisMonthReferrals.reduce((sum, referral) => {
      return sum + (referral.commission_amount || 0)
    }, 0)

    // 獲取最近的推薦記錄（用於顯示）
    const recentReferrals = referrals
      ?.sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
      ?.slice(0, 10)
      ?.map(referral => ({
        id: referral.id,
        clicked_at: referral.clicked_at,
        converted_at: referral.converted_at,
        order_total: referral.order_total,
        commission_amount: referral.commission_amount,
        status: referral.status,
        ip_address: referral.ip_address
      })) || []

    const stats = {
      // 基本統計
      totalClicks,
      totalConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      
      // 收益統計
      totalEarnings: totalCommission,
      pendingEarnings,
      paidEarnings,
      thisMonthEarnings,
      
      // 夥伴資訊
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        affiliate_code: partner.affiliate_code,
        referral_link: partner.referral_link,
        status: partner.status,
        commission_rate: partner.commission_rate,
        commission_type: partner.commission_type,
        created_at: partner.created_at
      },
      
      // 最近推薦記錄
      recentReferrals,
      
      // 支付記錄
      recentPayments: payments?.slice(0, 5)?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        processed_at: payment.processed_at,
        payment_reference: payment.payment_reference,
        period_start: payment.period_start,
        period_end: payment.period_end
      })) || []
    }

    res.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error("Error fetching affiliate partner stats:", error)
    res.status(500).json({
      error: "Failed to fetch affiliate partner stats",
      message: error.message
    })
  }
}
