import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function resetDatabase({ container }) {
  console.log("🧹 重置資料庫到初始狀態...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 檢查現有資料
    console.log("\n📊 檢查現有資料...")
    
    const salesChannels = await remoteQuery({
      entryPoint: "sales_channel",
      fields: ["id", "name"],
    })
    console.log(`Sales Channels: ${salesChannels.length} 條記錄`)
    
    const regions = await remoteQuery({
      entryPoint: "region", 
      fields: ["id", "name", "currency_code"],
    })
    console.log(`Regions: ${regions.length} 條記錄`)
    
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "amount", "currency_code", "region_id"],
    })
    console.log(`Shipping Options: ${shippingOptions.length} 條記錄`)
    
    const products = await remoteQuery({
      entryPoint: "product",
      fields: ["id", "title"],
    })
    console.log(`Products: ${products.length} 條記錄`)
    
    // 顯示有問題的配送選項
    console.log("\n⚠️  有問題的配送選項:")
    shippingOptions.forEach(option => {
      if (!option.amount || !option.currency_code || !option.region_id) {
        console.log(`- ${option.name} (ID: ${option.id}): 金額=${option.amount}, 貨幣=${option.currency_code}, 地區=${option.region_id}`)
      }
    })
    
    console.log("\n建議的解決方案:")
    console.log("1. 手動清理資料庫並重新 seed")
    console.log("2. 或者修正現有的配送選項")
    
  } catch (error) {
    console.error("❌ 檢查資料庫時發生錯誤:", error)
    throw error
  }
}
