import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// Mock commission service for development
class MockCommissionService {
  async getCommissions({ status, page = 1, limit = 20 }: { status?: string; page: number; limit: number }) {
    // Mock 佣金資料（符合業務邏輯）
    const mockCommissions = [
      {
        id: "comm_1",
        partner_id: "1",
        partner_name: "科技公司A",
        order_id: "order_123",
        amount: 1200,
        status: "approved",
        created_date: "2024-12-10",
        approved_date: "2024-12-12"
      },
      {
        id: "comm_2", 
        partner_id: "1",
        partner_name: "科技公司A",
        order_id: "order_124",
        amount: 800,
        status: "pending",
        created_date: "2025-01-15",
        approved_date: null
      },
      {
        id: "comm_3",
        partner_id: "3",
        partner_name: "電商平台C",
        order_id: "order_125",
        amount: 2300,
        status: "approved", 
        created_date: "2024-11-20",
        approved_date: "2024-11-22"
      },
      {
        id: "comm_4",
        partner_id: "3",
        partner_name: "電商平台C",
        order_id: "order_126",
        amount: 1500,
        status: "pending",
        created_date: "2025-01-10",
        approved_date: null
      },
      {
        id: "comm_5",
        partner_id: "5",
        partner_name: "廣告代理E",
        order_id: "order_127", 
        amount: 900,
        status: "rejected",
        created_date: "2024-12-25",
        approved_date: null
      }
    ]

    // 根據狀態過濾
    let filteredCommissions = mockCommissions
    if (status) {
      filteredCommissions = mockCommissions.filter(c => c.status === status)
    }

    // 簡單分頁
    const offset = (page - 1) * limit
    const paginatedCommissions = filteredCommissions.slice(offset, offset + limit)

    return {
      commissions: paginatedCommissions,
      total: filteredCommissions.length
    }
  }

  async getCommissionStats() {
    return {
      totalCommissions: 25800,
      pendingCommissions: 4200,
      approvedCommissions: 18600,
      rejectedCommissions: 3000,
      paidCommissions: 15400
    }
  }

  async updateCommissionStatus(commissionId: string, status: string) {
    return {
      id: commissionId,
      status,
      approved_date: status === 'approved' ? new Date().toISOString().split('T')[0] : null
    }
  }

  async batchUpdateCommissions(ids: string[], status: string) {
    return {
      updated: ids.length,
      status
    }
  }
}

const commissionService = new MockCommissionService()

/**
 * GET /admin/affiliate/commissions
 * 取得佣金列表（後台管理）
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as {
      status?: string
      page?: string
      limit?: string
    }

    const result = await commissionService.getCommissions({
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    })

    return res.json({
      success: true,
      commissions: result.commissions,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (error: any) {
    console.error('獲取佣金列表錯誤:', error)
    return res.status(500).json({
      success: false,
      message: "獲取佣金列表失敗",
      error: error.message
    })
  }
}

/**
 * PUT /admin/affiliate/commissions
 * 批量更新佣金狀態（後台管理）
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { ids, status } = req.body as {
      ids: string[]
      status: string
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "請提供有效的佣金ID列表"
      })
    }

    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "無效的狀態"
      })
    }

    const result = await commissionService.batchUpdateCommissions(ids, status)

    return res.json({
      success: true,
      message: `已更新 ${result.updated} 筆佣金狀態為 ${status}`,
      result
    })
  } catch (error: any) {
    console.error('批量更新佣金錯誤:', error)
    return res.status(500).json({
      success: false,
      message: "批量更新佣金失敗",
      error: error.message
    })
  }
}