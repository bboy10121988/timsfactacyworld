import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/affiliate/partners/{id}/stats
 * 取得聯盟夥伴統計資料
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log("=== 統計 API GET 請求 ===")
  console.log("URL params:", req.params)
  console.log("Query params:", req.query)
  console.log("Headers:", req.headers)
  
  try {
    const { id } = req.params
    console.log("要獲取統計的 partner ID:", id)

    // 暫時返回模擬統計資料，直到完整的聯盟追蹤系統建置完成
    // TODO: 實作真實的統計查詢（點擊數、轉換數、傭金等）
    const stats = {
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      thisMonthEarnings: 0,
    }

    console.log("獲取統計成功:", stats)

    return res.json({
      success: true,
      stats,
      note: "統計功能開發中 - 目前顯示模擬數據"
    })

  } catch (error: any) {
    console.error("取得統計資料錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "取得統計資料失敗"
    })
  }
}
