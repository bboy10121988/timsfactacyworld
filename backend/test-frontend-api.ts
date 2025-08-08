import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function testFrontendAPI({ container }) {
  console.log("🧪 測試前端 API 調用...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 模擬前端創建購物車並獲取配送選項的流程
    console.log("\n1. 創建測試購物車...")
    
    // 找到台灣地區
    const regions = await remoteQuery({
      entryPoint: "region",
      fields: ["id", "name", "currency_code"],
      filters: { name: "台灣" }
    })
    
    if (regions.length === 0) {
      console.log("❌ 找不到台灣地區")
      return
    }
    
    const taiwanRegion = regions[0]
    console.log(`✅ 台灣地區: ${taiwanRegion.name} (${taiwanRegion.currency_code})`)
    
    // 檢查配送選項
    console.log("\n2. 檢查配送選項...")
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "price_type", "service_zone_id"],
    })
    
    console.log(`找到 ${shippingOptions.length} 個配送選項`)
    
    for (const option of shippingOptions) {
      console.log(`\n🚚 配送選項: ${option.name}`)
      
      // 檢查服務區域
      const serviceZone = await remoteQuery({
        entryPoint: "service_zone", 
        fields: ["id", "name", "geo_zones.country_code"],
        filters: { id: option.service_zone_id }
      })
      
      if (serviceZone.length > 0) {
        const zone = serviceZone[0]
        console.log(`   服務區域: ${zone.name}`)
        if (zone.geo_zones && zone.geo_zones.length > 0) {
          console.log(`   國家代碼: ${zone.geo_zones[0].country_code}`)
        }
      }
      
      // 檢查價格設置 - 這是關鍵！
      const priceSetRelation = await remoteQuery({
        entryPoint: "shipping_option_price_set",
        fields: ["price_set_id"],
        filters: { shipping_option_id: option.id }
      })
      
      if (priceSetRelation.length > 0) {
        const prices = await remoteQuery({
          entryPoint: "price",
          fields: ["id", "amount", "currency_code", "raw_amount"],
          filters: { 
            price_set_id: priceSetRelation[0].price_set_id,
            currency_code: "TWD"  // 只查 TWD
          }
        })
        
        console.log(`   TWD 價格記錄數量: ${prices.length}`)
        prices.forEach(price => {
          console.log(`     - ID: ${price.id}, 金額: ${price.amount}, 原始: ${JSON.stringify(price.raw_amount)}`)
        })
      } else {
        console.log(`   ❌ 沒有價格設置關聯`)
      }
    }
    
    // 測試 Fulfillment 服務的配送選項查詢
    console.log("\n3. 測試 Fulfillment 服務...")
    
    try {
      const fulfillmentService = container.resolve(Modules.FULFILLMENT)
      
      // 嘗試列出配送選項
      const fulfillmentOptions = await fulfillmentService.listShippingOptions({
        service_zone_id: "serzo_01K17DQ7711FDNPXRATFT04HW3"
      })
      
      console.log(`Fulfillment 服務找到 ${fulfillmentOptions.length} 個配送選項`)
      fulfillmentOptions.forEach(option => {
        console.log(`  - ${option.name}: 價格類型 ${option.price_type}`)
      })
      
    } catch (error) {
      console.log("Fulfillment 服務測試失敗:", error.message)
    }
    
    console.log("\n✅ API 測試完成")
    
  } catch (error) {
    console.error("❌ 測試 API 時發生錯誤:", error)
    console.error("錯誤詳情:", error.stack)
  }
}
