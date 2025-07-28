import { Modules } from "@medusajs/utils"

export default async function analyzePricesSystem({ container }) {
  const logger = container.resolve("logger")
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("🔍 分析價格系統...")

  try {
    // 1. 獲取運送選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    
    for (const option of shippingOptions) {
      logger.info(`\n📦 分析運送選項: ${option.name}`)
      
      try {
        // 2. 嘗試計算價格
        const context = {
          cart_id: "test",
          shipping_option_id: option.id,
          data: {
            amount: 100 // 測試金額
          }
        }
        
        const prices = await fulfillmentModuleService.calculateShippingOptionsPrices({
          id: option.id,
          context: context
        })
        
        logger.info(`  ✅ 價格計算結果:`, JSON.stringify(prices, null, 2))
        
      } catch (priceError) {
        logger.info(`  ❌ 價格計算失敗: ${priceError.message}`)
      }
      
      // 3. 檢查運送選項類型
      try {
        const typeInfo = await fulfillmentModuleService.retrieveFulfillmentOptions(option.id)
        logger.info(`  🔧 履行選項:`, JSON.stringify(typeInfo, null, 2))
      } catch (typeError) {
        logger.info(`  ❌ 無法取得履行選項: ${typeError.message}`)
      }
    }

    // 4. 查看有沒有其他價格相關的方法
    logger.info("\n🔍 檢查是否有價格相關的表格或服務...")
    
    // 查看 price module
    try {
      const priceModuleService = container.resolve(Modules.PRICING)
      if (priceModuleService) {
        logger.info("✅ 找到 Pricing Module")
        
        const prices = await priceModuleService.listPrices({})
        logger.info(`📊 價格記錄數量: ${prices.length}`)
        
        if (prices.length > 0) {
          logger.info("📋 前 3 個價格記錄:")
          for (let i = 0; i < Math.min(3, prices.length); i++) {
            logger.info(`  ${JSON.stringify(prices[i], null, 2)}`)
          }
        }
      }
    } catch (priceError) {
      logger.info("❌ 無法存取 Pricing Module:", priceError.message)
    }

  } catch (error) {
    logger.error("❌ 分析價格系統時發生錯誤:", error)
  }
}
