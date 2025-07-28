const { Modules } = require("@medusajs/utils")

export default async function checkShippingOptions({ container }) {
  const logger = container.resolve("logger")
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("🔍 檢查當前運送選項設定...")

  try {
    // 1. 檢查所有運送選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    logger.info(`📦 找到 ${shippingOptions.length} 個運送選項:`)
    
    for (const option of shippingOptions) {
      logger.info(`- ${option.name} (${option.id})`)
      logger.info(`  Provider: ${option.provider_id}`)
      logger.info(`  Service Zone: ${option.service_zone_id}`)
      
      // 檢查價格設定
      if (option.prices) {
        logger.info(`  價格設定:`)
        for (const price of option.prices) {
          logger.info(`    - ${price.currency_code || '無貨幣'}: ${price.amount}`)
        }
      }
    }

    // 2. 檢查區域設定
    const regions = await regionModuleService.listRegions({})
    logger.info(`🌍 找到 ${regions.length} 個區域:`)
    
    for (const region of regions) {
      logger.info(`- ${region.name} (${region.id})`)
      logger.info(`  貨幣: ${region.currency_code}`)
    }

    // 3. 檢查台幣區域的運送選項
    const twRegion = regions.find(r => r.currency_code === 'twd')
    if (!twRegion) {
      logger.error("❌ 沒有找到台幣區域！")
      return
    }

    logger.info(`💰 台幣區域: ${twRegion.name} (${twRegion.id})`)

    // 4. 檢查是否有適用於台幣區域的運送選項
    const twShippingOptions = shippingOptions.filter(option => 
      option.prices?.some(price => price.currency_code === 'twd' || price.region_id === twRegion.id)
    )

    logger.info(`🚚 適用於台幣區域的運送選項: ${twShippingOptions.length} 個`)
    
    if (twShippingOptions.length === 0) {
      logger.error("❌ 沒有找到適用於台幣區域的運送選項！")
      logger.info("🔧 需要創建或更新運送選項以支援台幣")
    } else {
      for (const option of twShippingOptions) {
        logger.info(`✅ ${option.name}`)
      }
    }

  } catch (error) {
    logger.error("❌ 檢查運送選項時發生錯誤:", error)
  }
}
