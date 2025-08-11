import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import AffiliateService from "../../../../../../modules/affiliate/services/affiliate";
import { 
  apiRateLimit, 
  verifyAdminToken, 
  validateUpdateCommission,
  checkValidationResult,
  requestLogger 
} from "../../../../../../middleware/security";

const affiliateService = new AffiliateService()

/**
 * POST /admin/affiliate/commissions/[id]/status
 * 更新佣金狀態
 */
export const POST = [
  requestLogger,
  apiRateLimit,
  verifyAdminToken,
  validateUpdateCommission,
  checkValidationResult,
  async (req: MedusaRequest, res: MedusaResponse) => {
    try {
      const { id } = req.params
      const body = req.body as {
        newStatus: "approved" | "rejected" | "paid"
        updateReason?: string
      }

      const { newStatus, updateReason } = body

      if (!newStatus || !["approved", "rejected", "paid"].includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: "newStatus 必須是 approved, rejected 或 paid"
        })
      }

      const result = await affiliateService.updateCommissionStatus(
        id as string,
        newStatus,
        updateReason
      )

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json({
        success: true,
        message: "佣金狀態更新成功",
        conversion: result.conversion
      })

    } catch (error: any) {
      console.error("更新佣金狀態錯誤:", error)
      return res.status(500).json({
        success: false,
        message: error.message || "更新失敗"
      })
    }
  }
];
