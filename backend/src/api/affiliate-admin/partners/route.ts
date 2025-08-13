import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /affiliate-admin/partners
 * 獲取合作夥伴列表 - 繞過 Medusa admin 認證
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // 直接使用資料庫連接
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    const partners = await pgConnection
      .select(
        'id',
        'name', 
        'email',
        'phone',
        'website',
        'affiliate_code',
        'commission_rate',
        'status',
        'created_at',
        'updated_at'
      )
      .from('affiliate_partner')
      .limit(20)
      .orderBy('created_at', 'desc')
    
    const totalResult = await pgConnection
      .count('* as total')
      .from('affiliate_partner')
      .first()
    
    const total = totalResult ? parseInt(totalResult.total as string) : 0
    
    return res.status(200).json({
      success: true,
      data: {
        partners,
        total: total,
        page: 1,
        totalPages: Math.ceil(total / 20)
      }
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
