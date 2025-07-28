import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow
} from "@medusajs/framework/workflows"

export default async function setupBasicShipping({ 
  container 
}: ExecArgs) {
  console.log("開始設置基本運輸配置...")

  try {
    // 獲取模組服務
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const regionModuleService = container.resolve(Modules.REGION)

    console.log("1. 創建基本庫存位置...")
    
    // 創建主要倉庫
    const { result: stockLocations } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "主要倉庫",
            address: {
              address_1: "台北市信義區",
              city: "台北市",
              country_code: "tw",
              postal_code: "110"
            }
          }
        ]
      }
    })

    const mainWarehouse = stockLocations[0]
    console.log(`✓ 創建庫存位置: ${mainWarehouse.name} (${mainWarehouse.id})`)

    console.log("2. 創建運輸配置檔案...")
    
    // 創建預設運輸配置檔案
    const { result: shippingProfiles } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "預設運輸配置",
            type: "default"
          }
        ]
      }
    })

    const defaultProfile = shippingProfiles[0]
    console.log(`✓ 創建運輸配置檔案: ${defaultProfile.name} (${defaultProfile.id})`)

    console.log("3. 連結銷售渠道與庫存位置...")
    
    // 獲取預設銷售渠道
    const salesChannels = await salesChannelModuleService.listSalesChannels()
    const defaultSalesChannel = salesChannels.find(sc => sc.name === "Default Sales Channel")
    
    if (defaultSalesChannel) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
          id: mainWarehouse.id,
          add: [defaultSalesChannel.id]
        }
      })
      console.log(`✓ 連結銷售渠道與倉庫: ${defaultSalesChannel.name} → ${mainWarehouse.name}`)
    }

    console.log("4. 獲取地區資訊...")
    
    // 獲取台灣地區
    const regions = await regionModuleService.listRegions()
    const taiwanRegion = regions.find(r => r.name === "台灣" || r.name === "Taiwan")
    
    if (!taiwanRegion) {
      console.log("❌ 找不到台灣地區，請先在管理面板建立地區")
      return
    }

    console.log(`✓ 找到地區: ${taiwanRegion.name} (${taiwanRegion.id})`)

    console.log("5. 創建基本運輸選項...")
    
    // 創建基本運輸選項
    const shippingOptionsData = [
      {
        name: "標準宅配",
        service_zone: {
          name: "台灣地區",
          geo_zones: [
            {
              type: "country" as const,
              country_code: "tw"
            }
          ]
        },
        shipping_profile_id: defaultProfile.id,
        provider_id: "manual",
        price_type: "flat" as const,
        type: {
          label: "Standard",
          description: "5-7 個工作天",
          code: "standard"
        },
        prices: [
          {
            currency_code: "twd",
            amount: 8000 // 80 TWD
          }
        ]
      },
      {
        name: "快速宅配",
        service_zone: {
          name: "台灣地區",
          geo_zones: [
            {
              type: "country" as const,
              country_code: "tw"
            }
          ]
        },
        shipping_profile_id: defaultProfile.id,
        provider_id: "manual",
        price_type: "flat" as const,
        type: {
          label: "Express",
          description: "1-3 個工作天",
          code: "express"
        },
        prices: [
          {
            currency_code: "twd",
            amount: 15000 // 150 TWD
          }
        ]
      }
    ]

    const { result: shippingOptions } = await createShippingOptionsWorkflow(container).run({
      input: {
        data: shippingOptionsData
      }
    })

    shippingOptions.forEach(option => {
      console.log(`✓ 創建運輸選項: ${option.name} (${option.id})`)
    })

    console.log("\n✅ 基本運輸配置設置完成！")
    console.log("📋 設置摘要:")
    console.log(`- 庫存位置: ${mainWarehouse.name}`)
    console.log(`- 運輸配置檔案: ${defaultProfile.name}`)
    console.log(`- 運輸選項: ${shippingOptions.length} 個`)
    console.log("\n💡 建議：")
    console.log("1. 重新啟動 Medusa 服務")
    console.log("2. 檢查管理面板中的庫存位置和配送設定")
    console.log("3. 確認渲染問題是否已解決")

  } catch (error) {
    console.error("❌ 設置過程中發生錯誤:", error)
    throw error
  }
}
