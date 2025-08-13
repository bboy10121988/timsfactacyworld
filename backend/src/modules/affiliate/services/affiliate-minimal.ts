import { MedusaService } from "@medusajs/framework/utils"

// 完整的聯盟服務實作 - 包含推薦制
export default class AffiliateMinimalService extends MedusaService({}) {
  private container: any
  
  constructor(container: any) {
    super(container)
    this.container = container
  }

  /**
   * 記錄轉換並處理多層佣金分配
   */
  async recordConversion(data: { 
    affiliate_code: string
    order_id: string
    order_total: number
    click_id?: string 
  }) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      
      // 檢查訂單是否已存在
      const existingConversion = await pgConnection
        .select('*')
        .from('affiliate_referral')
        .where('order_id', data.order_id)
        .first()

      if (existingConversion) {
        return existingConversion
      }

      // 獲取直接聯盟夥伴信息
      const directPartner = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('affiliate_code', data.affiliate_code)
        .where('status', 'approved')
        .first()

      if (!directPartner) {
        throw new Error('找不到已核准的聯盟夥伴')
      }

      // 直接夥伴佣金 (10%)
      const directCommissionRate = 10 // 以整數形式存儲百分比
      const directCommissionAmount = Math.round(data.order_total * 10) // 以分為單位

      // 記錄直接佣金
      const directReferralId = `ref_${Date.now()}_direct`
      await pgConnection('affiliate_referral').insert({
        id: directReferralId,
        affiliate_partner_id: directPartner.id,
        order_id: data.order_id,
        referral_code: data.affiliate_code,
        order_total: data.order_total * 100, // 轉為分
        commission_rate: directCommissionRate,
        commission_amount: directCommissionAmount,
        status: 'pending',
        clicked_at: new Date(),
        converted_at: new Date()
      })

      let referrerReferral: any = null

      // 檢查是否有推薦人 (多層佣金)
      if (directPartner.referred_by_code) {
        const referrerPartner = await pgConnection
          .select('*')
          .from('affiliate_partner')
          .where('affiliate_code', directPartner.referred_by_code)
          .where('status', 'approved')
          .first()

        if (referrerPartner) {
          // 推薦人佣金 (5%)
          const referrerCommissionRate = 5
          const referrerCommissionAmount = Math.round(data.order_total * 5) // 以分為單位

          // 記錄推薦人佣金
          const referrerReferralId = `ref_${Date.now()}_referrer`
          referrerReferral = {
            id: referrerReferralId,
            affiliate_partner_id: referrerPartner.id,
            order_id: data.order_id,
            referral_code: directPartner.referred_by_code,
            order_total: data.order_total * 100,
            commission_rate: referrerCommissionRate,
            commission_amount: referrerCommissionAmount,
            status: 'pending',
            clicked_at: new Date(),
            converted_at: new Date()
          }

          await pgConnection('affiliate_referral').insert(referrerReferral)

          console.log(`✅ 多層佣金分配: 直接夥伴 ${data.affiliate_code} 獲得 $${directCommissionAmount/100}, 推薦人 ${directPartner.referred_by_code} 獲得 $${referrerCommissionAmount/100}`)
        }
      }

