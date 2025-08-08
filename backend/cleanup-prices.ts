import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function cleanUpPrices({ container }) {
  console.log("🧹 清理重複的配送價格...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 找到配送選項的 price_set_id
    const priceSetRelation = await remoteQuery({
      entryPoint: "shipping_option_price_set", 
      fields: ["price_set_id"],
      filters: { shipping_option_id: "so_01K17ZXW5P24YG1JPPH8KXJJZR" }
    })
    
    if (priceSetRelation.length === 0) {
      console.log("❌ 找不到配送選項的價格設置")
      return
    }
    
    const priceSetId = priceSetRelation[0].price_set_id
    console.log(`🔍 Price Set ID: ${priceSetId}`)
    
    // 使用直接的 SQL 刪除所有舊的價格記錄
    console.log("🗑️ 刪除所有現有的價格記錄...")
    
    // 建議手動執行的 SQL 命令
    console.log("\n請手動執行以下 SQL 命令來清理重複的價格：")
    console.log("```sql")
    console.log(`-- 1. 刪除所有現有的價格記錄`)
    console.log(`DELETE FROM price WHERE price_set_id = '${priceSetId}';`)
    console.log("")
    console.log(`-- 2. 插入唯一的正確價格記錄`)
    console.log(`INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, rules_count, created_at, updated_at)`)
    console.log(`VALUES (`)
    console.log(`  'price_new_shipping_twd',`)
    console.log(`  '${priceSetId}',`)
    console.log(`  'TWD',`)
    console.log(`  80,`)
    console.log(`  '{"value": "80", "precision": 20}',`)
    console.log(`  0,`)
    console.log(`  NOW(),`)
    console.log(`  NOW()`)
    console.log(`);`)
    console.log("```")
    
    console.log("\n或者，完全重新初始化資料庫（推薦）：")
    console.log("1. 停止 Medusa 服務")
    console.log("2. 執行：DROP DATABASE medusa_0525; CREATE DATABASE medusa_0525;")
    console.log("3. 執行：npx medusa db:migrate")
    console.log("4. 執行：npm run seed")
    
  } catch (error) {
    console.error("❌ 清理價格時發生錯誤:", error)
    throw error
  }
}
