import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /admin/affiliate/commissions/stats
 * 取得佣金統計（後台管理）
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const stats = {
      totalCommissions: 25800,
      pendingCommissions: 4200, 
      approvedCommissions: 18600,
      rejectedCommissions: 3000,
      paidCommissions: 15400,
      pendingCount: 3,
      approvedCount: 8,
      rejectedCount: 2,
      paidCount: 5,
      totalCount: 18
    }

    return res.json({
      success: true,
      stats
    })
  } catch (error: any) {
    console.error('獲取佣金統計錯誤:', error)
    return res.status(500).json({
      success: false,
      message: "獲取佣金統計失敗", 
      error: error.message
    })
  }
}
