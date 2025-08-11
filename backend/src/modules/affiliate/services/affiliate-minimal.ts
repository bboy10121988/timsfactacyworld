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
        .from('affiliate_conversion')
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
      const directCommissionRate = 0.10
      const directCommissionAmount = Math.round(data.order_total * directCommissionRate * 100) / 100

      // 記錄直接佣金
      const directConversionId = `conv_${Date.now()}_direct`
      await pgConnection('affiliate_conversion').insert({
        id: directConversionId,
        affiliate_code: data.affiliate_code,
        order_id: data.order_id,
        order_total: data.order_total,
        commission_rate: directCommissionRate,
        commission_amount: directCommissionAmount,
        status: 'pending',
        click_id: data.click_id || null,
        created_at: new Date(),
        updated_at: new Date()
      })

      let referrerConversion: any = null

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
          const referrerCommissionRate = 0.05
          const referrerCommissionAmount = Math.round(data.order_total * referrerCommissionRate * 100) / 100

          // 記錄推薦人佣金
          const referrerConversionId = `conv_${Date.now()}_referrer`
          referrerConversion = {
            id: referrerConversionId,
            affiliate_code: directPartner.referred_by_code,
            order_id: data.order_id,
            order_total: data.order_total,
            commission_rate: referrerCommissionRate,
            commission_amount: referrerCommissionAmount,
            status: 'pending',
            click_id: null, // 推薦人佣金不直接關聯點擊
            created_at: new Date(),
            updated_at: new Date()
          }

          await pgConnection('affiliate_conversion').insert(referrerConversion)

          console.log(`✅ 多層佣金分配: 直接夥伴 ${data.affiliate_code} 獲得 $${directCommissionAmount}, 推薦人 ${directPartner.referred_by_code} 獲得 $${referrerCommissionAmount}`)
        }
      }

      // 標記點擊為已轉換
      if (data.click_id) {
        try {
          await pgConnection('affiliate_click')
            .where('id', data.click_id)
            .update({ converted: true, updated_at: new Date() })
        } catch (error) {
          console.warn('更新點擊狀態失敗:', error)
        }
      }

      return {
        direct_conversion: {
          id: directConversionId,
          commission_amount: directCommissionAmount,
          commission_rate: directCommissionRate
        },
        referrer_conversion: referrerConversion ? {
          id: referrerConversion.id,
          commission_amount: referrerConversion.commission_amount,
          commission_rate: referrerConversion.commission_rate
        } : null,
        total_commissions: referrerConversion 
          ? directCommissionAmount + referrerConversion.commission_amount 
          : directCommissionAmount
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
      const pgConnection = this.container.resolve("__pg_connection__")
      
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
        affiliate_code: affiliateCode,
        referral_link: referralLink,
        referred_by_code: (data.referred_by_code && referrerExists) ? data.referred_by_code : null,
        status: 'pending',
        commission_rate: 0.10, // 10% 默認佣金率
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
      console.error('創建夥伴錯誤:', error)
      return { success: false, message: "創建失敗" }
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

      // 查詢點擊數據
      const clicks = await pgConnection
        .count('* as count')
        .from('affiliate_click')
        .where('affiliate_code', partner.affiliate_code)
        .first()

      // 查詢直接佣金 (自己推廣的訂單)
      const directConversions = await pgConnection
        .count('* as count')
        .sum('commission_amount as total_earnings')
        .from('affiliate_conversion')
        .where('affiliate_code', partner.affiliate_code)
        .first()

      // 查詢推薦佣金 (下級推廣的訂單)
      const referralConversions = await pgConnection
        .select('*')
        .from('affiliate_conversion as ac')
        .join('affiliate_partner as ap', 'ac.affiliate_code', 'ap.affiliate_code')
        .where('ap.referred_by_code', partner.affiliate_code)
        .count('* as count')
        .sum('ac.commission_amount as referral_earnings')
        .first()

      // 查詢推薦的夥伴數
      const referredPartners = await pgConnection
        .count('* as count')
        .from('affiliate_partner')
        .where('referred_by_code', partner.affiliate_code)
        .first()

      const totalClicks = parseInt(clicks?.count || '0')
      const totalDirectConversions = parseInt(directConversions?.count || '0')
      const totalReferralConversions = parseInt(referralConversions?.count || '0')
      const directEarnings = parseFloat(directConversions?.total_earnings || '0')
      const referralEarnings = parseFloat(referralConversions?.referral_earnings || '0')
      const totalReferrals = parseInt(referredPartners?.count || '0')
      
      const conversionRate = totalClicks > 0 ? (totalDirectConversions / totalClicks) * 100 : 0
      const totalEarnings = directEarnings + referralEarnings

      return {
        // 基本統計
        totalClicks,
        totalConversions: totalDirectConversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        
        // 佣金統計 (增強版)
        directEarnings: Math.round(directEarnings * 100) / 100,
        referralEarnings: Math.round(referralEarnings * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        
        // 推薦制統計
        totalReferrals,
        referralConversions: totalReferralConversions,
        
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
}