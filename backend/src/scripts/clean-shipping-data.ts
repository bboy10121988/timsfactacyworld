import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function cleanShippingData({ 
  container 
}: ExecArgs) {
  console.log("開始清理運輸相關資料...")

  try {
    // 獲取模組服務
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
    
    console.log("1. 列出並刪除所有運輸選項...")
    
    // 清理運輸選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions()
    console.log(`找到 ${shippingOptions.length} 個運輸選項`)
    
    for (const option of shippingOptions) {
      try {
        await fulfillmentModuleService.deleteShippingOptions([option.id])
        console.log(`✓ 已刪除運輸選項: ${option.name} (${option.id})`)
      } catch (error) {
        console.log(`✗ 刪除運輸選項失敗 ${option.id}:`, error.message)
      }
    }

    console.log("2. 列出並刪除運輸配置檔案...")
    
    // 清理運輸配置檔案
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles()
    console.log(`找到 ${shippingProfiles.length} 個運輸配置檔案`)
    
    for (const profile of shippingProfiles) {
      // 保留預設配置檔案
      if (profile.name !== "default" && profile.name !== "Default") {
        try {
          await fulfillmentModuleService.deleteShippingProfiles([profile.id])
          console.log(`✓ 已刪除運輸配置檔案: ${profile.name} (${profile.id})`)
        } catch (error) {
          console.log(`✗ 刪除運輸配置檔案失敗 ${profile.id}:`, error.message)
        }
      } else {
        console.log(`⚪ 保留預設配置檔案: ${profile.name}`)
      }
    }

    console.log("3. 列出並清理服務區域...")
    
    // 清理服務區域
    const serviceZones = await fulfillmentModuleService.listServiceZones()
    console.log(`找到 ${serviceZones.length} 個服務區域`)
    
    for (const zone of serviceZones) {
      try {
        await fulfillmentModuleService.deleteServiceZones([zone.id])
        console.log(`✓ 已刪除服務區域: ${zone.name} (${zone.id})`)
      } catch (error) {
        console.log(`✗ 刪除服務區域失敗 ${zone.id}:`, error.message)
      }
    }

    console.log("4. 列出並清理履行提供者...")
    
    // 清理履行提供者（保留預設的）
    const fulfillmentProviders = await fulfillmentModuleService.listFulfillmentProviders()
    console.log(`找到 ${fulfillmentProviders.length} 個履行提供者`)
    
    for (const provider of fulfillmentProviders) {
      // 保留手動履行提供者
      if (provider.id !== "manual" && provider.id !== "manual_fulfillment") {
        try {
          await fulfillmentModuleService.deleteFulfillmentProviders([provider.id])
          console.log(`✓ 已刪除履行提供者: ${provider.id}`)
        } catch (error) {
          console.log(`✗ 刪除履行提供者失敗 ${provider.id}:`, error.message)
        }
      } else {
        console.log(`⚪ 保留預設履行提供者: ${provider.id}`)
      }
    }

    console.log("5. 列出並清理庫存位置（保留預設）...")
    
    // 清理庫存位置
    const stockLocations = await stockLocationModuleService.listStockLocations()
    console.log(`找到 ${stockLocations.length} 個庫存位置`)
    
    for (const location of stockLocations) {
      // 保留預設庫存位置
      if (location.name !== "Default Location" && 
          location.name !== "預設位置" && 
          location.name !== "Main Warehouse") {
        try {
          await stockLocationModuleService.deleteStockLocations([location.id])
          console.log(`✓ 已刪除庫存位置: ${location.name} (${location.id})`)
        } catch (error) {
          console.log(`✗ 刪除庫存位置失敗 ${location.id}:`, error.message)
        }
      } else {
        console.log(`⚪ 保留預設庫存位置: ${location.name}`)
      }
    }

    console.log("\n✅ 運輸資料清理完成！")
    console.log("📋 清理摘要:")
    console.log("- 運輸選項: 已全部清理")
    console.log("- 運輸配置檔案: 保留預設，清理其他")
    console.log("- 服務區域: 已全部清理")
    console.log("- 履行提供者: 保留 manual，清理其他")
    console.log("- 庫存位置: 保留預設，清理其他")
    console.log("\n建議接下來:")
    console.log("1. 重新啟動 Medusa 服務")
    console.log("2. 透過管理面板重新設定運輸選項")
    console.log("3. 確認庫存位置和配送設定正常顯示")

  } catch (error) {
    console.error("❌ 清理過程中發生錯誤:", error)
    throw error
  }
}
