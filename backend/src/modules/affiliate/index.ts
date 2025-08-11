import { Module } from "@medusajs/framework/utils"
import AffiliateMinimalService from "./services/affiliate-minimal"

export const AFFILIATE_MODULE = "affiliate"

export default Module(AFFILIATE_MODULE, {
  service: AffiliateMinimalService,
})