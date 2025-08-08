import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AffiliateModuleService from "../../../../modules/affiliate/service"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const affiliateModuleService: AffiliateModuleService = req.scope.resolve("affiliateModuleService")

  try {
    // 獲取所有夥伴
    const allPartners = await affiliateModuleService.listAffiliatePartners({})
    const totalPartners = allPartners.length
    
    // 獲取活躍夥伴數
    const activePartners = allPartners.filter(p => p.status === "active").length

    // 獲取所有推薦
    const allReferrals = await affiliateModuleService.listAffiliateReferrals({})
    const totalReferrals = allReferrals.length

    // 獲取本月推薦數
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const monthlyReferrals = allReferrals.filter(r => {
      const referralDate = new Date(r.created_at)
      return referralDate >= startOfMonth
    }).length

    // 獲取所有支付記錄
    const allPayments = await affiliateModuleService.listAffiliatePayments({})
    
    const pendingCommission = allPayments
      .filter(p => p.status === "pending")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const totalCommissionPaid = allPayments
      .filter(p => p.status === "completed")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    res.json({
      stats: {
        total_partners: totalPartners,
        active_partners: activePartners,
        total_referrals: totalReferrals,
        monthly_referrals: monthlyReferrals,
        pending_commission: pendingCommission,
        total_commission_paid: totalCommissionPaid
      }
    })
  } catch (error) {
    console.error("Error fetching affiliate stats:", error)
    res.status(500).json({ 
      error: "Failed to fetch affiliate statistics",
      details: error.message 
    })
  }
}
