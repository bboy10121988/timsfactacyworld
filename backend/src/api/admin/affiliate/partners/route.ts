import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"

// Mock affiliate service for development
class MockAffiliateService {
  async getPartners({ status, page = 1, limit = 20 }: { status?: string; page: number; limit: number }) {
    // Mock 聯盟夥伴申請資料 - 申請時沒有佣金率，管理員審核時設定
    const mockPartners = [
      {
        id: "1",
        email: "wang@example.com", 
        name: "王小明",
        company_name: "小明行銷公司",
        website: "https://tech-a.com",
        phone: "0912345678",
        affiliate_code: "WANG123",
        // commission_rate: 待審核申請沒有佣金率
        status: "pending",
        registration_date: "2025-01-17",
        approval_date: null,
        notes: "待審核申請"
      },
      {
        id: "2", 
        email: "li@example.com",
        name: "李美華",
        company_name: "華美數位", 
        website: "https://marketing-b.com",
        affiliate_code: "LI456",
        commission_rate: 0.05, // 管理員設定的佣金率
        status: "approved",
        registration_date: "2024-12-01",
        approval_date: "2024-12-05",
        notes: "優良合作夥伴"
      },
      {
        id: "3",
        email: "chen@example.com",
        name: "陳大雄",
        company_name: "大雄科技",
        website: "https://ecom-c.com", 
        phone: "0956781234",
        affiliate_code: "CHEN789",
        // commission_rate: 被拒絕申請沒有佣金率
        status: "rejected",
        registration_date: "2025-01-10",
        approval_date: null,
        notes: "不符合申請條件"
      },
      {
        id: "4",
        email: "zhang@example.com", 
        name: "張美玲",
        company_name: "美玲數位行銷",
        website: "https://influencer-d.com",
        phone: "0923456789",
        affiliate_code: "ZHANG999",
        // commission_rate: 待審核申請沒有佣金率
        status: "pending",
        registration_date: "2025-01-16",
        approval_date: null,
        notes: "待審核新申請"
      },
      {
        id: "5",
        email: "lin@example.com",
        name: "林志豪",
        company_name: "志豪網路科技",
        website: "https://ad-agency-e.com",
        affiliate_code: "LIN888",
        commission_rate: 0.055, // 管理員設定較高佣金率
        status: "approved",
        registration_date: "2024-10-20",
        approval_date: "2024-10-25"
      }
    ]

    // 根據狀態過濾
    let filteredPartners = mockPartners
    if (status) {
      filteredPartners = mockPartners.filter(p => p.status === status)
    }

    // 簡單分頁
    const offset = (page - 1) * limit
    const paginatedPartners = filteredPartners.slice(offset, offset + limit)

    return {
      partners: paginatedPartners,
      total: filteredPartners.length
    }
  }

  async createPartner(data: any) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: "pending",
      registration_date: new Date().toISOString().split('T')[0],
      approval_date: null,
      clicks: 0,
      conversions: 0,
      commission: 0
    }
  }

  async updatePartnerStatus(partnerId: string, status: string) {
    return {
      id: partnerId,
      status,
      approval_date: status === 'approved' ? new Date().toISOString().split('T')[0] : null
    }
  }
}

const affiliateService = new MockAffiliateService()

/**
 * GET /admin/affiliate/partners
 * 取得聯盟夥伴列表（後台管理）
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as {
      status?: string
      page?: string
      limit?: string
    }

    const result = await affiliateService.getPartners({
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    })

    return res.json({
      success: true,
      partners: result.partners,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (error: any) {
    console.error('獲取聯盟夥伴列表錯誤:', error)
    return res.status(500).json({
      success: false,
      message: "獲取聯盟夥伴列表失敗",
      error: error.message
    })
  }
}

/**
 * POST /admin/affiliate/partners
 * 創建聯盟夥伴（後台管理）
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const createPartnerSchema = z.object({
      email: z.string().email(),
      company_name: z.string().min(1),
      website: z.string().url().optional(),
      contact_person: z.string().optional(),
      phone: z.string().optional(),
      description: z.string().optional()
    })

    const validatedData = createPartnerSchema.parse(req.body)
    const partner = await affiliateService.createPartner(validatedData)

    return res.status(201).json({
      success: true,
      partner
    })
  } catch (error: any) {
    console.error('創建聯盟夥伴錯誤:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: "資料驗證失敗",
        errors: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      message: "創建聯盟夥伴失敗",
      error: error.message
    })
  }
}
