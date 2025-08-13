import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * 簡單測試端點 - 不需要認證
 */
export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    
    console.log('🧪 測試管理員 API - affiliate service:', !!affiliateService)
    
    // 測試服務是否可用
    if (!affiliateService) {
      return res.status(500).json({
        success: false,
        error: 'Affiliate service not found',
        message: 'Service resolution failed'
      })
    }

    // 測試調用 getAdminStats 方法
    const stats = await affiliateService.getAdminStats()
    
    return res.status(200).json({
      success: true,
      message: 'Admin API test successful',
      data: {
        serviceAvailable: true,
        stats: stats
      }
    })

  } catch (error) {
    console.error('管理員 API 測試失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    })
  }
}
