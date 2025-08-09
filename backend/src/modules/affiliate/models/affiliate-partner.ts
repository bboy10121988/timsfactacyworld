import { model } from "@medusajs/framework/utils"

export enum AffiliatePartnerStatus {
  PENDING = "pending",
  APPROVED = "approved", 
  REJECTED = "rejected",
  SUSPENDED = "suspended"
}

export const AffiliatePartner = model.define("affiliate_partner", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text().unique(),
  password: model.text(),
  phone: model.text().nullable(),
  company: model.text().nullable(),
  affiliate_code: model.text().unique(),
  referral_link: model.text(),
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
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
})

// 定義關聯
export const affiliatePartnerRelations = model.define("affiliate_partner_relations", {
  clicks: model.hasMany(() => require("./affiliate-click").AffiliateClick),
  conversions: model.hasMany(() => require("./affiliate-conversion").AffiliateConversion),
})
