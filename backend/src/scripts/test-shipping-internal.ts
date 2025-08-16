import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function testShippingAPI({ container }: { container: MedusaContainer }) {
  console.log("🧪 測試配送選項 API 內部邏輯")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 1. 模擬 store API 的查詢邏輯
  console.log("\n🔍 測試 1: 基本配送選項查詢")
  
  const { data: allShippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "provider_id",
      "service_zone_id"
    ]
  });
  
  console.log(`找到 ${allShippingOptions.length} 個配送選項:`)
  for (const option of allShippingOptions) {
    console.log(`- ${option.name}: ${option.id}`)
    console.log(`  Provider: ${option.provider_id}`)
    console.log(`  Zone: ${option.service_zone_id}`)
    console.log("")
  }
  
  // 2. 檢查購物車和地區的關聯
  console.log("\n🛒 測試 2: 購物車地區關聯檢查")
  
  const cartId = "cart_01K2RY0MVG0GZMQC6K2CXKCVRF"
  const { data: cartInfo } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "region_id", 
      "region.currency_code",
      "shipping_address.country_code"
    ],
    filters: { id: cartId }
  });
  
  if (cartInfo[0]) {
    const cart = cartInfo[0]
    console.log(`購物車地區: ${cart.region_id}`)
    console.log(`地區貨幣: ${cart.region.currency_code}`)
    console.log(`配送國家: ${cart.shipping_address?.country_code}`)
  }
  
  console.log("\n✅ 測試完成")
}
