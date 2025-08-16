import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function verifyTaiwanShipping({ 
  container 
}: ExecArgs) {
  console.log("🔍 驗證台灣配送設定...")

  try {
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    
    // 獲取所有運送選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({})
    
    console.log(`📋 找到 ${shippingOptions.length} 個配送選項:`)
    console.log("=" .repeat(60))
    
    shippingOptions.forEach((opt, index) => {
      console.log(`\n${index + 1}. 配送選項詳細資訊:`)
      console.log(`   🏷️  名稱: ${opt.name}`)
      console.log(`   🆔 ID: ${opt.id}`)
      console.log(`   🚚 提供者: ${opt.provider_id}`)
      console.log(`   💰 價格類型: ${opt.price_type}`)
      console.log(`   💵 金額: ${(opt as any).amount ? `$${((opt as any).amount / 100)} TWD` : '未設定'}`)
      console.log(`   📝 描述: ${JSON.stringify(opt.type, null, 4)}`)
      console.log(`   📦 資料: ${JSON.stringify(opt.data, null, 4)}`)
      console.log(`   🌐 服務區域ID: ${opt.service_zone_id}`)
      console.log(`   📋 配送方案ID: ${opt.shipping_profile_id}`)
    })

    console.log("\n" + "=" .repeat(60))
    console.log("✅ 驗證完成！")

  } catch (error) {
    console.error("❌ 驗證失敗:", error)
  }
}
