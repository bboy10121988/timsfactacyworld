import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function setupTaiwanShipping({ 
  container 
}: ExecArgs) {
  console.log("🇹🇼 開始設置台灣配送選項...")

  try {
    // 獲取模組服務
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    console.log("1. 檢查現有運送選項...")
    
    const existingShippingOptions = await fulfillmentModuleService.listShippingOptions({})
    console.log(`   找到 ${existingShippingOptions.length} 個現有運送選項`)
    
    existingShippingOptions.forEach((opt, index) => {
      console.log(`   ${index + 1}. ${opt.name} (${opt.id}) - Provider: ${opt.provider_id}`)
    })

    console.log("\n2. 更新標準配送為台灣標準宅配...")
    
    const standardOption = existingShippingOptions.find(opt => 
      opt.name === "Standard Shipping" || opt.id === "so_01K2K7ABW9THYBX25W456SW0J1"
    )
    
    if (standardOption) {
      try {
        const updatedStandard = await fulfillmentModuleService.updateShippingOptions(
          standardOption.id,
          {
            name: "標準宅配",
            type: {
              label: "標準宅配",
              description: "3-5個工作天送達，台灣本島配送",
              code: "standard_taiwan"
            },
            data: {
              description: "台灣本島宅配服務，適合一般商品",
              estimated_delivery: "3-5個工作天",
              region: "台灣本島"
            }
          }
        )
        console.log(`✓ 更新標準配送: ${updatedStandard.name} (${updatedStandard.id})`)
      } catch (error) {
        console.log(`⚠️  標準配送更新失敗: ${error.message}`)
      }
    }

    console.log("\n3. 更新快速配送為台灣快速宅配...")
    
    const expressOption = existingShippingOptions.find(opt => 
      opt.name === "Express Shipping" || opt.id === "so_01K2K7ABWDMMYAT5NMQ0N49P4Y"
    )

    if (expressOption) {
      try {
        const updatedExpress = await fulfillmentModuleService.updateShippingOptions(
          expressOption.id,
          {
            name: "快速宅配",
            type: {
              label: "快速宅配",
              description: "1-2個工作天送達，台灣本島快速配送",
              code: "express_taiwan"
            },
            data: {
              description: "台灣本島快速配送服務，急件專用",
              estimated_delivery: "1-2個工作天",
              region: "台灣本島"
            }
          }
        )
        console.log(`✓ 更新快速配送: ${updatedExpress.name} (${updatedExpress.id})`)
      } catch (error) {
        console.log(`⚠️  快速配送更新失敗: ${error.message}`)
      }
    }

    console.log("\n4. 驗證更新後的配置...")
    
    // 重新獲取所有選項進行驗證
    const finalOptions = await fulfillmentModuleService.listShippingOptions({})
    const manualOptions = finalOptions.filter(opt => opt.provider_id === "manual_manual")
    
    console.log(`\n✅ 台灣配送設置完成！`)
    console.log(`📋 當前配送選項 (${manualOptions.length}個):`)
    manualOptions.forEach((opt, index) => {
      console.log(`  ${index + 1}. ${opt.name} (${opt.id})`)
      console.log(`     - 提供者: ${opt.provider_id}`)
      console.log(`     - 描述: ${opt.type?.description || 'N/A'}`)
      console.log(`     - 價格類型: ${opt.price_type}`)
    })

    console.log("\n📋 建議接下來的步驟:")
    console.log("1. 重新啟動前端服務以載入新的配送選項")
    console.log("2. 測試前端結帳流程，確認配送選項正確顯示")
    console.log("3. 檢查配送選項的價格設定")

  } catch (error) {
    console.error("❌ 台灣配送設置失敗:", error)
    throw error
  }
}
