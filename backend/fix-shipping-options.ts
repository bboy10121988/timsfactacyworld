import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteShippingOptionsWorkflow, createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function fixShippingOptions({ container }) {
  console.log("🔧 修正配送選項...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 找到台灣地區
    const regions = await remoteQuery({
      entryPoint: "region",
      fields: ["id", "name", "currency_code"],
      filters: {
        name: "台灣"
      }
    })
    
    console.log("找到的地區:", regions)
    
    if (regions.length === 0) {
      console.error("❌ 找不到台灣地區")
      return
    }
    
    const taiwanRegion = regions[0]
    console.log(`✅ 找到台灣地區: ${taiwanRegion.name} (${taiwanRegion.id}), 貨幣: ${taiwanRegion.currency_code}`)
    
    // 找到有問題的配送選項
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "amount", "currency_code", "region_id", "price_type"],
    })
    
    const problematicOption = shippingOptions.find(option => 
      !option.amount || !option.currency_code || !option.region_id
    )
    
    if (!problematicOption) {
      console.log("✅ 沒有找到有問題的配送選項")
      return
    }
    
    console.log(`�️ 刪除有問題的配送選項: ${problematicOption.name}`)
    
    // 刪除有問題的配送選項
    await deleteShippingOptionsWorkflow(container).run({
      input: {
        ids: [problematicOption.id]
      }
    })
    
    console.log("✅ 舊配送選項已刪除")
    
    // 創建新的配送選項
    console.log("🆕 創建新的配送選項...")
    
    const result = await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "宅配到府",
          price_type: "flat",
          type: {
            label: "Flat Rate",
            description: "Flat rate shipping option",
            code: "flat_rate"
          },
          prices: [
            {
              currency_code: taiwanRegion.currency_code,
              amount: 10000, // 100 TWD
            }
          ],
          provider_id: "manual_manual",
          service_zone_id: "<YOUR_SERVICE_ZONE_ID>",
          shipping_profile_id: "<YOUR_SHIPPING_PROFILE_ID>",
        }
      ]
    })
    
    console.log("✅ 新配送選項創建成功:", result)
    
    // 驗證新創建的配送選項
    const newOptions = await remoteQuery({
      entryPoint: "shipping_option", 
      fields: ["id", "name", "amount", "currency_code", "region_id", "price_type"],
    })
    
    console.log("🔍 所有配送選項:")
    newOptions.forEach(option => {
      console.log(`  - ${option.name}: 金額=${option.amount}, 貨幣=${option.currency_code}, 地區=${option.region_id}`)
    })
    
  } catch (error) {
    console.error("❌ 修正配送選項時發生錯誤:", error)
    console.error("錯誤詳情:", error.stack)
    throw error
  }
}
