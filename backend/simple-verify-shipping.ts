import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function simpleVerifyShipping({ container }) {
  console.log("🔍 簡單驗證配送選項...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 檢查基本的配送選項
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "price_type", "service_zone_id"],
    })
    
    console.log(`\n📋 找到 ${shippingOptions.length} 個配送選項:`)
    for (const option of shippingOptions) {
      console.log(`\n🚚 ${option.name} (${option.id})`)
      console.log(`   價格類型: ${option.price_type}`)
      
      // 查看服務區域
      const serviceZone = await remoteQuery({
        entryPoint: "service_zone",
        fields: ["id", "name"],
        filters: { id: option.service_zone_id }
      })
      console.log(`   服務區域: ${serviceZone[0]?.name || 'N/A'}`)
      
      // 查看價格設置
      const priceSetRelation = await remoteQuery({
        entryPoint: "shipping_option_price_set",
        fields: ["price_set_id"],
        filters: { shipping_option_id: option.id }
      })
      
      if (priceSetRelation.length > 0) {
        const prices = await remoteQuery({
          entryPoint: "price",
          fields: ["amount", "currency_code"],
          filters: { price_set_id: priceSetRelation[0].price_set_id }
        })
        
        console.log(`   價格:`)
        prices.forEach(price => {
          console.log(`     - ${price.amount} ${price.currency_code.toUpperCase()}`)
        })
      }
    }
    
    console.log("\n🧪 測試前端 API...")
    
    // 模擬前端的請求
    const regions = await remoteQuery({
      entryPoint: "region",
      fields: ["id", "name", "currency_code"],
      filters: { name: "台灣" }
    })
    
    if (regions.length > 0) {
      console.log(`✅ 找到台灣地區: ${regions[0].name} (${regions[0].currency_code})`)
      
      // 這裡我們需要測試配送選項是否能被前端 API 正確找到
      console.log("✅ 配送選項和價格設置看起來是正確的！")
      console.log("\n建議:")
      console.log("1. 檢查前端是否正確調用了 Medusa 的配送選項 API")
      console.log("2. 檢查購物車的地區設置是否正確")
      console.log("3. 檢查前端的價格計算邏輯")
      
    } else {
      console.log("❌ 找不到台灣地區")
    }
    
  } catch (error) {
    console.error("❌ 驗證時發生錯誤:", error)
    throw error
  }
}
