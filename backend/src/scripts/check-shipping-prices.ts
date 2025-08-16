import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkShippingOptionPrices({ container }: { container: MedusaContainer }) {
  console.log("💰 檢查配送選項價格配置")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 檢查配送選項價格
  const { data: shippingOptionPrices } = await query.graph({
    entity: "shipping_option_price_set",
    fields: [
      "id",
      "shipping_option_id", 
      "price_set_id"
    ]
  });
  
  console.log(`\n📊 配送選項價格設定 (${shippingOptionPrices.length} 筆):`);
  for (const price of shippingOptionPrices) {
    console.log(`- 配送選項: ${price.shipping_option_id}`)
    console.log(`  價格集: ${price.price_set_id}`)
    console.log("")
  }
  
  // 檢查價格集詳細資訊
  if (shippingOptionPrices.length > 0) {
    const priceSetIds = shippingOptionPrices.map(p => p.price_set_id)
    
    const { data: priceSets } = await query.graph({
      entity: "price_set",
      fields: [
        "id",
        "prices.amount",
        "prices.currency_code",
        "prices.price_list_id"
      ],
      filters: { id: priceSetIds }
    });
    
    console.log("💲 價格集詳細資訊:");
    for (const priceSet of priceSets) {
      console.log(`- 價格集: ${priceSet.id}`)
      if (priceSet.prices) {
        for (const price of priceSet.prices) {
          console.log(`  ${price.currency_code}: ${price.amount} (price_list: ${price.price_list_id})`)
        }
      }
      console.log("")
    }
  }
  
  // 檢查我們的台灣配送選項
  const taiwanShippingIds = ["so_01K2K7ABW9THYBX25W456SW0J1", "so_01K2K7ABWDMMYAT5NMQ0N49P4Y"]
  
  for (const shippingId of taiwanShippingIds) {
    console.log(`🏷️ 檢查配送選項: ${shippingId}`)
    
    const { data: option } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name"],
      filters: { id: shippingId }
    });
    
    if (option.length > 0) {
      console.log(`名稱: ${option[0].name}`)
      
      // 檢查是否有關聯的價格
      const priceEntry = shippingOptionPrices.find(p => p.shipping_option_id === shippingId)
      if (priceEntry) {
        console.log(`✅ 有價格設定: ${priceEntry.price_set_id}`)
      } else {
        console.log(`❌ 沒有價格設定`)
      }
    } else {
      console.log(`❌ 配送選項不存在`)
    }
    console.log("")
  }
}
