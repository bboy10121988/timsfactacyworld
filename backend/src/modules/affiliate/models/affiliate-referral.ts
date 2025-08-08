import { model } from "@medusajs/framework/utils"

/**
 * 聯盟推薦記錄模型
 */
const AffiliateReferral = model.define("affiliate_referral", {
  id: model.id().primaryKey(),
  
  // 關聯
  affiliate_partner_id: model.text(),
  order_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  
  // 推薦資訊
  referral_code: model.text(),
  clicked_at: model.dateTime(),
  converted_at: model.dateTime().nullable(),
  
  // 訂單資訊
  order_total: model.number().nullable(),
  commission_amount: model.number().nullable(),
  commission_rate: model.number().nullable(),
  
  // 狀態
  status: model.enum(["pending", "confirmed", "paid", "cancelled"]).default("pending"),
  
  // 追蹤資訊
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  referrer_url: model.text().nullable(),
  landing_page: model.text().nullable(),
  
  // 付款資訊
  paid_at: model.dateTime().nullable(),
  payment_reference: model.text().nullable(),
})

export default AffiliateReferral
