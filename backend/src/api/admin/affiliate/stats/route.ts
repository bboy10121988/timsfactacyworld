import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /admin/affiliate/stats
 * 取得聯盟系統統計數據
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // TODO: 從數據庫獲取真實統計數據
    // 這裡先返回模擬數據，之後會連接真實數據庫
    
    const stats = {
      totalPartners: 48,
      activePartners: 32,
      pendingPartners: 12,
      rejectedPartners: 4,
      totalClicks: 15680,
      totalConversions: 892,
      totalCommissions: 234500,
      pendingCommissions: 45200,
      paidCommissions: 189300,
      conversionRate: 5.69,
      topPerformers: [
        {
          id: "1",
          name: "張小明",
          email: "zhang@example.com",
          affiliate_code: "ZHANG001",
          total_commission: 45600,
          total_conversions: 89
        },
        {
          id: "2", 
          name: "李美華",
          email: "li@example.com",
          affiliate_code: "LI002",
          total_commission: 38200,
          total_conversions: 76
        }
      ]
    }

    return res.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error("獲取統計數據失敗:", error)
    return res.status(500).json({
      success: false,
      message: "獲取統計數據失敗"
    })
  }
}