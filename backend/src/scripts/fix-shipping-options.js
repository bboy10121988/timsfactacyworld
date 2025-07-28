import { Modules } from "@medusajs/utils"

export default async function fixShippingOptions({ container }) {
  const logger = container.resolve("logger")
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("🔧 修正運送選項價格設定...")

  try {
    // 1. 獲取台幣區域
    const regions = await regionModuleService.listRegions({})
    const twRegion = regions.find(r => r.currency_code === 'twd')
    
    if (!twRegion) {
      logger.error("❌ 沒有找到台幣區域！")
      return
    }

    logger.info(`✅ 找到台幣區域: ${twRegion.name} (${twRegion.id})`)

    // 2. 獲取所有運送選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    logger.info(`📦 找到 ${shippingOptions.length} 個運送選項`)

    // 3. 為每個運送選項設定價格
    const priceData = [
      {
        name: "標準宅配",
        amount: 80,
        type: "flat_rate"
      },
      {
        name: "快速宅配", 
        amount: 150,
        type: "flat_rate"
      },
      {
        name: "超商取貨",
        amount: 60,
        type: "flat_rate"
      }
    ]

    for (let i = 0; i < shippingOptions.length; i++) {
      const option = shippingOptions[i]
      const pricing = priceData[i] || priceData[0] // 預設使用第一個價格

      logger.info(`🔄 更新運送選項: ${option.name}`)

      try {
        // 創建價格記錄而不是直接更新運送選項
        // 使用 createShippingOptionPrices 來為運送選項設定價格
        const priceInput = {
          amount: pricing.amount,
          currency_code: twRegion.currency_code,
          min_quantity: 1,
          max_quantity: null
        }

        // 嘗試為運送選項創建價格
        await fulfillmentModuleService.createShippingOptionPrices([{
          shipping_option_id: option.id,
          ...priceInput
        }])

        logger.info(`✅ 成功為 ${option.name} 設定價格: NT$${pricing.amount}`)

      } catch (updateError) {
        logger.error(`❌ 為 ${option.name} 設定價格失敗:`, updateError.message)
        
        // 嘗試備用方法：檢查價格是否已存在
        try {
          const existingPrices = await fulfillmentModuleService.listShippingOptionPrices({
            shipping_option_id: option.id
          })
          
          if (existingPrices.length > 0) {
            logger.info(`ℹ️  ${option.name} 已有價格設定: ${existingPrices[0].amount}`)
          } else {
            logger.warn(`⚠️  ${option.name} 沒有價格設定且無法添加`)
          }
        } catch (priceCheckError) {
          logger.error(`❌ 檢查 ${option.name} 價格時失敗:`, priceCheckError.message)
        }
      }
    }

    // 4. 檢查更新結果
    const updatedOptions = await fulfillmentModuleService.listShippingOptions({})
    logger.info("\n📋 更新後的運送選項:")
    
    for (const option of updatedOptions) {
      logger.info(`- ${option.name}`)
      logger.info(`  ID: ${option.id}`)
      logger.info(`  價格類型: ${option.price_type}`)
      logger.info(`  金額: ${option.amount}`)
      logger.info(`  服務區域: ${option.service_zone_id}`)
    }

    logger.info("\n✅ 運送選項修正完成！")

  } catch (error) {
    logger.error("❌ 修正運送選項時發生錯誤:", error)
  }
}
