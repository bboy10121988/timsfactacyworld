import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function updateTaiwanShippingPrices({ 
  container 
}: ExecArgs) {
  console.log("💰 開始設置台灣配送價格...")

  try {
    // 獲取模組服務
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    console.log("1. 檢查現有運送選項...")
    
    const existingShippingOptions = await fulfillmentModuleService.listShippingOptions({})
    console.log(`   找到 ${existingShippingOptions.length} 個現有運送選項`)

    console.log("\n2. 更新標準宅配價格為 $80...")
    
    // 查找標準配送選項
    const standardOption = existingShippingOptions.find(opt => 
      opt.name === "標準宅配" || opt.name === "Standard Shipping" || opt.id === "so_01K2K7ABW9THYBX25W456SW0J1"
    )
    
    if (standardOption) {
      try {
        const updatedStandard = await fulfillmentModuleService.updateShippingOptions(
          standardOption.id,
          {
            name: "標準宅配",
            price_type: "flat",
            amount: 8000, // $80 TWD (以分為單位)
            type: {
              label: "標準宅配",
              description: "3-5個工作天送達，運費 $80",
              code: "standard_taiwan"
            },
            data: {
              description: "台灣本島宅配服務，3-5個工作天送達，運費 $80",
              estimated_delivery: "3-5個工作天",
              price: 80,
              currency: "TWD"
            }
          }
        )
        console.log(`✅ 更新標準宅配: ${updatedStandard.name} - $80`)
      } catch (error) {
        console.log(`❌ 標準宅配價格更新失敗: ${error.message}`)
      }
    } else {
      console.log("⚠️  找不到標準宅配選項")
    }

    console.log("\n3. 更新快速宅配價格為 $100...")
    
    // 查找快速配送選項
    const expressOption = existingShippingOptions.find(opt => 
      opt.name === "快速宅配" || opt.name === "Express Shipping" || opt.id === "so_01K2K7ABWDMMYAT5NMQ0N49P4Y"
    )

    if (expressOption) {
      try {
        const updatedExpress = await fulfillmentModuleService.updateShippingOptions(
          expressOption.id,
          {
            name: "快速宅配",
            price_type: "flat",
            amount: 10000, // $100 TWD (以分為單位)
            type: {
              label: "快速宅配", 
              description: "1-2個工作天送達，運費 $100",
              code: "express_taiwan"
            },
            data: {
              description: "台灣本島快速配送，1-2個工作天送達，運費 $100",
              estimated_delivery: "1-2個工作天",
              price: 100,
              currency: "TWD"
            }
          }
        )
        console.log(`✅ 更新快速宅配: ${updatedExpress.name} - $100`)
      } catch (error) {
        console.log(`❌ 快速宅配價格更新失敗: ${error.message}`)
      }
    } else {
      console.log("⚠️  找不到快速宅配選項")
    }

    console.log("\n4. 驗證價格設定...")
    
    // 重新獲取所有選項進行驗證
    const finalOptions = await fulfillmentModuleService.listShippingOptions({})
    const taiwanOptions = finalOptions.filter(opt => 
      opt.name?.includes("宅配") || opt.provider_id === "manual_manual"
    )
    
    console.log(`\n🎉 台灣配送價格設置完成！`)
    console.log(`📋 當前配送選項與價格:`)
    taiwanOptions.forEach((opt, index) => {
      const price = opt.amount ? (opt.amount / 100).toFixed(0) : 'N/A'
      console.log(`  ${index + 1}. ${opt.name}`)
      console.log(`     💰 價格: $${price} TWD`)
      console.log(`     📦 類型: ${opt.price_type}`)
      console.log(`     📝 描述: ${opt.type?.description || 'N/A'}`)
      console.log(`     🆔 ID: ${opt.id}`)
      console.log('')
    })

    console.log("✅ 設定完成！現在可以測試前端結帳流程了。")

  } catch (error) {
    console.error("❌ 價格設定失敗:", error)
    throw error
  }
}
