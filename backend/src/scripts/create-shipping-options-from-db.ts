import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function createShippingOptionsFromDB({ container }: ExecArgs) {
  console.log("開始同步資料庫中的運輸選項...")

  try {
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)

    // 檢查是否有 Manual 履約提供者
    const fulfillmentProviders = await fulfillmentModuleService.listFulfillmentProviders()
    const manualProvider = fulfillmentProviders.find(p => p.id === 'manual_manual')
    
    if (!manualProvider) {
      console.log("❌ 找不到 Manual 履約提供者")
      return
    }

    console.log(`✓ 找到履約提供者: ${manualProvider.id}`)

    // 檢查庫存位置
    const stockLocations = await stockLocationModuleService.listStockLocations({})
    if (stockLocations.length === 0) {
      console.log("❌ 找不到庫存位置")
      return
    }

    const mainLocation = stockLocations[0]
    console.log(`✓ 使用庫存位置: ${mainLocation.name} (${mainLocation.id})`)

    // 使用 Medusa SDK 來創建運輸選項
    const sdk = container.resolve("medusaSDK") as any
    
    // 創建標準宅配
    const standardDelivery = await sdk.admin.shippingOption.create({
      name: "標準宅配",
      region_id: "reg_01K17DQ7711FDNPXRATFT04HW3", // 您需要調整為實際的地區ID
      provider_id: "manual_manual",
      data: {
        id: "standard-delivery"
      },
      type: {
        label: "Standard Delivery",
        description: "3-5個工作天送達",
        code: "standard"
      },
      amount: 8000, // 80 TWD
      is_return: false
    })

    console.log(`✓ 創建標準宅配: ${standardDelivery.id}`)

    // 創建快速宅配
    const expressDelivery = await sdk.admin.shippingOption.create({
      name: "快速宅配", 
      region_id: "reg_01K17DQ7711FDNPXRATFT04HW3",
      provider_id: "manual_manual",
      data: {
        id: "express-delivery"
      },
      type: {
        label: "Express Delivery",
        description: "1-2個工作天送達",
        code: "express"
      },
      amount: 15000, // 150 TWD
      is_return: false
    })

    console.log(`✓ 創建快速宅配: ${expressDelivery.id}`)

    // 創建超商取貨
    const storePickup = await sdk.admin.shippingOption.create({
      name: "超商取貨",
      region_id: "reg_01K17DQ7711FDNPXRATFT04HW3", 
      provider_id: "manual_manual",
      data: {
        id: "store-pickup"
      },
      type: {
        label: "Store Pickup",
        description: "送至指定超商取貨",
        code: "pickup"
      },
      amount: 6000, // 60 TWD
      is_return: false
    })

    console.log(`✓ 創建超商取貨: ${storePickup.id}`)

    console.log("\n✅ 運輸選項同步完成！")
    console.log("📋 創建的選項:")
    console.log(`- 標準宅配: ${standardDelivery.name} (${standardDelivery.id})`)
    console.log(`- 快速宅配: ${expressDelivery.name} (${expressDelivery.id})`)
    console.log(`- 超商取貨: ${storePickup.name} (${storePickup.id})`)

  } catch (error) {
    console.error("❌ 同步過程中發生錯誤:", error)
    throw error
  }
}
