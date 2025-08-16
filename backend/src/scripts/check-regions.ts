import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function checkRegions({ 
  container 
}: ExecArgs) {
  console.log("🌍 檢查地區設定...")

  try {
    const regionModuleService = container.resolve(Modules.REGION)
    
    // 獲取所有地區
    const regions = await regionModuleService.listRegions({})
    
    console.log(`📋 找到 ${regions.length} 個地區:`)
    console.log("=" .repeat(60))
    
    regions.forEach((region, index) => {
      console.log(`\n${index + 1}. 地區詳細資訊:`)
      console.log(`   🏷️  名稱: ${region.name}`)
      console.log(`   🆔 ID: ${region.id}`)
      console.log(`   💰 貨幣: ${region.currency_code}`)
      console.log(`   🌐 國家列表: ${JSON.stringify((region as any).countries?.map((c: any) => ({ name: c.name, iso_2: c.iso_2 })) || [], null, 2)}`)
      console.log(`   📦 自動稅務: ${(region as any).automatic_taxes || 'N/A'}`)
      console.log(`   📍 稅務供應商: ${(region as any).tax_provider_id || 'N/A'}`)
    })

    console.log("\n" + "=" .repeat(60))
    console.log("✅ 檢查完成！")

  } catch (error) {
    console.error("❌ 檢查失敗:", error)
  }
}
