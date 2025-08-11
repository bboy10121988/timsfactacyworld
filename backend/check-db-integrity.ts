import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function checkDatabaseIntegrity({ container }) {
  console.log("🔍 檢查資料庫完整性...")
  
  try {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    console.log("\n📊 檢查關鍵資料表...")
    
    // 檢查銷售渠道
    const salesChannels = await remoteQuery({
      entryPoint: "sales_channel",
      fields: ["id", "name", "description", "is_disabled"],
    })
    console.log(`✅ Sales Channels: ${salesChannels.length} 條記錄`)
    
    // 檢查庫存地點
    const stockLocations = await remoteQuery({
      entryPoint: "stock_location",
      fields: ["id", "name", "address"],
    })
    console.log(`✅ Stock Locations: ${stockLocations.length} 條記錄`)
    
    // 檢查地區
    const regions = await remoteQuery({
      entryPoint: "region",
      fields: ["id", "name", "currency_code"],
    })
    console.log(`✅ Regions: ${regions.length} 條記錄`)
    
    // 檢查配送選項  
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "price_type", "amount", "region_id", "provider_id"],
    })
    console.log(`✅ Shipping Options: ${shippingOptions.length} 條記錄`)
    
    console.log("\n🚚 配送選項詳情:")
    shippingOptions.forEach(option => {
      console.log(`  - ${option.name}: ${option.price_type}, 金額: ${option.amount || 'N/A'}`)
    })
    
    // 檢查銷售渠道與庫存地點的關聯
    const salesChannelsWithStockLocations = await remoteQuery({
      entryPoint: "sales_channel",
      fields: ["id", "name", "stock_locations.*"],
    })
    
    console.log("\n🔗 Sales Channel - Stock Location 關聯:")
    salesChannelsWithStockLocations.forEach(sc => {
      console.log(`Sales Channel "${sc.name}":`)
      if (sc.stock_locations && sc.stock_locations.length > 0) {
        sc.stock_locations.forEach(loc => {
          console.log(`  - Stock Location: ${loc?.name || 'NULL'} (ID: ${loc?.id || 'NULL'})`)
        })
      } else {
        console.log(`  ⚠️  沒有關聯的 Stock Locations`)
      }
    })
    
    // 如果沒有任何資料，建議初始化資料庫
    if (salesChannels.length === 0 || stockLocations.length === 0 || shippingOptions.length === 0) {
      console.log("\n⚠️  警告: 資料庫中缺少基本資料")
      console.log("建議執行以下命令來初始化資料庫：")
      console.log("npm run seed")
    }
    
    console.log("\n✅ 資料庫完整性檢查完成")
    
  } catch (error) {
    console.error("❌ 檢查資料庫時發生錯誤:", error)
    console.error("錯誤堆疊:", error.stack)
    throw error
  }
}

// checkDatabaseIntegrity() // 這需要在有 container 的環境中呼叫
