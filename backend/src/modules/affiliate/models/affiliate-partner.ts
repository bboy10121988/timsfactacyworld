import { model } from "@medusajs/framework/utils"

/**
 * 聯盟夥伴模型
 */
const AffiliatePartner = model.define("affiliate_partner", {
  id: model.id().primaryKey(),
  
  // 基本資訊
  email: model.text().unique(),
  name: model.text(),
  password: model.text(), // 密碼欄位
  company: model.text().nullable(),
  phone: model.text().nullable(),
  
  // 聯盟代碼
  affiliate_code: model.text().unique(),
  referral_link: model.text().nullable(),
  
  // 佣金設定
  commission_rate: model.number().default(0.05), // 5%
  commission_type: model.enum(["percentage", "fixed"]).default("percentage"),
  min_payout_amount: model.number().default(1000), // 最低提領金額 NT$1000
  
  // 狀態
  status: model.enum(["pending", "active", "rejected", "suspended", "terminated"]).default("pending"),
  approved_at: model.dateTime().nullable(),
  rejection_reason: model.text().nullable(), // 拒絕原因
  
  // 帳戶資訊
  bank_account: model.text().nullable(),
  bank_code: model.text().nullable(),
  account_holder: model.text().nullable(),
  
  // 追蹤
  total_earnings: model.number().default(0),
  paid_earnings: model.number().default(0),
  pending_earnings: model.number().default(0),
  total_referrals: model.number().default(0),
})

export default AffiliatePartner
