import crypto from "crypto"
import jwt from "jsonwebtoken"
import { MedusaContainer } from "@medusajs/framework"

/**
 * 聯盟行銷服務
 */
export default class AffiliateService {
  private container: MedusaContainer

  constructor(container: MedusaContainer) {
    this.container = container
  }

  /**
   * 生成唯一代碼
   */
  private generateUniqueCode(name: string): string {
    const timestamp = Date.now().toString(36)
    const hash = crypto.createHash('md5').update(name + timestamp).digest('hex').substring(0, 6).toUpperCase()
    return `${hash}${timestamp.substring(-3)}`
  }

  /**
   * 加密密碼
   */
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  /**
   * 驗證密碼
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return hash === verifyHash
  }

  /**
   * 生成JWT token
   */
  private generateToken(partnerId: string): string {
    const secret = process.env.AFFILIATE_JWT_SECRET || 'default-secret'
    return jwt.sign({ partnerId }, secret, { expiresIn: '7d' })
  }

  /**
   * 驗證JWT token
   */
  verifyToken(token: string): { partnerId: string } | null {
    try {
      const secret = process.env.AFFILIATE_JWT_SECRET || 'default-secret'
      const decoded = jwt.verify(token, secret) as { partnerId: string }
      return decoded
    } catch (error) {
      return null
    }
  }

