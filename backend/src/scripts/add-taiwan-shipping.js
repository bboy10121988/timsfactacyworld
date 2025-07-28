const { Modules } = require("@medusajs/utils")

export default async function addTaiwanShippingOptions({ container }) {
  const logger = container.resolve("logger")
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("🚚 開始添加台幣運送選項...")

  try {
    // 1. 找到台幣區域
    const regions = await regionModuleService.listRegions({})
    const twRegion = regions.find(r => r.currency_code === 'twd')
    
    if (!twRegion) {
      logger.error("❌ 找不到台幣區域！")
      return
    }

    logger.info(`💰 找到台幣區域: ${twRegion.name} (${twRegion.id})`)

    // 2. 檢查運送資料結構
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({})
    if (!fulfillmentSets.length) {
      logger.error("❌ 找不到 fulfillment sets！")
      return
    }

    const fulfillmentSet = fulfillmentSets[0]
    logger.info(`📦 使用 fulfillment set: ${fulfillmentSet.name} (${fulfillmentSet.id})`)

    // 3. 檢查 service zones
    if (!fulfillmentSet.service_zones || !fulfillmentSet.service_zones.length) {
      logger.error("❌ 找不到 service zones！")
      return
    }

    const serviceZone = fulfillmentSet.service_zones[0]
    logger.info(`🌏 使用 service zone: ${serviceZone.name} (${serviceZone.id})`)

    // 4. 檢查 shipping profiles
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({})
    if (!shippingProfiles.length) {
      logger.error("❌ 找不到 shipping profiles！")
      return
    }

    const shippingProfile = shippingProfiles[0]
    logger.info(`📋 使用 shipping profile: ${shippingProfile.name} (${shippingProfile.id})`)

    // 5. 檢查是否已經有台幣運送選項
    const existingOptions = await fulfillmentModuleService.listShippingOptions({})
    const twOptions = existingOptions.filter(option => 
      option.prices?.some(price => price.currency_code === 'twd' || price.region_id === twRegion.id)
    )

    if (twOptions.length > 0) {
      logger.info(`✅ 已經有 ${twOptions.length} 個台幣運送選項：`)
      for (const option of twOptions) {
        logger.info(`- ${option.name} (${option.id})`)
      }
      return
    }

    logger.info("🔧 正在創建台幣運送選項...")

    // 6. 創建運送選項
    const shippingOptions = [
      {
        name: "標準宅配",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "標準宅配服務，3-5個工作天到貨",
          code: "standard-delivery",
        },
        prices: [
          {
            currency_code: "twd",
            amount: 10000, // 100 TWD (金額以分為單位)
          },
          {
            region_id: twRegion.id,
            amount: 10000,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "超商取貨",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Convenience Store",
          description: "超商門市取貨，免運費",
          code: "convenience-store",
        },
        prices: [
          {
            currency_code: "twd",
            amount: 0, // 免運費
          },
          {
            region_id: twRegion.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ]

    // 創建運送選項
    for (const optionData of shippingOptions) {
      try {
        const createdOption = await fulfillmentModuleService.createShippingOptions(optionData)
        logger.info(`✅ 成功創建運送選項: ${optionData.name} (${createdOption.id})`)
      } catch (error) {
        logger.error(`❌ 創建運送選項失敗 ${optionData.name}:`, error.message)
      }
    }

    logger.info("🎉 台幣運送選項設定完成！")

  } catch (error) {
    logger.error("❌ 設定台幣運送選項時發生錯誤:", error)
  }
}
