import { 
  OrderDTO,
} from "@medusajs/framework/types"
import AffiliateModuleService from "../modules/affiliate/service"
import { AFFILIATE_MODULE } from "../modules/affiliate"

export default async function handleOrderPlaced({
  event: { data },
  container,
}: any) {
  
  const affiliateModuleService: AffiliateModuleService = container.resolve(
    AFFILIATE_MODULE
  )

  try {
    // 獲取訂單詳細資訊
    const query = container.resolve("query")
    
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "total",
        "customer_id",
        "cart.*",
        "cart.metadata",
      ],
      filters: {
        id: data.id,
      },
    })

    if (!orders || orders.length === 0) {
      console.log("Order not found:", data.id)
      return
    }

    const order = orders[0] as OrderDTO & { 
      cart?: { metadata?: { referral_code?: string } } 
    }

    // 檢查訂單是否有聯盟推薦代碼
    const referralCode = order.cart?.metadata?.referral_code

    if (!referralCode) {
      console.log("No referral code found for order:", order.id)
      return
    }

    console.log(`🎯 Processing affiliate referral for order ${order.id} with code: ${referralCode}`)

    // 找到相關的推薦記錄
    const referrals = await affiliateModuleService.listAffiliateReferrals({
      referral_code: referralCode,
      status: "pending"
    })

    if (referrals && referrals.length > 0) {
      const referral = referrals[0]
      
      // 獲取聯盟夥伴資訊以確定佣金比率
      const partners = await affiliateModuleService.listAffiliatePartners({
        id: referral.affiliate_partner_id
      })

      if (partners && partners.length > 0) {
        const partner = partners[0]
        const orderTotal = parseInt(order.total.toString()) || 0
        
        // 根據夥伴的佣金設定計算佣金
        let commissionAmount = 0
        if (partner.commission_type === "percentage") {
          commissionAmount = Math.round(orderTotal * (partner.commission_rate || 0.05))
        } else if (partner.commission_type === "fixed") {
          commissionAmount = partner.commission_rate || 0
        }

        console.log(`💰 Calculating commission: Order total: ${orderTotal}, Rate: ${partner.commission_rate}, Type: ${partner.commission_type}, Commission: ${commissionAmount}`)

        // 確認推薦轉換
        const result = await affiliateModuleService.confirmReferralConversion({
          referral_id: referral.id,
          order_id: order.id,
          order_total: orderTotal,
          commission_amount: commissionAmount,
        })

        // 更新夥伴的總收益統計
        await affiliateModuleService.updateAffiliatePartner(partner.id, {
          total_earnings: (partner.total_earnings || 0) + commissionAmount,
          pending_earnings: (partner.pending_earnings || 0) + commissionAmount,
          total_referrals: (partner.total_referrals || 0) + 1
        })

        console.log(`✅ Affiliate referral confirmed and partner stats updated:`, result)
      } else {
        console.log(`⚠️ Affiliate partner not found for referral: ${referral.affiliate_partner_id}`)
      }
    } else {
      console.log(`⚠️ No valid affiliate referral found for code: ${referralCode}`)
    }

  } catch (error) {
    console.error("Error processing affiliate referral:", error)
  }
}

export const config = {
  event: "order.placed",
}