  /**
   * 檢查email是否已存在
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // TODO: 實際查詢資料庫
      // const query = `SELECT id FROM affiliate_partner WHERE email = ?`
      // const result = await this.container.resolve('query').raw(query, [email])
      // return result.length > 0

      // 模擬檢查 (實際環境中替換為真實查詢)
      const mockExistingEmails = ['existing@example.com', 'test@example.com']
      return mockExistingEmails.includes(email)
    } catch (error) {
      console.error('檢查email錯誤:', error)
      return false
    }
  }

  /**
   * 創建聯盟夥伴
   */
  async createPartner(data: {
    name: string
    email: string
    phone?: string
    website?: string
    password: string
  }): Promise<any> {
    try {
      // 1. 檢查 email 是否已存在
      const emailExists = await this.checkEmailExists(data.email)
      if (emailExists) {
        throw new Error('此 email 已被使用')
      }

      // 2. 生成唯一代碼和加密密碼
      const uniqueCode = this.generateUniqueCode(data.name)
      const hashedPassword = this.hashPassword(data.password)

      // 3. 創建夥伴記錄
      const partnerData = {
        id: `partner_${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        password: hashedPassword,
        status: 'pending',
        commissionRate: 0.05, // 預設5%佣金
        uniqueCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // TODO: 實際儲存到資料庫
      // const query = `INSERT INTO affiliate_partner (...) VALUES (...)`
      // await this.container.resolve('query').raw(query, [...])

      console.log('創建夥伴:', partnerData)

      return {
        success: true,
        partner: {
          id: partnerData.id,
          name: partnerData.name,
          email: partnerData.email,
          phone: partnerData.phone,
          website: partnerData.website,
          status: partnerData.status,
          uniqueCode: partnerData.uniqueCode,
          createdAt: partnerData.createdAt
        }
      }
    } catch (error: any) {
      throw new Error(error.message || '創建夥伴失敗')
    }
  }

  /**
   * 聯盟夥伴登入
   */
  async loginPartner(email: string, password: string): Promise<{
    partner: any
    token: string
  }> {
    try {
      // TODO: 實際查詢資料庫
      // const query = `SELECT * FROM affiliate_partner WHERE email = ? AND status = 'approved'`
      // const partners = await this.container.resolve('query').raw(query, [email])
      // if (partners.length === 0) {
      //   throw new Error('找不到此夥伴或尚未審核通過')
      // }
      // const partner = partners[0]

      // 模擬查詢結果
      if (email === 'test@example.com') {
        const mockPartner = {
          id: 'partner_123',
          name: '測試夥伴',
          email: 'test@example.com',
          password: this.hashPassword('test123456'), // 模擬已加密密碼
          status: 'approved',
          uniqueCode: 'TEST001'
        }

        // 驗證密碼
        if (!this.verifyPassword(password, mockPartner.password)) {
          throw new Error('密碼錯誤')
        }

        // 生成 token
        const token = this.generateToken(mockPartner.id)

        return {
          partner: {
            id: mockPartner.id,
            name: mockPartner.name,
            email: mockPartner.email,
            status: mockPartner.status,
            uniqueCode: mockPartner.uniqueCode
          },
          token
        }
      }

      throw new Error('找不到此夥伴或尚未審核通過')
    } catch (error: any) {
      throw new Error(error.message || '登入失敗')
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
      const clickData = {
        id: `click_${Date.now()}`,
        partnerId: data.partnerId,
        productId: data.productId,
        url: data.url,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
        clickTime: new Date().toISOString()
      }

      // TODO: 實際儲存到資料庫
      // const query = `INSERT INTO affiliate_click (...) VALUES (...)`
      // await this.container.resolve('query').raw(query, [...])

      console.log('記錄點擊:', clickData)

      return {
        success: true,
        click: clickData
      }
    } catch (error: any) {
      throw new Error(error.message || '記錄點擊失敗')
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
    conversionTime?: Date
  }): Promise<any> {
    try {
      const commissionAmount = data.orderValue * data.commissionRate

      const conversionData = {
        id: `conversion_${Date.now()}`,
        partnerId: data.partnerId,
        orderId: data.orderId,
        productId: data.productId,
        orderValue: data.orderValue,
        commissionRate: data.commissionRate,
        commissionAmount,
        conversionTime: (data.conversionTime || new Date()).toISOString(),
        status: 'pending'
      }

      // TODO: 實際儲存到資料庫
      console.log('記錄轉換:', conversionData)

      return {
        success: true,
        conversion: conversionData
      }
    } catch (error: any) {
      throw new Error(error.message || '記錄轉換失敗')
    }
  }

  /**
   * 取得夥伴統計資料
   */
  async getPartnerStats(partnerId: string): Promise<any> {
    try {
      // TODO: 實際查詢資料庫統計
      // const clicksQuery = `SELECT COUNT(*) as count FROM affiliate_click WHERE partnerId = ?`
      // const conversionsQuery = `SELECT COUNT(*) as count, SUM(commissionAmount) as total FROM affiliate_conversion WHERE partnerId = ?`

      // 模擬統計數據
      const stats = {
        totalClicks: 150,
        totalConversions: 12,
        totalCommissions: 2400,
        conversionRate: 8.0,
        pendingCommissions: 800,
        paidCommissions: 1600
      }

      return stats
    } catch (error: any) {
      throw new Error(error.message || '取得統計資料失敗')
    }
  }

  /**
   * 審核聯盟夥伴
   */
  async approvePartner(partnerId: string, status: "approved" | "rejected", reason?: string): Promise<any> {
    try {
      // TODO: 實際更新資料庫
      // const query = `UPDATE affiliate_partner SET status = ?, updatedAt = ? WHERE id = ?`
      // await this.container.resolve('query').raw(query, [status, new Date().toISOString(), partnerId])

      console.log(`審核夥伴 ${partnerId}: ${status}`, reason ? `原因: ${reason}` : '')

      // TODO: 發送通知 email (後續實作)

      return {
        success: true,
        partner: {
          id: partnerId,
          status,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (error: any) {
      throw new Error(error.message || '審核失敗')
    }
  }

  /**
   * 取得所有待審核的夥伴
   */
  async getPendingPartners(): Promise<any[]> {
    try {
      // TODO: 實際查詢資料庫
      // const query = `SELECT * FROM affiliate_partner WHERE status = 'pending' ORDER BY createdAt DESC`
      // const partners = await this.container.resolve('query').raw(query)

      // 模擬待審核夥伴
      const mockPendingPartners = [
        {
          id: "partner_1",
          name: "張三",
          email: "zhang@example.com",
          phone: "0912345678",
          website: "https://zhang-blog.com",
          status: "pending",
          uniqueCode: "ZHANG001",
          createdAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "partner_2",
          name: "李四",
          email: "li@example.com",
          phone: "0987654321",
          website: "https://li-shop.com",
          status: "pending",
          uniqueCode: "LI002",
          createdAt: "2024-01-20T14:30:00Z"
        }
      ]

      return mockPendingPartners
    } catch (error: any) {
      throw new Error(error.message || '取得待審核夥伴失敗')
    }
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
    try {
      const { status, page = 1, limit = 20 } = filters || {}

      // TODO: 實際查詢資料庫
      // let query = `SELECT * FROM affiliate_partner`
      // const params = []
      // if (status) {
      //   query += ` WHERE status = ?`
      //   params.push(status)
      // }
      // query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`
      // params.push(limit, (page - 1) * limit)

      // 模擬夥伴列表
      const mockPartners = [
        {
          id: "partner_1",
          name: "張三",
          email: "zhang@example.com",
          phone: "0912345678",
          website: "https://zhang-blog.com",
          status: "pending",
          commissionRate: 0.05,
          uniqueCode: "ZHANG001",
          createdAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "partner_2",
          name: "李四",
          email: "li@example.com",
          phone: "0987654321",
          website: "https://li-shop.com",
          status: "approved",
          commissionRate: 0.05,
          uniqueCode: "LI002",
          createdAt: "2024-01-20T14:30:00Z"
        }
      ]

      const filteredPartners = status 
        ? mockPartners.filter(p => p.status === status)
        : mockPartners

      return {
        partners: filteredPartners,
        total: filteredPartners.length
      }
    } catch (error: any) {
      throw new Error(error.message || '取得夥伴列表失敗')
    }
  }

  /**
   * 取得佣金列表
   */
  async getCommissions(filters?: {
    status?: string
    partnerId?: string
    page?: number
    limit?: number
  }): Promise<{
    commissions: any[]
    total: number
  }> {
    try {
      // TODO: 實際查詢資料庫

      // 模擬佣金列表
      const mockCommissions = [
        {
          id: "commission_1",
          partnerId: "partner_1",
          partnerName: "張三",
          orderId: "order_001",
          productName: "商品 A",
          orderValue: 1000,
          commissionRate: 0.05,
          commissionAmount: 50,
          status: "pending",
          conversionTime: "2024-02-01T10:00:00Z"
        },
        {
          id: "commission_2",
          partnerId: "partner_2",
          partnerName: "李四",
          orderId: "order_002",
          productName: "商品 B",
          orderValue: 2000,
          commissionRate: 0.05,
          commissionAmount: 100,
          status: "approved",
          conversionTime: "2024-02-02T14:30:00Z"
        }
      ]

      const { status, partnerId } = filters || {}
      let filteredCommissions = mockCommissions

      if (status) {
        filteredCommissions = filteredCommissions.filter(c => c.status === status)
      }
      if (partnerId) {
        filteredCommissions = filteredCommissions.filter(c => c.partnerId === partnerId)
      }

      return {
        commissions: filteredCommissions,
        total: filteredCommissions.length
      }
    } catch (error: any) {
      throw new Error(error.message || '取得佣金列表失敗')
    }
  }

  /**
   * 更新佣金狀態
   */
  async updateCommissionStatus(commissionId: string, status: "approved" | "paid" | "rejected", reason?: string): Promise<any> {
    try {
      // TODO: 實際更新資料庫
      console.log(`更新佣金 ${commissionId} 狀態為 ${status}`, reason ? `原因: ${reason}` : '')

      return {
        success: true,
        commission: {
          id: commissionId,
          status,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (error: any) {
      throw new Error(error.message || '更新佣金狀態失敗')
    }
  }

  /**
   * 取得統計數據
   */
  async getDashboardStats(): Promise<any> {
    try {
      // TODO: 實際查詢資料庫統計

      return {
        totalPartners: 25,
        pendingPartners: 3,
        approvedPartners: 20,
        rejectedPartners: 2,
        totalClicks: 5420,
        totalConversions: 186,
        totalCommissions: 12500,
        pendingCommissions: 1800,
        paidCommissions: 10700,
        conversionRate: 3.4
      }
    } catch (error: any) {
      throw new Error(error.message || '取得統計數據失敗')
    }
  }
}
