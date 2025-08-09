import { MedusaService } from "@medusajs/framework/utils"
import { AffiliatePartnerStatus } from "../models/affiliate-partner"
import { ConversionStatus } from "../models/affiliate-conversion"

interface CreateAffiliatePartnerData {
  name: string
  email: string
  password: string
  phone?: string
  company?: string
  website?: string
  social_media?: string
  address?: string
}

interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalEarnings: number
  pendingEarnings: number
  thisMonthEarnings: number
}

export default class AffiliateService extends MedusaService({}) {
  
  /**
   * 註冊新的聯盟夥伴
   */
  async createPartner(data: CreateAffiliatePartnerData) {
    const { password, ...rest } = data
    
    // TODO: 檢查 email 是否已存在
    // const existingPartner = await this.container.resolve("affiliatePartnerService").retrieve({ email: data.email })
    
    // TODO: 加密密碼 - 需要安裝 bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPassword = password // 臨時使用明文，生產環境必須加密
    
    // 生成聯盟代碼
    const affiliateCode = this.generateAffiliateCode()
    
    // 生成推薦連結
    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}?ref=${affiliateCode}`

    // TODO: 使用正確的 Medusa v2 方式創建實體
    const partnerData = {
      ...rest,
      password: hashedPassword,
      affiliate_code: affiliateCode,
      referral_link: referralLink,
      status: AffiliatePartnerStatus.PENDING,
      commission_rate: 0.08, // 預設 8% 佣金
      created_at: new Date(),
      updated_at: new Date()
    }

    console.log('Creating affiliate partner:', partnerData)
    
    // 返回時排除敏感資訊
    const { password: _, ...result } = partnerData
    return result
  }

  /**
   * 聯盟夥伴登入
   */
  async loginPartner(email: string, password: string) {
    // TODO: 實作實際的資料庫查詢和密碼驗證
    // const partner = await this.container.resolve("affiliatePartnerService").retrieve({ email })
    
    // 臨時模擬登入邏輯
    const mockPartner = {
      id: "partner_123",
      email: email,
      name: "Test Partner",
      affiliate_code: "TEST123",
      status: AffiliatePartnerStatus.APPROVED
    }

    // TODO: 生成真實的 JWT Token
    // const token = jwt.sign(...)
    const token = "mock-jwt-token"

    return { partner: mockPartner, token }
  }

  /**
   * 取得聯盟夥伴資料
   */
  async getPartner(partnerId: string) {
    // TODO: 實作實際的資料庫查詢
    console.log('Getting partner:', partnerId)
    
    const mockPartner = {
      id: partnerId,
      name: "Test Partner",
      email: "test@example.com",
      affiliate_code: "TEST123",
      referral_link: "http://localhost:3000?ref=TEST123",
      status: AffiliatePartnerStatus.APPROVED,
      commission_rate: 0.08,
      created_at: new Date(),
      updated_at: new Date()
    }

    return mockPartner
  }

  /**
   * 更新聯盟夥伴資料
   */
  async updatePartner(partnerId: string, data: Partial<CreateAffiliatePartnerData>) {
    // TODO: 實作實際的資料庫更新
    console.log('Updating partner:', partnerId, data)
    
    const updatedPartner = {
      id: partnerId,
      ...data,
      updated_at: new Date()
    }

    return updatedPartner
  }

  /**
   * 追蹤點擊
   */
  async trackClick(data: {
    affiliate_code: string
    product_id?: string
    ip_address?: string
    user_agent?: string
    referrer_url?: string
    session_id?: string
  }) {
    // TODO: 檢查聯盟代碼是否存在並記錄點擊
    console.log('Tracking click:', data)

    const clickData = {
      id: `click_${Date.now()}`,
      ...data,
      converted: false,
      created_at: new Date()
    }

    return clickData
  }

  /**
   * 記錄轉換（訂單完成時）
   */
  async recordConversion(data: {
    affiliate_code: string
    order_id: string
    order_total: number
    click_id?: string
  }) {
    // TODO: 檢查是否已記錄過此訂單並計算佣金
    console.log('Recording conversion:', data)

    const commissionAmount = Math.round(data.order_total * 0.08 * 100) / 100

    const conversionData = {
      id: `conversion_${Date.now()}`,
      affiliate_code: data.affiliate_code,
      order_id: data.order_id,
      order_total: data.order_total,
      commission_rate: 0.08,
      commission_amount: commissionAmount,
      status: ConversionStatus.PENDING,
      click_id: data.click_id,
      created_at: new Date()
    }

    return conversionData
  }

  /**
   * 取得聯盟夥伴統計資料
   */
  async getPartnerStats(partnerId: string): Promise<AffiliateStats> {
    // TODO: 實作實際的統計查詢
    console.log('Getting partner stats:', partnerId)

    // 模擬統計資料
    const stats = {
      totalClicks: 156,
      totalConversions: 12,
      conversionRate: 7.69,
      totalEarnings: 2840.50,
      pendingEarnings: 480.20,
      thisMonthEarnings: 890.30
    }

    return stats
  }

  /**
   * 管理員：取得所有聯盟夥伴列表
   */
  async getAllPartners(options: {
    status?: AffiliatePartnerStatus
    limit?: number
    offset?: number
  } = {}) {
    const { status, limit = 20, offset = 0 } = options
    
    // TODO: 實作實際的資料庫查詢
    console.log('Getting all partners:', options)

    // 模擬資料
    const mockPartners = [
      {
        id: "partner_1",
        name: "王小明",
        email: "wang@example.com",
        affiliate_code: "WANG123",
        status: AffiliatePartnerStatus.PENDING,
        commission_rate: 0.08,
        created_at: new Date()
      },
      {
        id: "partner_2", 
        name: "李小美",
        email: "lee@example.com",
        affiliate_code: "LEE456",
        status: AffiliatePartnerStatus.APPROVED,
        commission_rate: 0.08,
        created_at: new Date()
      }
    ]

    return {
      data: mockPartners.slice(offset, offset + limit),
      total: mockPartners.length
    }
  }

  /**
   * 管理員：審核聯盟夥伴
   */
  async approvePartner(partnerId: string, adminUserId: string, notes?: string) {
    // TODO: 實作實際的資料庫更新
    console.log('Approving partner:', partnerId, adminUserId, notes)

    const updatedPartner = {
      id: partnerId,
      status: AffiliatePartnerStatus.APPROVED,
      approved_at: new Date(),
      approved_by: adminUserId,
      notes: notes
    }

    return updatedPartner
  }

  /**
   * 管理員：拒絕聯盟夥伴
   */
  async rejectPartner(partnerId: string, adminUserId: string, notes?: string) {
    // TODO: 實作實際的資料庫更新
    console.log('Rejecting partner:', partnerId, adminUserId, notes)

    const updatedPartner = {
      id: partnerId,
      status: AffiliatePartnerStatus.REJECTED,
      approved_by: adminUserId,
      notes: notes
    }

    return updatedPartner
  }

  /**
   * 生成聯盟代碼
   */
  private generateAffiliateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 驗證 JWT Token
   */
  async verifyToken(token: string) {
    // TODO: 實作 JWT 驗證
    console.log('Verifying token:', token)
    
    if (token === "mock-jwt-token") {
      return await this.getPartner("partner_123")
    }
    
    throw new Error("無效的認證令牌")
  }

  /**
   * 取得聯盟夥伴的推薦記錄
   */
  async getPartnerReferrals(partnerId: string, options: {
    limit?: number
    offset?: number
  } = {}) {
    // TODO: 實作實際的資料庫查詢
    console.log('Getting partner referrals:', partnerId, options)

    const mockReferrals = [
      {
        id: "conversion_1",
        order_id: "order_123",
        order_total: 1200,
        commission_amount: 96,
        status: ConversionStatus.CONFIRMED,
        created_at: new Date()
      },
      {
        id: "conversion_2",
        order_id: "order_456", 
        order_total: 800,
        commission_amount: 64,
        status: ConversionStatus.PENDING,
        created_at: new Date()
      }
    ]

    return {
      data: mockReferrals,
      total: mockReferrals.length
    }
  }
}
