import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function debugFulfillmentProvider({ container }: { container: MedusaContainer }) {
  console.log("🔍 檢查 Fulfillment Provider 狀態")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 檢查所有 fulfillment providers
  const { data: providers } = await query.graph({
    entity: "fulfillment_provider",
    fields: [
      "id",
      "is_enabled"
    ]
  });
  
  console.log("\n📦 所有 Fulfillment Providers:")
  for (const provider of providers) {
    console.log(`- ${provider.id}: ${provider.is_enabled ? '✅ 已啟用' : '❌ 未啟用'}`)
  }
  
  // 檢查 manual_manual provider 的詳細資訊
  const { data: manualProvider } = await query.graph({
    entity: "fulfillment_provider",
    fields: [
      "id",
      "is_enabled"
    ],
    filters: { id: "manual_manual" }
  });
  
  console.log("\n🚚 Manual Provider 狀態:")
  if (manualProvider.length > 0) {
    console.log(`ID: ${manualProvider[0].id}`)
    console.log(`狀態: ${manualProvider[0].is_enabled ? '✅ 已啟用' : '❌ 未啟用'}`)
  } else {
    console.log("❌ 找不到 manual_manual provider")
  }
  
  // 檢查配送選項和 provider 的關聯
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name", 
      "provider_id",
      "service_zone_id",
      "data"
    ],
    filters: { 
      id: ["so_01K2K7ABW9THYBX25W456SW0J1", "so_01K2K7ABWDMMYAT5NMQ0N49P4Y"]
    }
  });
  
  console.log("\n🎯 配送選項和 Provider 關聯:")
  for (const option of shippingOptions) {
    console.log(`- ${option.name} (${option.id})`)
    console.log(`  Provider: ${option.provider_id}`)
    console.log(`  Service Zone: ${option.service_zone_id}`)
    console.log(`  Data: ${JSON.stringify(option.data)}`)
    console.log("")
  }
}
