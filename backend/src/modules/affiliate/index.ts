import { Module } from "@medusajs/framework/utils"
import AffiliateService from "./services/affiliate-clean"

export const AFFILIATE_MODULE = "affiliate"

export default Module(AFFILIATE_MODULE, {
  service: AffiliateService,
})