import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/affiliate/earnings
 * 獲取合作夥伴收益歷史
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { partnerId, page = '1', limit = '20', status } = req.query as {
      partnerId?: string
      page?: string
      limit?: string
      status?: string
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // 使用 Knex 連接資料庫
    const pgConnection = req.scope.resolve("__pg_connection__")
    
    let query = pgConnection
      .select(
        'ac.id',
        'ac.order_id',
        'ac.order_total',
        'ac.commission_amount',
        'ac.commission_rate',
        'ac.status',
        'ac.paid_at',
        'ac.created_at',
        'ac.affiliate_code',
        'ap.name as partner_name',
        'ap.id as partner_id'
      )
      .from('affiliate_conversion as ac')
      .leftJoin('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
      .whereNull('ac.deleted_at')

    // 根據夥伴ID過濾
    if (partnerId) {
      query = query.where('ap.id', partnerId)
    }

    // 根據狀態過濾
    if (status && status !== 'all') {
      query = query.where('ac.status', status)
    }

    const earnings = await query
      .limit(limitNum)
      .offset(offset)
      .orderBy('ac.created_at', 'desc')

    // 計算總數
    let countQuery = pgConnection
      .count('* as total')
      .from('affiliate_conversion as ac')
      .leftJoin('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
      .whereNull('ac.deleted_at')

    if (partnerId) {
      countQuery = countQuery.where('ap.id', partnerId)
    }

    if (status && status !== 'all') {
      countQuery = countQuery.where('ac.status', status)
    }

    const countResult = await countQuery
    const total = countResult[0]['total'] as number

    // 轉換數據格式
    const formattedEarnings = earnings.map((earning) => ({
      id: earning.id,
      partnerId: earning.partner_id,
      orderId: earning.order_id,
      orderNumber: `TIM-${earning.order_id}`,
      customerEmail: `customer-${earning.order_id}@example.com`,
      productName: '商品購買',
      orderAmount: parseFloat(earning.order_total) || 0, // 已經是元
      commissionAmount: parseFloat(earning.commission_amount) || 0, // 已經是元
      commissionRate: parseFloat(earning.commission_rate) || 0.05,
      status: earning.status,
      createdAt: earning.created_at,
      paidAt: earning.paid_at
    }))

    return res.status(200).json({
      success: true,
      data: {
        earnings: formattedEarnings,
        total: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum
      }
    })

  } catch (error) {
    console.error('獲取收益歷史失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
