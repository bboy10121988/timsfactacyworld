import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

// 模擬資料存儲（實際使用時應該連接資料庫）
const partners = new Map()
const clicks = new Map()
const conversions = new Map()

interface CreatePartnerData {
  name: string
  email: string
  phone?: string
  website?: string
  password: string
}

interface PartnerStats {
  totalClicks: number
  totalConversions: number
  totalCommissions: number
  conversionRate: number
  pendingCommissions: number
  paidCommissions: number
}

/**
 * 聯盟行銷服務 - 完整實作版本
 */
export default class AffiliateService {
  private readonly JWT_SECRET = process.env.AFFILIATE_JWT_SECRET || 'default-secret-key'
  private readonly SALT_ROUNDS = 10

  /**
   * 生成唯一推廣碼
   */
  private generateUniqueCode(name: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `${name.substring(0, 3).toUpperCase()}${timestamp}${random}`.toUpperCase()
  }

  /**
   * 創建聯盟夥伴
   */
  async createPartner(data: CreatePartnerData): Promise<any> {
    try {
      // 檢查 email 是否已存在
      const existingPartner = Array.from(partners.values()).find(
        (p: any) => p.email === data.email
      )
      
      if (existingPartner) {
        throw new Error("此 email 已經註冊過")
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS)
      
      // 生成唯一 ID 和推廣碼
      const partnerId = uuidv4()
      const uniqueCode = this.generateUniqueCode(data.name)
      
      // 創建夥伴記錄
      const partner = {
        id: partnerId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        password: hashedPassword,
        status: "pending",
        commissionRate: 0.05, // 預設 5% 佣金
        uniqueCode,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      partners.set(partnerId, partner)
      
      // 回傳時不包含密碼
      const { password, ...partnerWithoutPassword } = partner
      return partnerWithoutPassword
      
    } catch (error) {
      throw new Error(`創建夥伴失敗: ${error.message}`)
    }
  }

  /**
   * 檢查 email 是否存在
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const existingPartner = Array.from(partners.values()).find(
      (p: any) => p.email === email
    )
    return !!existingPartner
  }

  /**
   * 聯盟夥伴登入
   */
  async loginPartner(email: string, password: string): Promise<{
    partner: any
    token: string
  }> {
    try {
      // 查找夥伴
      const partner = Array.from(partners.values()).find(
        (p: any) => p.email === email
      )
      
      if (!partner) {
        throw new Error("找不到此 email 的夥伴帳號")
      }
      
      if (partner.status !== "approved") {
        throw new Error("帳號尚未通過審核，請等待管理員審核")
      }
      
      // 驗證密碼
      const isValidPassword = await bcrypt.compare(password, partner.password)
      if (!isValidPassword) {
        throw new Error("密碼錯誤")
      }
      
      // 生成 JWT token
      const token = jwt.sign(
        { 
          partnerId: partner.id,
          email: partner.email,
          name: partner.name
        },
        this.JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      // 回傳時不包含密碼
      const { password: _, ...partnerWithoutPassword } = partner
      
      return {
        partner: partnerWithoutPassword,
        token
      }
      
    } catch (error) {
      throw new Error(`登入失敗: ${error.message}`)
    }
  }

  /**
   * 驗證 JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET)
    } catch (error) {
      throw new Error("無效的認證 token")
    }
  }

  /**
   * 記錄點擊
   */
  async trackClick(data: {
    partnerId: string
    productId?: string
    url: string
    ipAddress?: string
    userAgent?: string
    referrer?: string
  }): Promise<any> {
    try {
      // 驗證夥伴是否存在且已核准
      const partner = partners.get(data.partnerId)
      if (!partner || partner.status !== "approved") {
        throw new Error("無效的夥伴 ID 或夥伴未核准")
      }
      
      const clickId = uuidv4()
      const click = {
        id: clickId,
        partnerId: data.partnerId,
        productId: data.productId,
        url: data.url,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
        clickTime: new Date()
      }
      
      clicks.set(clickId, click)
      return click
      
    } catch (error) {
      throw new Error(`記錄點擊失敗: ${error.message}`)
    }
  }

  /**
   * 記錄轉換
   */
  async recordConversion(data: {
    partnerId: string
    orderId: string
    productId?: string
    orderValue: number
    commissionRate: number
  }): Promise<any> {
    try {
      // 驗證夥伴是否存在且已核准
      const partner = partners.get(data.partnerId)
      if (!partner || partner.status !== "approved") {
        throw new Error("無效的夥伴 ID 或夥伴未核准")
      }
      
      // 計算佣金
      const commissionAmount = data.orderValue * data.commissionRate
      
      const conversionId = uuidv4()
      const conversion = {
        id: conversionId,
        partnerId: data.partnerId,
        orderId: data.orderId,
        productId: data.productId,
        orderValue: data.orderValue,
        commissionRate: data.commissionRate,
        commissionAmount,
        status: "pending",
        conversionTime: new Date()
      }
      
      conversions.set(conversionId, conversion)
      return conversion
      
    } catch (error) {
      throw new Error(`記錄轉換失敗: ${error.message}`)
    }
  }

  /**
   * 取得夥伴統計資料
   */
  async getPartnerStats(partnerId: string): Promise<PartnerStats> {
    try {
      // 驗證夥伴是否存在
      const partner = partners.get(partnerId)
      if (!partner) {
        throw new Error("找不到夥伴")
      }
      
      // 計算點擊數
      const partnerClicks = Array.from(clicks.values()).filter(
        (click: any) => click.partnerId === partnerId
      )
      
      // 計算轉換數
      const partnerConversions = Array.from(conversions.values()).filter(
        (conversion: any) => conversion.partnerId === partnerId
      )
      
      // 計算佣金
      const totalCommissions = partnerConversions.reduce(
        (sum: number, conversion: any) => sum + conversion.commissionAmount, 0
      )
      
      const pendingCommissions = partnerConversions
        .filter((conversion: any) => conversion.status === "pending")
        .reduce((sum: number, conversion: any) => sum + conversion.commissionAmount, 0)
      
      const paidCommissions = partnerConversions
        .filter((conversion: any) => conversion.status === "paid")
        .reduce((sum: number, conversion: any) => sum + conversion.commissionAmount, 0)
      
      const conversionRate = partnerClicks.length > 0 
        ? (partnerConversions.length / partnerClicks.length) * 100 
        : 0
      
      return {
        totalClicks: partnerClicks.length,
        totalConversions: partnerConversions.length,
        totalCommissions,
        conversionRate: Number(conversionRate.toFixed(2)),
        pendingCommissions,
        paidCommissions
      }
      
    } catch (error) {
      throw new Error(`取得統計資料失敗: ${error.message}`)
    }
  }

  /**
   * 審核聯盟夥伴
   */
  async approvePartner(partnerId: string, status: "approved" | "rejected", reason?: string): Promise<any> {
    try {
      const partner = partners.get(partnerId)
      if (!partner) {
        throw new Error("找不到夥伴")
      }
      
      partner.status = status
      partner.updatedAt = new Date()
      
      if (reason) {
        partner.reviewReason = reason
      }
      
      partners.set(partnerId, partner)
      
      // 回傳時不包含密碼
      const { password, ...partnerWithoutPassword } = partner
      return partnerWithoutPassword
      
    } catch (error) {
      throw new Error(`審核夥伴失敗: ${error.message}`)
    }
  }

  /**
   * 取得所有待審核的夥伴
   */
  async getPendingPartners(): Promise<any[]> {
    const pendingPartners = Array.from(partners.values())
      .filter((partner: any) => partner.status === "pending")
      .map(({ password, ...partner }) => partner) // 移除密碼欄位
    
    return pendingPartners
  }

  /**
   * 取得夥伴列表
   */
  async getPartners(filters?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{
    partners: any[]
    total: number
  }> {
    let filteredPartners = Array.from(partners.values())
    
    // 過濾狀態
    if (filters?.status) {
      filteredPartners = filteredPartners.filter(
        (partner: any) => partner.status === filters.status
      )
    }
    
    // 分頁
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedPartners = filteredPartners
      .slice(startIndex, endIndex)
      .map(({ password, ...partner }) => partner) // 移除密碼欄位
    
    return {
      partners: paginatedPartners,
      total: filteredPartners.length
    }
  }

  /**
   * 取得佣金列表
   */
  async getCommissions(filters?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{
    commissions: any[]
    total: number
  }> {
    let filteredCommissions = Array.from(conversions.values())
    
    // 過濾狀態
    if (filters?.status) {
      filteredCommissions = filteredCommissions.filter(
        (commission: any) => commission.status === filters.status
      )
    }
    
    // 加上夥伴資訊
    const commissionsWithPartnerInfo = filteredCommissions.map((commission: any) => {
      const partner = partners.get(commission.partnerId)
      return {
        ...commission,
        partnerName: partner?.name || 'Unknown',
        partnerEmail: partner?.email || 'Unknown'
      }
    })
    
    // 分頁
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return {
      commissions: commissionsWithPartnerInfo.slice(startIndex, endIndex),
      total: filteredCommissions.length
    }
  }

  /**
   * 更新佣金狀態
   */
  async updateCommissionStatus(commissionId: string, status: "approved" | "paid" | "rejected", reason?: string): Promise<any> {
    try {
      const commission = conversions.get(commissionId)
      if (!commission) {
        throw new Error("找不到佣金記錄")
      }
      
      commission.status = status
      commission.updatedAt = new Date()
      
      if (reason) {
        commission.reviewReason = reason
      }
      
      conversions.set(commissionId, commission)
      
      return commission
      
    } catch (error) {
      throw new Error(`更新佣金狀態失敗: ${error.message}`)
    }
  }

  /**
   * 取得統計資料（管理員用）
   */
  async getAdminStats(): Promise<any> {
    const allPartners = Array.from(partners.values())
    const allClicks = Array.from(clicks.values())
    const allConversions = Array.from(conversions.values())
    
    const totalCommissions = allConversions.reduce(
      (sum, conversion: any) => sum + conversion.commissionAmount, 0
    )
    
    const pendingCommissions = allConversions
      .filter((conversion: any) => conversion.status === "pending")
      .reduce((sum, conversion: any) => sum + conversion.commissionAmount, 0)
    
    const paidCommissions = allConversions
      .filter((conversion: any) => conversion.status === "paid")
      .reduce((sum, conversion: any) => sum + conversion.commissionAmount, 0)
    
    const conversionRate = allClicks.length > 0 
      ? (allConversions.length / allClicks.length) * 100 
      : 0
    
    return {
      totalPartners: allPartners.length,
      pendingPartners: allPartners.filter((p: any) => p.status === "pending").length,
      approvedPartners: allPartners.filter((p: any) => p.status === "approved").length,
      rejectedPartners: allPartners.filter((p: any) => p.status === "rejected").length,
      totalClicks: allClicks.length,
      totalConversions: allConversions.length,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      conversionRate: Number(conversionRate.toFixed(2))
    }
  }

  /**
   * 取得最近註冊的夥伴
   */
  async getRecentPartners(limit: number = 5): Promise<any[]> {
    return Array.from(partners.values())
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(({ password, ...partner }) => partner) // 移除密碼欄位
  }
}
