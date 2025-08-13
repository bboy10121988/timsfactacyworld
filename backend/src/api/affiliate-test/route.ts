import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * 聯盟營銷管理測試端點 - 不需要認證的簡單測試
 */
export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    
    console.log('🧪 測試聯盟服務 - affiliate service 是否存在:', !!affiliateService)
    
    // 測試服務是否可用
    if (!affiliateService) {
      return res.status(500).json({
        success: false,
        error: 'Affiliate service not found',
        message: 'Service resolution failed',
        availableServices: Object.keys(req.scope.cradle || {})
      })
    }

    // 測試基本方法是否存在
    const methods = [
      'getAdminStats',
      'getAdminPartners', 
      'getAdminCommissions',
      'getPartner',
      'approvePartner',
      'updateCommissionStatus'
    ]
    
    const methodsAvailable = {}
    methods.forEach(method => {
      methodsAvailable[method] = typeof affiliateService[method] === 'function'
    })

    console.log('🔍 方法檢查結果:', methodsAvailable)

    // 嘗試調用 getAdminStats 方法
    let statsResult: any = null
    let statsError: string | null = null
    
    try {
      if (typeof affiliateService.getAdminStats === 'function') {
        console.log('📊 嘗試調用 getAdminStats...')
        statsResult = await affiliateService.getAdminStats()
        console.log('✅ getAdminStats 調用成功:', statsResult)
      }
    } catch (error) {
      console.log('❌ getAdminStats 調用失敗:', error.message)
      statsError = error.message
    }

    return res.status(200).json({
      success: true,
      message: 'Affiliate management API test successful',
      data: {
        serviceAvailable: true,
        methodsAvailable,
        statsResult,
        statsError,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('聯盟管理 API 測試失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    })
  }
}
