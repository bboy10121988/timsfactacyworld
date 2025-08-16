import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function testShippingAPI({ 
  container 
}: ExecArgs) {
  console.log("🧪 測試配送選項 API...")

  try {
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    
    // 1. 測試獲取所有配送選項
    console.log("\n1. 📦 測試獲取配送選項...")
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    
    console.log(`✅ 找到 ${shippingOptions.length} 個配送選項:`)
    shippingOptions.forEach((option, index) => {
      console.log(`\n${index + 1}. ${option.name}`)
      console.log(`   🆔 ID: ${option.id}`)
      console.log(`   💰 價格類型: ${option.price_type}`)
      console.log(`   🚚 提供者: ${option.provider_id}`)
      
      // 嘗試從 data 欄位獲取價格資訊
      if (option.data && typeof option.data === 'object') {
        const data = option.data as any
        if (data.price) {
          console.log(`   💵 價格: $${data.price} ${data.currency || 'TWD'}`)
        }
        if (data.description) {
          console.log(`   📝 描述: ${data.description}`)
        }
        if (data.estimated_delivery) {
          console.log(`   ⏰ 配送時間: ${data.estimated_delivery}`)
        }
      }
    })

    // 2. 測試服務區域
    console.log("\n\n2. 🌏 測試服務區域...")
    const serviceZones = await fulfillmentModuleService.listServiceZones({})
    
    console.log(`✅ 找到 ${serviceZones.length} 個服務區域:`)
    serviceZones.forEach((zone, index) => {
      console.log(`${index + 1}. ${zone.name} (${zone.id})`)
    })

    // 3. 模擬前端 API 調用的格式
    console.log("\n\n3. 🔧 模擬前端 API 格式...")
    
    const formattedOptions = shippingOptions.map(option => {
      const data = option.data as any || {}
      return {
        id: option.id,
        name: option.name,
        price_type: option.price_type,
        amount: data.price ? data.price * 100 : null, // 轉換為分
        description: data.description || option.name,
        estimated_delivery: data.estimated_delivery || 'N/A'
      }
    })
    
    console.log("📋 前端格式的配送選項:")
    console.log(JSON.stringify(formattedOptions, null, 2))

    console.log("\n✅ 測試完成！配送選項應該可以在前端正確顯示。")

  } catch (error) {
    console.error("❌ 測試失敗:", error)
  }
}
