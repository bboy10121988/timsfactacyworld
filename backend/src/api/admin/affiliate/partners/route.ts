import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"

// 查詢參數驗證
const getPartnersSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20')
})

// 審核夥伴參數驗證
const approvePartnerSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended']),
  reason: z.string().optional()
})

/**
 * 獲取合作夥伴列表
 */
export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    
    // 驗證查詢參數
    const validationResult = getPartnersSchema.safeParse(req.query)
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validationResult.error.issues
      })
    }

    const { status, page, limit } = validationResult.data
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    // 調用服務獲取合作夥伴列表
    const partnersData = await affiliateService.getAdminPartners({
      status,
      page: pageNum,
      limit: limitNum
    })
    
    return res.status(200).json({
      success: true,
      data: partnersData
    })

  } catch (error) {
    console.error('獲取合作夥伴列表失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * 創建新合作夥伴 (管理員)
 */
export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    
    // 這裡可以添加管理員創建合作夥伴的邏輯
    // 暫時返回未實現
    return res.status(501).json({
      success: false,
      error: 'Not implemented yet'
    })

  } catch (error) {
    console.error('創建合作夥伴失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
