import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/affiliate/earnings
 * 獲取合作夥伴收益歷史
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { partnerId, page = '1', limit = '20', status, type = 'all', month } = req.query as {
      partnerId?: string
      page?: string
      limit?: string
      status?: string
      type?: 'all' | 'self' | 'referral'
      month?: string
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
        'ac.order_amount', // 修正欄位名稱
        'ac.commission_amount',
        'ac.commission_rate',
        'ac.status',
        'ac.settlement_date as paid_at', // 修正欄位名稱
        'ac.created_at',
        'ac.partner_id',
        'ap.name as partner_name',
        'ap.affiliate_code'
      )
      .from('affiliate_commission as ac') // 修正表格名稱
      .leftJoin('affiliate_partner as ap', 'ac.partner_id', 'ap.id') // 修正關聯方式
      .whereNotNull('ac.id') // 移除deleted_at檢查，因為這個表格沒有這個欄位

    // 根據夥伴ID過濾
    if (partnerId) {
      query = query.where('ac.partner_id', partnerId)
    }

    // 根據收益類型過濾 (目前簡化處理，因為沒有推薦層級數據)
    if (type === 'self') {
      // 只顯示指定夥伴的直接收益 - 與partnerId過濾重複，但保持邏輯清晰
      if (partnerId) {
        query = query.where('ac.partner_id', partnerId)
      }
    } else if (type === 'referral') {
      // 暫時返回空結果，因為沒有推薦層級數據
      query = query.where('ac.id', 'non-existent-id')
    }
    // 'all' 類型不需要額外過濾

    // 根據狀態過濾
    if (status && status !== 'all') {
      query = query.where('ac.status', status)
    }

    // 根據月份過濾
    if (month && month !== 'all') {
      const [year, monthNum] = month.split('-').map(Number)
      if (year && monthNum) {
        query = query
          .whereRaw('EXTRACT(YEAR FROM ac.created_at) = ?', [year])
          .whereRaw('EXTRACT(MONTH FROM ac.created_at) = ?', [monthNum])
      }
    }

    const earnings = await query
      .limit(limitNum)
      .offset(offset)
      .orderBy('ac.created_at', 'desc')

    // 計算總數
    let countQuery = pgConnection
      .count('* as total')
      .from('affiliate_commission as ac') // 修正表格名稱
      .leftJoin('affiliate_partner as ap', 'ac.partner_id', 'ap.id') // 修正關聯方式
      .whereNotNull('ac.id') // 修正where條件

    if (partnerId) {
      countQuery = countQuery.where('ac.partner_id', partnerId) // 修正欄位名稱
    }

    // 為 countQuery 添加類型篩選
    if (type === 'self') {
      if (partnerId) {
        countQuery = countQuery.where('ac.partner_id', partnerId)
      }
    } else if (type === 'referral') {
      countQuery = countQuery.where('ac.id', 'non-existent-id')
    }

    if (status && status !== 'all') {
      countQuery = countQuery.where('ac.status', status)
    }

    // 為 countQuery 添加月份篩選
    if (month && month !== 'all') {
      const [year, monthNum] = month.split('-').map(Number)
      if (year && monthNum) {
        countQuery = countQuery
          .whereRaw('EXTRACT(YEAR FROM ac.created_at) = ?', [year])
          .whereRaw('EXTRACT(MONTH FROM ac.created_at) = ?', [monthNum])
      }
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
