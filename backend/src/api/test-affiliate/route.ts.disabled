import type { 
  MedusaRequest, 
  MedusaResponse
} from '@medusajs/framework'

// import AffiliateService from '../../modules/affiliate/services/affiliate'

// const affiliateService = new AffiliateService()

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    return res.json({
      success: false,
      message: "聯盟測試功能暫時停用"
    })
    
    const { action } = req.query

    switch (action) {
      case 'health':
        res.json({
          success: true,
          message: 'Affiliate system is healthy',
          timestamp: new Date().toISOString()
        })
        break

      case 'partners':
        const partnersResult = await affiliateService.getPartners()
        res.json({ success: true, partners: partnersResult })
        break

      case 'stats':
        const statsResult = await affiliateService.getAdminStats()
        res.json({ success: true, stats: statsResult })
        break

      case 'commissions':
        const commissionsResult = await affiliateService.getCommissions()
        res.json({ success: true, commissions: commissionsResult })
        break

      default:
        res.json({
          success: true,
          message: 'Available actions: health, partners, stats, commissions',
          actions: ['health', 'partners', 'stats', 'commissions']
        })
    }
  } catch (error) {
    console.error('Test endpoint error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { action } = req.query
    const data = req.body

    switch (action) {
      case 'create-partner':
        const createResult = await affiliateService.createPartner(data as any)
        res.json({ success: true, partner: createResult })
        break

      case 'login':
        const { email, password } = data as { email: string, password: string }
        const loginResult = await affiliateService.loginPartner(email, password)
        res.json(loginResult)
        break

      case 'approve-partner':
        const { partnerId, status, reason } = data as { partnerId: string, status: string, reason: string }
        const approveResult = await affiliateService.approvePartner(partnerId, status as 'approved' | 'rejected', reason)
        res.json({ success: true, partner: approveResult })
        break

      case 'track-click':
        const clickResult = await affiliateService.trackClick(data as any)
        res.json({ success: true, click: clickResult })
        break

      case 'record-conversion':
        const conversionResult = await affiliateService.recordConversion(data as any)
        res.json({ success: true, conversion: conversionResult })
        break

      case 'update-commission':
        const { conversionId, newStatus, updateReason } = data as { conversionId: string, newStatus: string, updateReason: string }
        const updateResult = await affiliateService.updateCommissionStatus(conversionId, newStatus as 'approved' | 'paid' | 'rejected', updateReason)
        res.json({ success: true, conversion: updateResult })
        break

      case 'partner-stats':
        const { partnerIdForStats } = data as { partnerIdForStats: string }
        const partnerStatsResult = await affiliateService.getPartnerStats(partnerIdForStats)
        res.json({ success: true, stats: partnerStatsResult })
        break

      default:
        res.json({
          success: false,
          error: 'Invalid action. Available: create-partner, login, approve-partner, track-click, record-conversion, update-commission, partner-stats'
        })
    }
  } catch (error) {
    console.error('Test endpoint POST error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
