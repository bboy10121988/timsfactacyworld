import { MedusaService } from "@medusajs/framework/utils"
import AffiliatePartner from "./models/affiliate-partner"
import AffiliateReferral from "./models/affiliate-referral"
import AffiliatePayment from "./models/affiliate-payment"

class AffiliateModuleService extends MedusaService({
  AffiliatePartner,
  AffiliateReferral,
  AffiliatePayment,
}) {
  
  async createAffiliatePartner(data: {
    email: string
    name: string
    password: string
    company?: string
    phone?: string
    commission_rate?: number
    commission_type?: "percentage" | "fixed"
  }) {
    const affiliateCode = this.generateAffiliateCode()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
    const referralLink = `${baseUrl}?ref=${affiliateCode}`
    
    return await this.createAffiliatePartners({
      ...data,
      affiliate_code: affiliateCode,
      referral_link: referralLink,
      status: "pending",
    })
  }

  async updateAffiliatePartner(partnerId: string, data: any) {
    return await this.updateAffiliatePartners({
      selector: { id: partnerId },
      data: data
    })
  }

  async getPartnerStats(partnerId: string) {
    const referrals = await this.listAffiliateReferrals({
      affiliate_partner_id: partnerId,
    })

    return {
      totalReferrals: referrals.length,
      confirmedReferrals: referrals.filter(r => r.status === "confirmed").length,
      thisMonthReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
    }
  }

  async trackReferralClick(data: {
    affiliate_partner_id: string
    referral_code: string
    ip_address?: string
    user_agent?: string
    referrer_url?: string
  }) {
    return await this.createAffiliateReferrals({
      ...data,
      clicked_at: new Date(),
      status: "pending"
    })
  }

  async confirmReferralConversion(data: {
    referral_id: string
    order_id: string
    order_total: number
    commission_amount: number
  }) {
    return await this.updateAffiliateReferrals({
      selector: { id: data.referral_id },
      data: {
        order_id: data.order_id,
        order_total: data.order_total,
        commission_amount: data.commission_amount,
        converted_at: new Date(),
        status: "confirmed"
      }
    })
  }

  private generateAffiliateCode(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    return `AF${timestamp.slice(-6)}${random}`.toUpperCase()
  }
}

export default AffiliateModuleService
