import { model } from "@medusajs/framework/utils"

const AffiliateClick = model.define("affiliate_click", {
  id: model.id().primaryKey(),
  affiliate_code: model.text(),
  product_id: model.text().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  referrer_url: model.text().nullable(),
  session_id: model.text().nullable(),
  converted: model.boolean().default(false),
})
export default AffiliateClick
