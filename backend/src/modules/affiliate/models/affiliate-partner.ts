import { model } from "@medusajs/framework/utils"

export enum AffiliatePartnerStatus {
  PENDING = "pending",
  APPROVED = "approved", 
  REJECTED = "rejected",
  SUSPENDED = "suspended"
}

const AffiliatePartner = model.define("affiliate_partner", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text().unique(),
  password: model.text(),
  phone: model.text().nullable(),
  company: model.text().nullable(),
  affiliate_code: model.text().unique(),
  referral_link: model.text(),
  // 註冊時透過 ref 帶入的推薦人代碼（記錄誰推薦了此夥伴）
  referred_by_code: model.text().nullable(),
  status: model.enum(AffiliatePartnerStatus).default(AffiliatePartnerStatus.PENDING),
  commission_rate: model.bigNumber().default(0.08),
  website: model.text().nullable(),
  social_media: model.text().nullable(),
  address: model.text().nullable(),
  account_name: model.text().nullable(),
  bank_code: model.text().nullable(),
  account_number: model.text().nullable(),
  tax_id: model.text().nullable(),
  notes: model.text().nullable(),
  approved_at: model.dateTime().nullable(),
  approved_by: model.text().nullable(),
})

export default AffiliatePartner
