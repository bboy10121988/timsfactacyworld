import { Modules } from "@medusajs/utils"

export default async function checkRegions({ container }) {
  const logger = container.resolve("logger")
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("🌍 檢查所有地區...")

  try {
    const regions = await regionModuleService.listRegions({})
    
    logger.info(`📍 找到 ${regions.length} 個地區:`)
    
    for (const region of regions) {
      logger.info(`\n- 地區: ${region.name}`)
      logger.info(`  ID: ${region.id}`)
      logger.info(`  貨幣: ${region.currency_code}`)
      logger.info(`  所有屬性: ${Object.keys(region).join(', ')}`)
      
      // 如果有國家資訊
      if (region.countries) {
        logger.info(`  國家: ${region.countries.map(c => c.name || c.iso_2).join(', ')}`)
      }
    }

  } catch (error) {
    logger.error("❌ 檢查地區時發生錯誤:", error)
  }
}
