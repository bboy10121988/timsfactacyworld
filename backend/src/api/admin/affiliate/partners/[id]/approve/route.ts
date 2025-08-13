import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"

// 審核請求參數驗證
const approvePartnerSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended']),
  reason: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    const partnerId = req.params.id
    
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Partner ID is required'
      })
    }

    // 驗證請求體
    const validationResult = approvePartnerSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validationResult.error.issues
      })
    }

    const { status, reason, notes } = validationResult.data
    
    // 調用服務審核夥伴 (只支援 approved 和 rejected 狀態)
    const approvalStatus = status === 'suspended' ? 'rejected' : status
    const result = await affiliateService.approvePartner(partnerId, approvalStatus, reason)
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message || 'Failed to approve partner'
      })
    }
    
    return res.status(200).json({
      success: true,
      data: {
        partner: result.partner,
        message: `夥伴狀態已更新為: ${status}`
      }
    })

  } catch (error) {
    console.error('審核夥伴失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
