import { model } from "@medusajs/framework/utils"

/**
 * 聯盟佣金支付記錄模型
 */
const AffiliatePayment = model.define("affiliate_payment", {
  id: model.id().primaryKey(),
  
  // 關聯
  affiliate_partner_id: model.text(),
  
  // 支付資訊
  amount: model.number(),
  currency: model.text().default("TWD"),
  payment_method: model.enum(["bank_transfer", "paypal", "stripe"]).default("bank_transfer"),
  
  // 包含的推薦訂單
  referral_ids: model.json(), // Array of referral IDs
  period_start: model.dateTime(),
  period_end: model.dateTime(),
  
  // 狀態
  status: model.enum(["pending", "processing", "completed", "failed"]).default("pending"),
  
  // 銀行資訊
  bank_account: model.text().nullable(),
  bank_code: model.text().nullable(),
  account_holder: model.text().nullable(),
  
  // 處理資訊
  processed_at: model.dateTime().nullable(),
  payment_reference: model.text().nullable(),
  failure_reason: model.text().nullable(),
  
  // 備註
  notes: model.text().nullable(),
})

export default AffiliatePayment
