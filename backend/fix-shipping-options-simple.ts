import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function fixShippingOptions({ container }) {
  console.log("🔧 修正配送選項...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    const shippingOptionModuleService = container.resolve(Modules.FULFILLMENT)
    
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
    
    console.log("所有配送選項:", shippingOptions)
    
    const problematicOption = shippingOptions.find(option => 
      !option.amount || !option.currency_code || !option.region_id
    )
    
    if (!problematicOption) {
      console.log("✅ 沒有找到有問題的配送選項")
      return
    }
    
    console.log(`🔧 嘗試直接更新配送選項: ${problematicOption.name}`)
    console.log("有問題的配送選項:", problematicOption)
    
    // 讓我們嘗試創建一個簡單的腳本來手動清理資料庫
    console.log("\n建議手動執行以下步驟來修正資料庫：")
    console.log("1. 連接到 PostgreSQL 資料庫")
    console.log("2. 執行以下 SQL:")
    console.log(`   UPDATE shipping_option SET `)
    console.log(`   amount = 10000,`)
    console.log(`   currency_code = '${taiwanRegion.currency_code}',`)
    console.log(`   region_id = '${taiwanRegion.id}'`)
    console.log(`   WHERE id = '${problematicOption.id}';`)
    
    console.log("\n或者，完全重新初始化資料庫：")
    console.log("1. 刪除所有資料：DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    console.log("2. 重新執行遷移：npx medusa db:migrate")
    console.log("3. 重新執行 seed：npm run seed")
    
  } catch (error) {
    console.error("❌ 修正配送選項時發生錯誤:", error)
    console.error("錯誤詳情:", error.stack)
    throw error
  }
}
