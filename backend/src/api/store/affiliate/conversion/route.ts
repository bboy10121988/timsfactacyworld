import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import AffiliateService from "../../../../services/affiliate-real"

const affiliateService = new AffiliateService()

/**
 * POST /store/affiliate/conversion
 * 記錄聯盟行銷轉換
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as {
      partnerId: string
      orderId: string
      productId?: string
      orderValue: number
      commissionRate: number
    }

    const { partnerId, orderId, productId, orderValue, commissionRate } = body

    if (!partnerId || !orderId || !orderValue || !commissionRate) {
      return res.status(400).json({
        success: false,
        message: "缺少必要參數：partnerId, orderId, orderValue, commissionRate"
      })
    }

    const result = await affiliateService.recordConversion({
      partnerId,
      orderId,
      productId,
      orderValue,
      commissionRate
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
