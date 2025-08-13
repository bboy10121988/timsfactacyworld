import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/affiliate/partners/{id}/stats
 * 取得聯盟夥伴統計資料
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 統計 API - 直接查詢資料庫 ===")
  console.log("Partner ID:", req.params.id)
  
  try {
    const { id } = req.params
    
    // 直接查詢資料庫
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    // 查詢該夥伴的所有傭金記錄
    const commissions = await pgConnection('affiliate_commission')
      .where('partner_id', id)
      .select('*')
      .orderBy('created_at', 'desc')
    
    console.log("查詢到傭金數據:", commissions.length, "筆")
    
    // 計算統計數據
    const totalConversions = commissions.length
    const totalEarnings = commissions.reduce((sum, row) => {
      return sum + parseFloat(row.commission_amount || 0)
    }, 0)
    
    const pendingEarnings = commissions
      .filter(row => row.status === 'processing' || row.status === 'approved')
      .reduce((sum, row) => sum + parseFloat(row.commission_amount || 0), 0)
    
    // 計算本月收益 (8月)
    const currentMonth = new Date().getMonth() // 7 = 8月
    const currentYear = new Date().getFullYear()
    const thisMonthEarnings = commissions
      .filter(row => {
        const rowDate = new Date(row.created_at)
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear
      })
      .reduce((sum, row) => sum + parseFloat(row.commission_amount || 0), 0)
    
    const stats = {
      totalClicks: 0, // 沒有點擊數據表
      totalConversions,
      conversionRate: 0,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      pendingEarnings: Math.round(pendingEarnings * 100) / 100,
      thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
    }
    
    console.log("計算出的統計數據:", stats)

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
