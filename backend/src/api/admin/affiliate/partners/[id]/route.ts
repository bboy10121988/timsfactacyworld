import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"

// 審核夥伴參數驗證
const approvePartnerSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended']),
  reason: z.string().optional()
})

/**
 * 審核合作夥伴
 */
export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    const { id } = req.params
    
    // 驗證請求參數
    const validationResult = approvePartnerSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validationResult.error.issues
      })
    }

    const { status, reason } = validationResult.data
    
    // 調用服務審核合作夥伴
    const result = await affiliateService.approvePartner(id, status, reason)
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: {
          partner: result.partner,
          message: `夥伴已${status === 'approved' ? '核准' : status === 'rejected' ? '拒絕' : '暫停'}`
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        error: result.message || '審核失敗'
      })
    }

  } catch (error) {
    console.error('審核合作夥伴失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * 獲取單個合作夥伴詳情
 */
export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    const { id } = req.params
    
    // 調用服務獲取夥伴詳情
    const result = await affiliateService.getPartner(id)
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: {
          partner: result.partner
        }
      })
    } else {
      return res.status(404).json({
        success: false,
        error: '找不到合作夥伴'
      })
    }

  } catch (error) {
    console.error('獲取合作夥伴詳情失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
