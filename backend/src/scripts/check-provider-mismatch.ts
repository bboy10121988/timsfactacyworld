import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkProviderMismatch({ container }: { container: MedusaContainer }) {
  console.log("🔍 檢查 Provider ID 不匹配問題")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 1. 檢查所有 fulfillment providers
  const { data: providers } = await query.graph({
    entity: "fulfillment_provider",
    fields: ["id"]
  });
  
  console.log("\n🚚 所有 Fulfillment Providers:")
  providers.forEach(p => console.log(`- ${p.id}`));
  
  // 2. 檢查配送選項的 provider_id
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option", 
    fields: ["id", "name", "provider_id"]
  });
  
  console.log("\n📦 配送選項和 Provider:")
  shippingOptions.forEach(opt => {
    console.log(`- ${opt.name}: provider_id = ${opt.provider_id}`)
    
    // 檢查是否存在匹配的 provider
    const providerExists = providers.some(p => p.id === opt.provider_id)
    console.log(`  Provider 存在: ${providerExists ? '✅' : '❌'}`)
    
    if (!providerExists) {
      console.log(`  ❌ 警告: 找不到 provider_id "${opt.provider_id}"`)
    }
  });
  
  // 3. 如果有不匹配，建議修復方案
  const mismatchedOptions = shippingOptions.filter(opt => 
    !providers.some(p => p.id === opt.provider_id)
  )
  
  if (mismatchedOptions.length > 0) {
    console.log("\n🔧 發現 Provider ID 不匹配，建議修復:")
    mismatchedOptions.forEach(opt => {
      console.log(`- 配送選項 "${opt.name}" (${opt.id})`)
      console.log(`  當前 provider_id: ${opt.provider_id}`)
      console.log(`  可用的 providers: ${providers.map(p => p.id).join(', ')}`)
    })
  } else {
    console.log("\n✅ 所有配送選項的 Provider ID 都匹配")
  }
}
