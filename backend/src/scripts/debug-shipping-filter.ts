import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function debugShippingFilter({ container }: { container: MedusaContainer }) {
  console.log("🔍 調試配送篩選邏輯")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 1. 檢查購物車詳細資訊
  const cartId = 'cart_01K2RY0MVG0GZMQC6K2CXKCVRF'
  console.log(`\n📦 檢查購物車: ${cartId}`)
  
  const { data: cartData } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "region_id",
      "shipping_address.*",
      "region.countries.iso_2",
      "items.id",
      "items.quantity"
    ],
    filters: { id: cartId }
  });
  
  console.log("購物車資料:")
  console.log(JSON.stringify(cartData[0], null, 2))
  
  // 2. 檢查地區和國家關聯
  console.log("\n🌍 檢查地區配置:")
  const { data: regionData } = await query.graph({
    entity: "region",
    fields: [
      "id",
      "name",
      "currency_code",
      "countries.iso_2",
      "countries.name"
    ],
    filters: { id: "reg_tw_region_001" }
  });
  
  console.log("地區資料:")
  console.log(JSON.stringify(regionData[0], null, 2))
  
  // 3. 檢查配送選項的服務區域篩選
  console.log("\n🚚 檢查配送選項服務區域關聯:")
  const { data: shippingOptionData } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "service_zone_id",
      "service_zone.name",
      "service_zone.geo_zones.type",
      "service_zone.geo_zones.country_code",
      "service_zone.fulfillment_set_id",
      "service_zone.fulfillment_set.name"
    ],
    filters: { 
      id: ["so_01K2K7ABW9THYBX25W456SW0J1", "so_01K2K7ABWDMMYAT5NMQ0N49P4Y"]
    }
  });
  
  console.log("配送選項詳細:")
  for (const option of shippingOptionData) {
    console.log(JSON.stringify(option, null, 2))
  }
  
  // 4. 檢查 fulfillment_set 是否涵蓋台灣地區
  console.log("\n🎯 檢查 fulfillment_set 地區涵蓋:")
  const { data: fulfillmentSetData } = await query.graph({
    entity: "fulfillment_set",
    fields: [
      "id",
      "name", 
      "type",
      "service_zones.id",
      "service_zones.name",
      "service_zones.geo_zones.country_code",
      "service_zones.geo_zones.type"
    ],
    filters: { id: "fuset_tw_default_001" }
  });
  
  console.log("Fulfillment Set 資料:")
  console.log(JSON.stringify(fulfillmentSetData[0], null, 2))
  
  console.log("\n✅ 調試完成")
}
