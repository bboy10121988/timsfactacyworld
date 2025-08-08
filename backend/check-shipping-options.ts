import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function checkShippingOptions({ container }) {
  console.log("🚚 詳細檢查配送選項...")
  
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // 檢查配送選項的詳細資訊
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["*"],
    })
    
    console.log("\n📋 配送選項完整資訊:")
    shippingOptions.forEach(option => {
      console.log(`選項 ID: ${option.id}`)
      console.log(`名稱: ${option.name}`)
      console.log(`價格類型: ${option.price_type}`)
      console.log(`金額: ${option.amount}`)
      console.log(`貨幣代碼: ${option.currency_code}`)
      console.log(`地區 ID: ${option.region_id}`)
      console.log(`提供商 ID: ${option.provider_id}`)
      console.log(`已刪除: ${option.deleted_at}`)
      console.log("---")
    })
    
    // 檢查地區資訊
    const regions = await remoteQuery({
      entryPoint: "region",
      fields: ["*"],
    })
    
    console.log("\n🌏 地區資訊:")
    regions.forEach(region => {
      console.log(`地區: ${region.name} (${region.id})`)
      console.log(`貨幣: ${region.currency_code}`)
      console.log("---")
    })
    
  } catch (error) {
    console.error("❌ 檢查配送選項時發生錯誤:", error)
    throw error
  }
}
