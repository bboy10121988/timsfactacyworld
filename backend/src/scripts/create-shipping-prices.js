import { Modules } from "@medusajs/utils"

export default async function createShippingPrices({ container }) {
  const logger = container.resolve("logger")
  const pricingModuleService = container.resolve(Modules.PRICING)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("💰 創建運送選項價格...")

  try {
    // 1. 獲取運送選項和地區
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    const regions = await regionModuleService.listRegions({})
    
    logger.info(`📦 找到 ${shippingOptions.length} 個運送選項`)
    logger.info(`🌍 找到 ${regions.length} 個地區`)

    // 找到台灣地區
    const taiwanRegion = regions.find(r => r.currency_code === 'twd')
    if (!taiwanRegion) {
      logger.error("❌ 找不到台灣地區 (twd)")
      return
    }
    
    logger.info(`✅ 找到台灣地區: ${taiwanRegion.name} (${taiwanRegion.id})`)

    // 2. 定義價格資料
    const priceData = {
      "標準宅配": 80,
      "快速宅配": 150,
      "超商取貨": 60
    }

    // 3. 為每個運送選項創建價格
    for (const option of shippingOptions) {
      const amount = priceData[option.name] || 100

      logger.info(`\n💸 為 ${option.name} 創建價格 NT$${amount}`)

      try {
        // 創建價格集
        const priceSet = await pricingModuleService.createPriceSets({
          rules: [
            {
              rule_type: "shipping_option",
            }
          ]
        })

        logger.info(`✅ 創建價格集: ${priceSet.id}`)

        // 創建價格
        const price = await pricingModuleService.createPrices({
          amount: amount * 100, // 轉換為分
          currency_code: "twd",
          price_set_id: priceSet.id,
          rules: {
            shipping_option_id: option.id,
            region_id: taiwanRegion.id
          }
        })

        logger.info(`✅ 創建價格: ${price.id}`)

      } catch (priceError) {
        logger.error(`❌ 為 ${option.name} 創建價格失敗:`, priceError.message)
        
        // 嘗試簡化的方法
        try {
          await pricingModuleService.createPrices({
            amount: amount * 100,
            currency_code: "twd",
            rules: {
              shipping_option_id: option.id
            }
          })
          logger.info(`✅ 使用簡化方法成功創建 ${option.name} 的價格`)
        } catch (altError) {
          logger.error(`❌ 簡化方法也失敗:`, altError.message)
        }
      }
    }

    // 4. 檢查創建的價格
    logger.info("\n📋 檢查創建的價格...")
    const allPrices = await pricingModuleService.listPrices({})
    logger.info(`💰 總價格記錄數: ${allPrices.length}`)

    const shippingPrices = allPrices.filter(p => 
      p.rules && p.rules.some(r => r.rule_type === 'shipping_option_id')
    )
    
    logger.info(`🚚 運送相關價格: ${shippingPrices.length} 個`)

    for (const price of shippingPrices) {
      logger.info(`  - 價格 ${price.id}: ${price.amount/100} ${price.currency_code}`)
      logger.info(`    規則: ${JSON.stringify(price.rules)}`)
    }

    logger.info("\n✅ 運送價格創建完成！")

  } catch (error) {
    logger.error("❌ 創建運送價格時發生錯誤:", error)
  }
}
