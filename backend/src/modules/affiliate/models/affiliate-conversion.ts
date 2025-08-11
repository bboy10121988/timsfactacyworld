import { model } from "@medusajs/framework/utils"

export enum ConversionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  PAID = "paid"
}

const AffiliateConversion = model.define("affiliate_conversion", {
  id: model.id().primaryKey(),
  affiliate_code: model.text(),
  order_id: model.text(),
  order_total: model.bigNumber(),
  commission_rate: model.bigNumber(),
  commission_amount: model.bigNumber(),
  status: model.enum(ConversionStatus).default(ConversionStatus.PENDING),
  click_id: model.text().nullable(),
  paid_at: model.dateTime().nullable(),
  payment_reference: model.text().nullable(),
})
export default AffiliateConversion
