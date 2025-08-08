import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function verifyShippingOptions({ container }) {
  console.log("✅ 驗證修正後的配送選項...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 使用更完整的查詢來檢查配送選項
    const shippingOptionsWithPrices = await remoteQuery({
      entryPoint: "shipping_option",
      fields: [
        "id", 
        "name", 
        "price_type",
        "service_zone_id", 
        "service_zone.name",
        "service_zone.geo_zones.country_code",
        "price_set.prices.amount",
        "price_set.prices.currency_code"
      ],
    })
    
    console.log("\n📋 完整的配送選項資訊:")
    shippingOptionsWithPrices.forEach(option => {
      console.log(`\n🚚 配送選項: ${option.name}`)
      console.log(`   ID: ${option.id}`)
      console.log(`   價格類型: ${option.price_type}`)
      console.log(`   服務區域: ${option.service_zone?.name || 'N/A'}`)
      console.log(`   國家: ${option.service_zone?.geo_zones?.[0]?.country_code || 'N/A'}`)
      
      if (option.price_set?.prices?.length > 0) {
        option.price_set.prices.forEach(price => {
          console.log(`   價格: ${price.amount} ${price.currency_code}`)
        })
      } else {
        console.log(`   ⚠️  沒有找到價格設置`)
      }
    })
    
    // 測試計算價格的功能  
    const fulfillmentService = container.resolve(Modules.FULFILLMENT)
    console.log("\n🧮 測試價格計算...")
    
    try {
      const options = await fulfillmentService.listShippingOptionsForContext({
        context: {
          region_id: "reg_01JW1S1F7GB4ZP322G2DMETETH", // 台灣地區
          currency_code: "twd",
        }
      })
      console.log(`找到 ${options.length} 個可用的配送選項`)
      
      options.forEach(option => {
        console.log(`  - ${option.name}: ${option.amount || 'calculated'} ${option.currency_code || 'N/A'}`)
      })
    } catch (error) {
      console.log("計算價格時發生錯誤:", error.message)
    }
    
    console.log("\n✅ 驗證完成")
    
  } catch (error) {
    console.error("❌ 驗證配送選項時發生錯誤:", error)
    console.error("錯誤詳情:", error.stack)
    throw error
  }
}
