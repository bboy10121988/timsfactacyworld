import { model } from "@medusajs/framework/utils"

export const AffiliateClick = model.define("affiliate_click", {
  id: model.id().primaryKey(),
  affiliate_code: model.text(),
  product_id: model.text().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  referrer_url: model.text().nullable(),
  session_id: model.text().nullable(),
  converted: model.boolean().default(false),
  created_at: model.dateTime(),
})

// 定義關聯
export const affiliateClickRelations = model.define("affiliate_click_relations", {
  affiliate_partner: model.belongsTo(() => require("./affiliate-partner").AffiliatePartner, {
    foreignKey: "affiliate_code",
    referencedKey: "affiliate_code"
  }),
})
