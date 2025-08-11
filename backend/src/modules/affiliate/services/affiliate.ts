import { MedusaService } from "@medusajs/framework/utils"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import PartnerModel, { AffiliatePartnerStatus } from "../models/affiliate-partner"
import ClickModel from "../models/affiliate-click"
import ConversionModel, { ConversionStatus } from "../models/affiliate-conversion"

interface CreateAffiliatePartnerData {
  name: string
  email: string
  password: string
  phone?: string
  company?: string
  website?: string
  social_media?: string
  address?: string
  // 可能來自 ?ref= 的推薦代碼
  referred_by_code?: string | null
}

interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalEarnings: number
  pendingEarnings: number
  thisMonthEarnings: number
}

export default class AffiliateService extends MedusaService({
  AffiliatePartner: PartnerModel,
  AffiliateClick: ClickModel,
  AffiliateConversion: ConversionModel,
}) {
  
  /**
   * 註冊新的聯盟夥伴
   */
  async createPartner(data: CreateAffiliatePartnerData) {
    const { password, referred_by_code = null, ...rest } = data
    // 檢查 email 是否已存在
    const dup = await this.listAffiliatePartners({ filters: { email: rest.email } })
    if (dup.length) throw new Error("此電子郵件已被使用")

    const hashed = await bcrypt.hash(password, 10)
    const affiliateCode = await this.generateUniqueAffiliateCode()
    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:8000'}?ref=${affiliateCode}`

    const created = await this.createAffiliatePartners({
      name: rest.name,
      email: rest.email,
      password: hashed,
      phone: rest.phone ?? null,
      company: rest.company ?? null,
      website: rest.website ?? null,
      social_media: rest.social_media ?? null,
      address: rest.address ?? null,
      affiliate_code: affiliateCode,
      referral_link: referralLink,
      referred_by_code: referred_by_code ?? null,
      status: AffiliatePartnerStatus.PENDING,
      commission_rate: 0.08,
    })

    const { password: _omit, ...safe } = created
    return safe
  }

  /**
   * 聯盟夥伴登入
   */
  async loginPartner(email: string, password: string) {
    const partners = await this.listAffiliatePartners({ filters: { email } })
    if (!partners.length) throw new Error("找不到此聯盟夥伴帳號")
    const partner = partners[0] as any
    const ok = await bcrypt.compare(password, partner.password)
    if (!ok) throw new Error("密碼錯誤")
    const token = jwt.sign({ partnerId: partner.id, email: partner.email, affiliate_code: partner.affiliate_code }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" })
    const { password: _omit, ...safe } = partner
    return { partner: safe, token }
  }

  /**
   * 取得聯盟夥伴資料
   */
  async getPartner(partnerId: string) {
    const partner = await this.retrieveAffiliatePartner(partnerId)
    if (!partner) throw new Error("找不到此聯盟夥伴")
    const { password, ...safe } = partner as any
    return safe
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
  async trackClick(data: { affiliate_code: string; product_id?: string; ip_address?: string; user_agent?: string; referrer_url?: string; session_id?: string }) {
    const click = await this.createAffiliateClicks({
      affiliate_code: data.affiliate_code,
      product_id: data.product_id ?? null,
      ip_address: data.ip_address ?? null,
      user_agent: data.user_agent ?? null,
      referrer_url: data.referrer_url ?? null,
      session_id: data.session_id ?? null,
      converted: false,
    })
    return click
  }

  /**
   * 記錄轉換（訂單完成時）
   */
  async recordConversion(data: { affiliate_code: string; order_id: string; order_total: number; click_id?: string }) {
    const exist = await this.listAffiliateConversions({ filters: { order_id: data.order_id } })
    if (exist.length) return exist[0]
    const partners = await this.listAffiliatePartners({ filters: { affiliate_code: data.affiliate_code } })
    if (!partners.length) throw new Error("找不到聯盟夥伴")
    const p: any = partners[0]
    const commission_amount = Math.round(Number(data.order_total) * Number(p.commission_rate) * 100) / 100
    const conv = await this.createAffiliateConversions({
      affiliate_code: data.affiliate_code,
      order_id: data.order_id,
      order_total: data.order_total as any,
      commission_rate: p.commission_rate as any,
      commission_amount: commission_amount as any,
      status: ConversionStatus.PENDING,
      click_id: data.click_id ?? null,
    })
    if (data.click_id) {
      try { await this.updateAffiliateClicks({ id: data.click_id, converted: true }) } catch {}
    }
    return conv
  }

  /**
   * 取得聯盟夥伴統計資料
   */
  async getPartnerStats(partnerId: string): Promise<AffiliateStats> {
    const partner = await this.retrieveAffiliatePartner(partnerId)
    if (!partner) throw new Error('找不到聯盟夥伴')
    
    // 暫時返回模擬數據，因為 AffiliateClick 和 AffiliateConversion 表還未創建
    // TODO: 當表創建後，替換為實際的資料庫查詢
    
    return {
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      thisMonthEarnings: 0,
    }
  }

  private async generateUniqueAffiliateCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const code = this.generateAffiliateCode()
      const hit = await this.listAffiliatePartners({ filters: { affiliate_code: code } })
      if (!hit.length) return code
    }
    throw new Error('無法生成唯一的聯盟代碼')
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
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "dev-secret")
      // 對齊現有路由期望的欄位名稱
      if (decoded && decoded.partnerId && !decoded.id) {
        decoded.id = decoded.partnerId
      }
      return decoded
    } catch (error) {
      throw new Error('Token 驗證失敗')
    }
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
