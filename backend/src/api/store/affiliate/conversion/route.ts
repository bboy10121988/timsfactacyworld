import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/affiliate/conversion
 * 記錄聯盟行銷轉換
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as { affiliate_code: string; order_id: string; order_total: number; click_id?: string }
    const { affiliate_code, order_id, order_total, click_id } = body

    if (!affiliate_code || !order_id || !order_total) {
      return res.status(400).json({
        success: false,
        message: "缺少必要參數：affiliate_code, order_id, order_total"
      })
    }

    const affiliateService = req.scope.resolve("affiliate") as any
    const result = await affiliateService.recordConversion({
      affiliate_code,
      order_id,
      order_total,
      click_id,
    })

    return res.json({
      success: true,
      message: "轉換已記錄",
  conversion: result
    })

  } catch (error: any) {
    console.error("記錄轉換錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "記錄轉換失敗"
    })
  }
}
