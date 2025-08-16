import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function debugShippingRequirements({ container }: { container: MedusaContainer }) {
  console.log("🔍 檢查配送選項的完整需求")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 1. 檢查 region 和 fulfillment set 的關聯
  console.log("\n🌏 檢查 Region 配置:")
  const { data: regions } = await query.graph({
    entity: "region",
    fields: [
      "id",
      "name",
      "currency_code",
      "countries.iso_2"
    ],
    filters: { id: "reg_tw_region_001" }
  });
  
  if (regions[0]) {
    const region = regions[0]
    console.log(`地區: ${region.name} (${region.id})`)
    console.log(`貨幣: ${region.currency_code}`)
    console.log(`國家: ${region.countries.map((c: any) => c.iso_2).join(', ')}`)
  }
  
  // 2. 檢查 fulfillment set 是否關聯到正確的地區
  console.log("\n📦 檢查 Fulfillment Set 和 Region 關聯:")
  
  // 在 Medusa 2.x 中，fulfillment set 可能需要與 region 有特定關聯
  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: [
      "id",
      "name",
      "type"
    ],
    filters: { id: "fuset_tw_default_001" }
  });
  
  if (fulfillmentSets[0]) {
    const fSet = fulfillmentSets[0]
    console.log(`Fulfillment Set: ${fSet.name} (${fSet.id})`)
    console.log(`類型: ${fSet.type}`)
  }
  
  // 3. 檢查 location 配置
  console.log("\n📍 檢查 Stock Location:")
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "name",
      "address.country_code"
    ]
  });
  
  console.log(`找到 ${stockLocations.length} 個庫存地點:`)
  stockLocations.forEach((location: any) => {
    console.log(`- ${location.name} (${location.id})`)
    console.log(`  國家: ${location.address?.country_code || 'N/A'}`)
  })
  
  // 4. 檢查 fulfillment set 是否有關聯的 stock locations
  const { data: fsetWithLocations } = await query.graph({
    entity: "fulfillment_set",
    fields: [
      "id",
      "name",
      "location.id",
      "location.name"
    ],
    filters: { id: "fuset_tw_default_001" }
  }).catch(() => ({ data: [] }));
  
  if (fsetWithLocations.length > 0 && fsetWithLocations[0].location) {
    console.log("\n✅ Fulfillment Set 有關聯的庫存地點:")
    console.log(`- ${fsetWithLocations[0].location.name}`)
  } else {
    console.log("\n❌ Fulfillment Set 沒有關聯的庫存地點")
  }
  
  // 5. 檢查 sales channel 配置
  console.log("\n🛒 檢查 Sales Channel:")
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: [
      "id",
      "name",
      "is_default"
    ]
  });
  
  console.log(`找到 ${salesChannels.length} 個銷售管道:`)
  salesChannels.forEach((channel: any) => {
    console.log(`- ${channel.name} (${channel.id}) ${channel.is_default ? '(預設)' : ''}`)
  })
  
  console.log("\n✅ 檢查完成")
}
