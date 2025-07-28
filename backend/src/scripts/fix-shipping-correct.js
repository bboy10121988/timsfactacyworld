import { Modules } from "@medusajs/utils"

export default async function fixShippingOptionsCorrect({ container }) {
  const logger = container.resolve("logger")
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("🔧 正確修正運送選項...")

  try {
    // 1. 獲取所有運送選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    logger.info(`📦 找到 ${shippingOptions.length} 個運送選項`)

    // 2. 定義價格資料
    const priceData = {
      "標準宅配": 80,
      "快速宅配": 150,
      "超商取貨": 60
    }

    // 3. 使用 updateShippingOptions 方法正確更新
    for (const option of shippingOptions) {
      const amount = priceData[option.name] || 100 // 預設價格

      logger.info(`🔄 更新運送選項: ${option.name}`)

      try {
        await fulfillmentModuleService.updateShippingOptions({
          id: option.id,
          price_type: "flat",
          data: {
            amount: amount
          }
        })

        logger.info(`✅ 成功更新 ${option.name} - 價格: NT$${amount}`)

      } catch (updateError) {
        logger.error(`❌ 更新 ${option.name} 失敗:`, updateError.message)
        
        // 嘗試使用不同的方法
        try {
          await fulfillmentModuleService.updateShippingOptions_(
            option.id,
            {
              price_type: "flat",
              data: {
                amount: amount
              }
            }
          )
          logger.info(`✅ 使用備用方法成功更新 ${option.name}`)
        } catch (altError) {
          logger.error(`❌ 備用方法也失敗:`, altError.message)
        }
      }
    }

    // 4. 檢查更新結果
    logger.info("\n📋 檢查更新結果...")
    const updatedOptions = await fulfillmentModuleService.listShippingOptions({})
    
    for (const option of updatedOptions) {
      logger.info(`\n- ${option.name} (${option.id})`)
      logger.info(`  價格類型: ${option.price_type}`)
      logger.info(`  資料: ${JSON.stringify(option.data)}`)
      logger.info(`  Metadata: ${JSON.stringify(option.metadata)}`)
    }

    logger.info("\n✅ 運送選項修正完成！")

  } catch (error) {
    logger.error("❌ 修正運送選項時發生錯誤:", error)
  }
}
