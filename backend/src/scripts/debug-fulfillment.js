import { Modules } from "@medusajs/utils"

export default async function debugFulfillmentModule({ container }) {
  const logger = container.resolve("logger")
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("🔍 檢查 Fulfillment Module 可用方法...")

  try {
    // 輸出所有可用方法
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(fulfillmentModuleService))
      .filter(name => typeof fulfillmentModuleService[name] === 'function')
      .sort()

    logger.info("📋 Fulfillment Module 可用方法:")
    methods.forEach(method => {
      if (!method.startsWith('_') && method !== 'constructor') {
        logger.info(`  - ${method}`)
      }
    })

    // 嘗試獲取運送選項的詳細資訊
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})

    logger.info("\n📦 運送選項詳細資訊:")
    for (const option of shippingOptions) {
      logger.info(`\n運送選項: ${option.name} (${option.id})`)
      logger.info(`  價格類型: ${option.price_type}`)
      logger.info(`  金額: ${option.amount}`)
      logger.info(`  服務區域: ${option.service_zone_id}`)
      logger.info(`  運送設定檔: ${option.shipping_profile_id}`)
      logger.info(`  Provider: ${option.provider_id}`)
      logger.info(`  Data: ${JSON.stringify(option.data, null, 2)}`)
      
      // 輸出所有屬性
      logger.info(`  所有屬性: ${Object.keys(option).join(', ')}`)
    }

  } catch (error) {
    logger.error("❌ 檢查時發生錯誤:", error)
  }
}
