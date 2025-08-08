import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const affiliateModuleService = req.scope.resolve("affiliate")

    // 獲取所有聯盟夥伴
    const partners = await affiliateModuleService.listAffiliatePartners({})
    
    // 計算統計數據
    const totalPartners = partners?.length || 0
    const activePartners = partners?.filter((p: any) => p.status === 'active').length || 0
    const pendingPartners = partners?.filter((p: any) => p.status === 'pending').length || 0
    
    // 獲取所有推薦記錄
    const allReferrals = await affiliateModuleService.listAffiliateReferrals({})
    const totalReferrals = allReferrals?.length || 0
    const confirmedReferrals = allReferrals?.filter((r: any) => r.status === 'confirmed') || []
    
    // 計算本月數據
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthReferrals = confirmedReferrals.filter((referral: any) => {
      if (!referral.converted_at) return false
      const referralDate = new Date(referral.converted_at)
      return referralDate.getMonth() === currentMonth && 
             referralDate.getFullYear() === currentYear
    })
    
    const thisMonthCommission = thisMonthReferrals.reduce((sum: number, referral: any) => {
      return sum + (referral.commission_amount || 0)
    }, 0)
    
    // 格式化夥伴列表
    const formattedPartners = partners?.map((partner: any) => ({
      id: partner.id,
      name: partner.name,
      email: partner.email,
      affiliateCode: partner.affiliate_code,
      status: partner.status,
      commissionRate: partner.commission_rate,
      commissionType: partner.commission_type,
      totalEarnings: partner.total_earnings || 0,
      pendingEarnings: partner.pending_earnings || 0,
      totalReferrals: partner.total_referrals || 0,
      createdAt: partner.created_at,
      approvedAt: partner.approved_at
    })) || []

    const stats = {
      overview: {
        totalPartners,
        activePartners,
        pendingPartners,
        totalReferrals,
        thisMonthReferrals: thisMonthReferrals.length,
        thisMonthCommission
      },
      partners: formattedPartners
    }

    res.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error("Error fetching affiliate admin stats:", error)
    res.status(500).json({
      error: "Failed to fetch affiliate admin stats",
      message: error.message
    })
  }
}