      return {
        direct_referral: {
          id: directReferralId,
          commission_amount: directCommissionAmount / 100,
          commission_rate: directCommissionRate
        },
        referrer_referral: referrerReferral ? {
          id: referrerReferral.id,
          commission_amount: referrerReferral.commission_amount / 100,
          commission_rate: referrerReferral.commission_rate
        } : null,
        total_commissions: referrerReferral 
          ? (directCommissionAmount + referrerReferral.commission_amount) / 100
          : directCommissionAmount / 100
      }

    } catch (error) {
      console.error('記錄轉換錯誤:', error)
      throw error
    }
  }

  /**
   * 創建聯盟夥伴 (支援推薦制)
   */
  async createPartner(data: {
    name: string
    email: string
    phone?: string
    website?: string
    referred_by_code?: string | null
  }) {
    try {
      // 嘗試不同的方式獲取 pg 連接
      let pgConnection
      try {
        pgConnection = this.container.resolve("__pg_connection__")
      } catch (error1) {
        try {
          pgConnection = this.container.resolve("pgConnection")
        } catch (error2) {
          console.error('無法解析數據庫連接:', { error1: error1.message, error2: error2.message })
          return { success: false, message: "數據庫連接錯誤" }
        }
      }
      
      // 檢查郵箱是否已存在
      const existing = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('email', data.email)
        .first()

      if (existing) {
        return { success: false, message: "此電子郵件已被使用" }
      }

      // 生成聯盟代碼
      const affiliateCode = `${data.name.substring(0, 4).toUpperCase()}2025`
      const referralLink = `https://timsfantasyworld.com?ref=${affiliateCode}`

      // 驗證推薦人代碼
      let referrerExists = false
      if (data.referred_by_code) {
        const referrer = await pgConnection
          .select('*')
          .from('affiliate_partner')
          .where('affiliate_code', data.referred_by_code)
          .where('status', 'approved')
          .first()
        
        referrerExists = !!referrer
        if (!referrerExists) {
          console.warn(`推薦人代碼 ${data.referred_by_code} 不存在或未核准`)
        }
      }

      // 創建新夥伴
      const newPartner = {
        id: `aff_${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        partner_code: affiliateCode,
        affiliate_code: affiliateCode,
        referral_link: referralLink,
        referred_by_code: (data.referred_by_code && referrerExists) ? data.referred_by_code : null,
        status: 'pending',
        commission_rate: 0.05, // 5% 默認佣金率
        created_at: new Date(),
        updated_at: new Date()
      }

      await pgConnection('affiliate_partner').insert(newPartner)

      // 如果有推薦人，更新推薦人的推薦數量
      if (newPartner.referred_by_code) {
        await pgConnection('affiliate_partner')
          .where('affiliate_code', newPartner.referred_by_code)
          .increment('total_referrals', 1)
        
        console.log(`✅ ${newPartner.referred_by_code} 成功推薦了 ${affiliateCode}`)
      }
      
      return { 
        success: true, 
        message: "註冊成功，請等待審核", 
        partner: newPartner,
        referrer_info: newPartner.referred_by_code ? {
          referred_by: newPartner.referred_by_code,
          message: "您將享受推薦制佣金分配"
        } : null
      }
    } catch (error) {
      console.error('創建夥伴詳細錯誤:', error)
      console.error('錯誤堆疊:', error.stack)
      return { success: false, message: `創建失敗: ${error.message}` }
    }
  }

  /**
   * 獲取夥伴統計 (包含推薦制統計)
   */
  async getPartnerStats(partnerId: string) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      
      // 獲取夥伴信息
      const partner = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('id', partnerId)
        .first()

      if (!partner) {
        throw new Error('找不到聯盟夥伴')
      }

      // 查詢點擊數據 (使用 affiliate_referral 表的 clicked_at 統計)
      const clicks = await pgConnection
        .count('* as count')
        .from('affiliate_referral')
        .where('affiliate_partner_id', partner.id)
        .whereNotNull('clicked_at')
        .first()

      // 查詢直接佣金 (自己的轉換)
      const directReferrals = await pgConnection
        .count('* as count')
        .sum('commission_amount as total_earnings')
        .from('affiliate_referral')
        .where('affiliate_partner_id', partner.id)
        .whereNotNull('converted_at')
        .first()

      // 查詢待處理佣金
      const pendingReferrals = await pgConnection
        .sum('commission_amount as pending_earnings')
        .from('affiliate_referral')
        .where('affiliate_partner_id', partner.id)
        .where('status', 'pending')
        .whereNotNull('converted_at')
        .first()

      // 查詢本月佣金
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      thisMonthStart.setHours(0, 0, 0, 0)
      
      const thisMonthReferrals = await pgConnection
        .sum('commission_amount as month_earnings')
        .from('affiliate_referral')
        .where('affiliate_partner_id', partner.id)
        .where('status', 'confirmed')
        .where('converted_at', '>=', thisMonthStart.toISOString())
        .whereNotNull('converted_at')
        .first()

      // 查詢推薦佣金 (下級的轉換，自己作為推薦人)
      const referralReferrals = await pgConnection
        .select('ar.*')
        .from('affiliate_referral as ar')
        .join('affiliate_partner as ap', 'ar.affiliate_partner_id', 'ap.id')
        .where('ap.referred_by_code', partner.affiliate_code)
        .whereNotNull('ar.converted_at')

      // 計算推薦佣金（假設推薦人獲得下級佣金的50%作為推薦獎金）
      const referralEarnings = referralReferrals.reduce((sum: number, ref: any) => {
        return sum + (ref.commission_amount * 0.5) // 推薦人獲得50%
      }, 0)

      // 查詢推薦的夥伴數
      const referredPartners = await pgConnection
        .count('* as count')
        .from('affiliate_partner')
        .where('referred_by_code', partner.affiliate_code)
        .first()

      const totalClicks = parseInt(clicks?.count || '0')
      const totalDirectReferrals = parseInt(directReferrals?.count || '0')
      const totalReferralReferrals = referralReferrals.length
      const directEarnings = parseFloat(directReferrals?.total_earnings || '0') / 100 // 轉為元
      const pendingEarnings = parseFloat(pendingReferrals?.pending_earnings || '0') / 100 // 轉為元
      const thisMonthEarnings = parseFloat(thisMonthReferrals?.month_earnings || '0') / 100 // 轉為元
      const totalReferrals = parseInt(referredPartners?.count || '0')
      
      const conversionRate = totalClicks > 0 ? (totalDirectReferrals / totalClicks) * 100 : 0
      const totalEarnings = directEarnings + (referralEarnings / 100)

      return {
        // 基本統計
        totalClicks,
        totalConversions: totalDirectReferrals,
        conversionRate: Math.round(conversionRate * 100) / 100,
        
        // 佣金統計 (增強版)
        directEarnings: Math.round(directEarnings * 100) / 100,
        referralEarnings: Math.round((referralEarnings / 100) * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        pendingEarnings: Math.round(pendingEarnings * 100) / 100,
        thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
        
        // 推薦制統計
        totalReferrals,
        referralConversions: totalReferralReferrals,
        
        // 推薦制信息
        referralInfo: {
          isReferred: !!partner.referred_by_code,
          referredBy: partner.referred_by_code || null,
          canEarnReferralBonus: true,
          directCommissionRate: '10%',
          referralCommissionRate: '5%'
        }
      }
    } catch (error) {
      console.error('獲取聯盟統計錯誤:', error)
      return {
        totalClicks: 0,
        totalConversions: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        thisMonthEarnings: 0,
        conversionRate: 0,
        directEarnings: 0,
        referralEarnings: 0,
        totalReferrals: 0,
        referralConversions: 0,
        referralInfo: {
          isReferred: false,
          referredBy: null,
          canEarnReferralBonus: false,
          directCommissionRate: '10%',
          referralCommissionRate: '5%'
        }
      }
    }
  }

  /**
   * 獲取推薦的夥伴列表
   */
  async getReferredPartners(partnerId: string) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      
      // 獲取當前夥伴的代碼
      const partner = await pgConnection
        .select('affiliate_code')
        .from('affiliate_partner')
        .where('id', partnerId)
        .first()

      if (!partner) {
        throw new Error('找不到聯盟夥伴')
      }

      // 查詢推薦的夥伴
      const referredPartners = await pgConnection
        .select('id', 'name', 'email', 'affiliate_code', 'status', 'created_at', 'total_referrals')
        .from('affiliate_partner')
        .where('referred_by_code', partner.affiliate_code)
        .orderBy('created_at', 'desc')

      // 為每個推薦夥伴添加統計信息
      const partnersWithStats = await Promise.all(referredPartners.map(async (p: any) => {
        const conversions = await pgConnection
          .count('* as count')
          .sum('commission_amount as earnings')
          .from('affiliate_conversion')
          .where('affiliate_code', p.affiliate_code)
          .first()

        return {
          ...p,
          totalConversions: parseInt(conversions?.count || '0'),
          totalEarnings: parseFloat(conversions?.earnings || '0'),
          yourReferralEarnings: parseFloat(conversions?.earnings || '0') * 0.5 // 假設推薦人獲得50%的推薦佣金
        }
      }))

      return {
        success: true,
        data: partnersWithStats,
        summary: {
          totalReferred: partnersWithStats.length,
          activePartners: partnersWithStats.filter((p: any) => p.status === 'approved').length,
          totalReferralEarnings: partnersWithStats.reduce((sum: number, p: any) => sum + p.yourReferralEarnings, 0)
        }
      }
    } catch (error) {
      console.error('獲取推薦夥伴錯誤:', error)
      return { success: false, message: "獲取失敗", data: [] }
    }
  }

  /**
   * 記錄點擊追蹤
   */
  async trackClick(data: {
    affiliate_code: string
    product_id?: string
    user_agent?: string
    referrer_url?: string
    session_id?: string
    ip_address?: string
  }) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      
      // 驗證聯盟代碼是否存在
      const partner = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('affiliate_code', data.affiliate_code)
        .where('status', 'approved')
        .first()

      if (!partner) {
        throw new Error('聯盟代碼無效或未核准')
      }

      // 創建點擊記錄（在 affiliate_referral 表中）
      const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const clickRecord = {
        id: clickId,
        affiliate_partner_id: partner.id,
        referral_code: data.affiliate_code,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
        referrer_url: data.referrer_url || null,
        clicked_at: new Date(),
        status: 'pending', // 點擊狀態，尚未轉換
        order_total: 0, // 點擊時還沒有訂單
        commission_amount: 0,
        commission_rate: 0
      }

      await pgConnection('affiliate_referral').insert(clickRecord)

      console.log(`✅ 點擊記錄成功: ${data.affiliate_code} - ${clickId}`)

      return {
        id: clickId,
        affiliate_code: data.affiliate_code,
        product_id: data.product_id,
        created_at: clickRecord.clicked_at.toISOString()
      }

    } catch (error) {
      console.error('記錄點擊錯誤:', error)
      throw error
    }
  }

  /**
   * 獲取夥伴列表 (管理員用)
   */
  async getPartners(options: {
    status?: string
    page?: number
    limit?: number
  } = {}) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      const { status, page = 1, limit = 20 } = options
      const offset = (page - 1) * limit

      let query = pgConnection
        .select('*')
        .from('affiliate_partner')
        .whereNull('deleted_at')

      if (status) {
        query = query.where('status', status)
      }

      const partners = await query
        .limit(limit)
        .offset(offset)
        .orderBy('created_at', 'desc')

      const countQuery = pgConnection
        .count('* as total')
        .from('affiliate_partner')
        .whereNull('deleted_at')

      if (status) {
        countQuery.where('status', status)
      }

      const [{ total }] = await countQuery

      return {
        partners,
        total: parseInt(total)
      }

    } catch (error) {
      console.error('獲取夥伴列表錯誤:', error)
      throw error
    }
  }

  /**
   * 核准/拒絕夥伴
   */
  async approvePartner(partnerId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")

      const updateData = {
        status,
        approved_at: status === 'approved' ? new Date() : null,
        updated_at: new Date()
      }

      if (reason) {
        updateData['notes'] = reason
      }

      const updated = await pgConnection('affiliate_partner')
        .where('id', partnerId)
        .update(updateData)
        .returning('*')

      if (!updated.length) {
        throw new Error('找不到要更新的夥伴')
      }

      console.log(`✅ 夥伴 ${partnerId} 狀態更新為: ${status}`)
      return updated[0]

    } catch (error) {
      console.error('核准夥伴錯誤:', error)
      throw error
    }
  }

  /**
   * 獲取單個合作夥伴詳情
   */
  async getPartner(partnerId: string) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")

      const partner = await pgConnection
        .select('*')
        .from('affiliate_partner')
        .where('id', partnerId)
        .first()

      if (!partner) {
        return {
          success: false,
          message: '找不到合作夥伴'
        }
      }

      // 獲取基本統計數據
      const stats = await this.getPartnerStats(partnerId)

      return {
        success: true,
        partner: {
          ...partner,
          stats
        }
      }

    } catch (error) {
      console.error('獲取合作夥伴錯誤:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '獲取失敗'
      }
    }
  }

  /**
   * 獲取轉換列表 (管理員用)
   */
  async getConversions(options: {
    status?: string
    page?: number
    limit?: number
  } = {}) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      const { status, page = 1, limit = 20 } = options
      const offset = (page - 1) * limit

      let query = pgConnection
        .select('ar.*', 'ap.name as partner_name', 'ap.email as partner_email', 'ap.affiliate_code')
        .from('affiliate_referral as ar')
        .join('affiliate_partner as ap', 'ar.affiliate_partner_id', 'ap.id')
        .whereNotNull('ar.converted_at') // 只顯示已轉換的記錄

      if (status) {
        query = query.where('ar.status', status)
      }

      const conversions = await query
        .limit(limit)
        .offset(offset)
        .orderBy('ar.converted_at', 'desc')

      const countQuery = pgConnection
        .count('* as total')
        .from('affiliate_referral as ar')
        .whereNotNull('ar.converted_at')

      if (status) {
        countQuery.where('ar.status', status)
      }

      const [{ total }] = await countQuery

      return {
        conversions: conversions.map(conv => ({
          ...conv,
          order_total: conv.order_total / 100, // 轉為元
          commission_amount: conv.commission_amount / 100 // 轉為元
        })),
        total: parseInt(total)
      }

    } catch (error) {
      console.error('獲取轉換列表錯誤:', error)
      throw error
    }
  }

  /**
   * 更新佣金狀態
   */
  async updateCommissionStatus(referralId: string, newStatus: 'confirmed' | 'cancelled' | 'paid', updateReason?: string) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")

      const updateData: any = {
        status: newStatus,
        updated_at: new Date()
      }

      if (newStatus === 'paid') {
        updateData.paid_at = new Date()
      }

      const updated = await pgConnection('affiliate_referral')
        .where('id', referralId)
        .update(updateData)
        .returning('*')

      if (!updated.length) {
        return { success: false, message: '找不到要更新的推薦記錄' }
      }

      console.log(`✅ 推薦記錄 ${referralId} 狀態更新為: ${newStatus}`)
      
      const result = updated[0]
      return { 
        success: true, 
        conversion: {
          ...result,
          order_total: result.order_total / 100,
          commission_amount: result.commission_amount / 100
        }
      }

    } catch (error) {
      console.error('更新佣金狀態錯誤:', error)
      return { success: false, message: error.message || '更新失敗' }
    }
  }

  /**
   * 獲取收益歷史 (合作夥伴用)
   */
  async getEarningsHistory(options: {
    partnerId?: string
    affiliateCode?: string
    page?: number
    limit?: number
    status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
  } = {}) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      const { partnerId, affiliateCode, page = 1, limit = 20, status } = options
      const offset = (page - 1) * limit

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
        .join('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
        .whereNull('ac.deleted_at') // 排除軟刪除記錄

      // 根據夥伴ID或代碼過濾
      if (partnerId) {
        query = query.where('ap.id', partnerId)
      } else if (affiliateCode) {
        query = query.where('ac.affiliate_code', affiliateCode)
      }

      // 根據狀態過濾
      if (status) {
        query = query.where('ac.status', status)
      }

      const earnings = await query
        .limit(limit)
        .offset(offset)
        .orderBy('ac.created_at', 'desc')

      // 計算總數
      let countQuery = pgConnection
        .count('* as total')
        .from('affiliate_conversion as ac')
        .join('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
        .whereNull('ac.deleted_at')

      if (partnerId) {
        countQuery = countQuery.where('ap.id', partnerId)
      } else if (affiliateCode) {
        countQuery = countQuery.where('ac.affiliate_code', affiliateCode)
      }

      if (status) {
        countQuery = countQuery.where('ac.status', status)
      }

      const [{ total }] = await countQuery

      // 轉換數據格式
      const formattedEarnings = earnings.map((earning) => ({
        id: earning.id,
        partnerId: earning.partner_id,
        orderId: earning.order_id,
        orderNumber: `TIM-${earning.order_id || earning.id.slice(-6)}`, 
        customerEmail: `customer-${earning.order_id || earning.id.slice(-6)}@example.com`,
        productName: '商品購買',
        orderAmount: Math.round(parseFloat(earning.order_total) * 100), // 轉為分
        commissionAmount: Math.round(parseFloat(earning.commission_amount) * 100), // 轉為分
        commissionRate: parseFloat(earning.commission_rate),
        status: earning.status,
        createdAt: earning.created_at,
        paidAt: earning.paid_at
      }))

      return {
        earnings: formattedEarnings,
        total: parseInt(total)
      }

    } catch (error) {
      console.error('獲取收益歷史錯誤:', error)
      throw error
    }
  }

  // 暫時註釋掉出問題的方法
  /*
  async getEarningsHistory(options: {
    partnerId?: string
    affiliateCode?: string
    page?: number
    limit?: number
    status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
  } = {}) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      const { partnerId, affiliateCode, page = 1, limit = 20, status } = options
      const offset = (page - 1) * limit

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
        .join('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
        .whereNull('ac.deleted_at') // 排除軟刪除記錄

      // 根據夥伴ID或代碼過濾
      if (partnerId) {
        query = query.where('ap.id', partnerId)
      } else if (affiliateCode) {
        query = query.where('ac.affiliate_code', affiliateCode)
      }

      // 根據狀態過濾
      if (status) {
        query = query.where('ac.status', status)
      }

      const earnings = await query
        .limit(limit)
        .offset(offset)
        .orderBy('ac.created_at', 'desc')

      // 計算總數
      let countQuery = pgConnection
        .count('* as total')
        .from('affiliate_conversion as ac')
        .join('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
        .whereNull('ac.deleted_at')

      if (partnerId) {
        countQuery = countQuery.where('ap.id', partnerId)
      } else if (affiliateCode) {
        countQuery = countQuery.where('ac.affiliate_code', affiliateCode)
      }

      if (status) {
        countQuery = countQuery.where('ac.status', status)
      }

      const [{ total }] = await countQuery

      // 轉換數據格式
      const formattedEarnings = earnings.map((earning) => ({
        id: earning.id,
        partnerId: earning.partner_id,
        orderId: earning.order_id,
        orderNumber: `TIM-${earning.order_id || earning.id.slice(-6)}`, 
        customerEmail: `customer-${earning.order_id || earning.id.slice(-6)}@example.com`,
        productName: '商品購買',
        orderAmount: Math.round(parseFloat(earning.order_total) * 100), // 轉為分
        commissionAmount: Math.round(parseFloat(earning.commission_amount) * 100), // 轉為分
        commissionRate: parseFloat(earning.commission_rate),
        status: earning.status,
        createdAt: earning.created_at,
        paidAt: earning.paid_at
      }))

      return {
        earnings: formattedEarnings,
        total: parseInt(total)
      }

    } catch (error) {
      console.error('獲取收益歷史錯誤:', error)
      throw error
    }
  }

  /**
   * 獲取管理員的合作夥伴列表 (管理後台用)
   */
  async getAdminPartners(options: {
    status?: 'pending' | 'approved' | 'rejected' | 'suspended'
    page?: number
    limit?: number
  } = {}) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      const { status, page = 1, limit = 20 } = options
      const offset = (page - 1) * limit

      let query = pgConnection
        .select(
          'id',
          'name', 
          'email',
          'phone',
          'company',
          'website',
          'affiliate_code',
          'commission_rate',
          'status',
          'referred_by_code',
          'created_at',
          'updated_at'
        )
        .from('affiliate_partner')

      if (status) {
        query = query.where('status', status)
      }

      const partners = await query
        .limit(limit)
        .offset(offset)
        .orderBy('created_at', 'desc')

      // 計算總數
      let countQuery = pgConnection
        .count('* as total')
        .from('affiliate_partner')

      if (status) {
        countQuery = countQuery.where('status', status)
      }

      const [{ total }] = await countQuery

      return {
        partners,
        total: parseInt(total),
        totalPages: Math.ceil(parseInt(total) / limit),
        currentPage: page
      }

    } catch (error) {
      console.error('獲取管理員合作夥伴列表錯誤:', error)
      throw error
    }
  }

  /**
   * 獲取管理員統計數據
   */
  async getAdminStats() {
    try {
      // 嘗試多種方式獲取數據庫連接
      let pgConnection;
      
      try {
        pgConnection = this.container.resolve("__pg_connection__");
      } catch (error) {
        console.log('嘗試其他數據庫連接方式...');
        try {
          pgConnection = this.container.resolve("pg_connection");
        } catch (error2) {
          try {
            const dbService = this.container.resolve("dbService");
            pgConnection = dbService.connection;
          } catch (error3) {
            // 返回模擬數據
            console.log('無法獲取數據庫連接，返回模擬數據');
            return {
              partners: {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                suspended: 0
              },
              performance: {
                totalClicks: 0,
                totalConversions: 0,
                totalCommissions: 0,
                monthlyConversions: 0,
                monthlyCommissions: 0,
                conversionRate: 0
              }
            };
          }
        }
      }

      // 合作夥伴統計
      const partnerStats = await pgConnection
        .select('status')
        .count('* as count')
        .from('affiliate_partner')
        .groupBy('status')

      // 點擊統計
      const clickStats = await pgConnection
        .count('* as total_clicks')
        .from('affiliate_referral')
        .whereNotNull('clicked_at')
        .first()

      // 轉換統計
      const conversionStats = await pgConnection
        .count('* as total_conversions')
        .sum('commission_amount as total_commissions')
        .from('affiliate_referral')
        .whereNotNull('converted_at')
        .first()

      // 本月統計
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const monthlyStats = await pgConnection
        .count('* as monthly_conversions')
        .sum('commission_amount as monthly_commissions')
        .from('affiliate_referral')
        .whereNotNull('converted_at')
        .where('converted_at', '>=', thisMonth.toISOString())
        .first()

      // 格式化夥伴統計
      const partnerCounts = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0
      }

      partnerStats.forEach(stat => {
        partnerCounts[stat.status as keyof typeof partnerCounts] = parseInt(stat.count)
        partnerCounts.total += parseInt(stat.count)
      })

      return {
        partners: partnerCounts,
        performance: {
          totalClicks: parseInt(clickStats?.total_clicks || '0'),
          totalConversions: parseInt(conversionStats?.total_conversions || '0'),
          totalCommissions: parseFloat(conversionStats?.total_commissions || '0') / 100,
          monthlyConversions: parseInt(monthlyStats?.monthly_conversions || '0'),
          monthlyCommissions: parseFloat(monthlyStats?.monthly_commissions || '0') / 100,
          conversionRate: parseInt(clickStats?.total_clicks || '0') > 0 
            ? (parseInt(conversionStats?.total_conversions || '0') / parseInt(clickStats?.total_clicks || '0')) * 100 
            : 0
        }
      }

    } catch (error) {
      console.error('獲取管理員統計錯誤:', error)
      throw error
    }
  }

  /**
   * 獲取管理員佣金列表
   */
  async getAdminCommissions(options: {
    status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
    page?: number
    limit?: number
  } = {}) {
    try {
      const pgConnection = this.container.resolve("__pg_connection__")
      const { status, page = 1, limit = 20 } = options
      const offset = (page - 1) * limit

      let query = pgConnection
        .select(
          'ar.id',
          'ar.order_id',
          'ar.order_total',
          'ar.commission_amount',
          'ar.commission_rate',
          'ar.status',
          'ar.converted_at',
          'ar.created_at',
          'ar.updated_at',
          'ap.name as partner_name',
          'ap.email as partner_email',
          'ap.affiliate_code'
        )
        .from('affiliate_referral as ar')
        .join('affiliate_partner as ap', 'ar.affiliate_partner_id', 'ap.id')
        .whereNotNull('ar.converted_at')
        .whereNotNull('ar.order_id')

      if (status) {
        query = query.where('ar.status', status)
      }

      const commissions = await query
        .limit(limit)
        .offset(offset)
        .orderBy('ar.converted_at', 'desc')

      // 計算總數
      let countQuery = pgConnection
        .count('* as total')
        .from('affiliate_referral as ar')
        .join('affiliate_partner as ap', 'ar.affiliate_partner_id', 'ap.id')
        .whereNotNull('ar.converted_at')
        .whereNotNull('ar.order_id')

      if (status) {
        countQuery = countQuery.where('ar.status', status)
      }

      const [{ total }] = await countQuery

      // 格式化佣金數據
      const formattedCommissions = commissions.map(commission => ({
        ...commission,
        order_total: commission.order_total / 100, // 轉為元
        commission_amount: commission.commission_amount / 100, // 轉為元
        commission_rate: commission.commission_rate / 100 // 轉為小數
      }))

      return {
        commissions: formattedCommissions,
        total: parseInt(total),
        totalPages: Math.ceil(parseInt(total) / limit),
        currentPage: page
      }

    } catch (error) {
      console.error('獲取管理員佣金列表錯誤:', error)
      throw error
    }
  }
}