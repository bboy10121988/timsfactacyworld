import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/affiliate/track
 * 記錄聯盟夥伴點擊
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as { affiliate_code: string; product_id?: string; url: string; user_agent?: string; referrer_url?: string; session_id?: string }
    const { affiliate_code, product_id, url, user_agent, referrer_url, session_id } = body

    if (!affiliate_code || !url) {
      return res.status(400).json({
        success: false,
        message: "缺少必要參數：affiliate_code, url"
      })
    }

    // 使用真實的聯盟服務記錄點擊
    const affiliateService = req.scope.resolve("affiliate") as any
    const result = await affiliateService.trackClick({
      affiliate_code,
      product_id,
      user_agent,
      referrer_url,
      session_id,
      ip_address: req.ip || req.socket.remoteAddress,
    })

    return res.json({
      success: true,
      message: "點擊已記錄",
      click: result
    })

  } catch (error: any) {
    console.error("記錄點擊錯誤:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "記錄點擊失敗"
    })
  }
}
