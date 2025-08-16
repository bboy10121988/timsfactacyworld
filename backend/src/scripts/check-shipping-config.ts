import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function checkShippingConfig({ container }: ExecArgs) {
  console.log("🔍 檢查配送選項配置...")

  try {
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    console.log("\n1. 📦 配送選項列表:")
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    shippingOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.name}`)
      console.log(`      ID: ${option.id}`)
      console.log(`      Provider: ${option.provider_id}`)
      console.log(`      Service Zone: ${option.service_zone_id}`)
      console.log(`      Price Type: ${option.price_type}`)
      console.log(`      Type: ${JSON.stringify(option.type, null, 2)}`)
      console.log("      ---")
    })

    console.log("\n2. 🌏 服務區域列表:")
    const serviceZones = await fulfillmentModuleService.listServiceZones({})
    serviceZones.forEach((zone, index) => {
      console.log(`   ${index + 1}. ${zone.name} (${zone.id})`)
    })

    console.log("\n3. 📋 配送方案列表:")
    const profiles = await fulfillmentModuleService.listShippingProfiles({})
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name} (${profile.id})`)
      console.log(`      Type: ${profile.type}`)
    })

    console.log("\n4. 🚚 履約提供者列表:")
    const providers = await fulfillmentModuleService.listFulfillmentProviders({})
    providers.forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.id}`)
      console.log(`      Is Enabled: ${provider.is_enabled}`)
    })

    console.log("\n5. 📍 庫存位置列表:")
    const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
    const locations = await stockLocationService.listStockLocations({})
    locations.forEach((location, index) => {
      console.log(`   ${index + 1}. ${location.name} (${location.id})`)
      console.log(`      Address: ${location.address?.address_1}, ${location.address?.city}`)
    })

    console.log("\n✅ 配送配置檢查完成！")
    
  } catch (error) {
    console.error("❌ 檢查過程中發生錯誤:", error)
  }
}
