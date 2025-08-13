import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// 定義請求體和結果類型
interface BatchRequest {
  action: string
  target: string
  ids: string[]
  data?: { reason?: string }
}

interface BatchResult {
  id: string
  success: boolean
  error?: string
}

/**
 * 批量操作 API
 */
export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    const { action, target, ids, data } = req.body as BatchRequest

    // 驗證必要參數
    if (!action || !target || !ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'action, target, and ids array are required'
      })
    }

    let results: BatchResult[] = []

    // 根據目標類型和操作執行批量處理
    switch (target) {
      case 'partners':
        if (action === 'approve') {
          for (const id of ids) {
            try {
              await affiliateService.approvePartner(id, 'approved')
              results.push({ id, success: true })
            } catch (error) {
              results.push({ 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          }
        } else if (action === 'reject') {
          for (const id of ids) {
            try {
              await affiliateService.approvePartner(id, 'rejected')
              results.push({ id, success: true })
            } catch (error) {
              results.push({ 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          }
        } else if (action === 'suspend') {
          for (const id of ids) {
            try {
              await affiliateService.approvePartner(id, 'suspended')
              results.push({ id, success: true })
            } catch (error) {
              results.push({ 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          }
        }
        break

      case 'commissions':
        if (action === 'approve') {
          for (const id of ids) {
            try {
              await affiliateService.updateCommissionStatus(
                id, 
                'confirmed', 
                data?.reason || 'Batch approval'
              )
              results.push({ id, success: true })
            } catch (error) {
              results.push({ 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          }
        } else if (action === 'pay') {
          for (const id of ids) {
            try {
              await affiliateService.updateCommissionStatus(
                id, 
                'paid', 
                data?.reason || 'Batch payment processing'
              )
              results.push({ id, success: true })
            } catch (error) {
              results.push({ 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          }
        } else if (action === 'cancel') {
          for (const id of ids) {
            try {
              await affiliateService.updateCommissionStatus(
                id, 
                'cancelled', 
                data?.reason || 'Batch cancellation'
              )
              results.push({ id, success: true })
            } catch (error) {
              results.push({ 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })
            }
          }
        }
        break

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid target',
          message: 'Target must be "partners" or "commissions"'
        })
    }

    // 計算成功和失敗的數量
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return res.status(200).json({
      success: true,
      data: {
        action,
        target,
        total: ids.length,
        successful: successCount,
        failed: failureCount,
        results: results
      }
    })

  } catch (error) {
    console.error('批量操作失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
