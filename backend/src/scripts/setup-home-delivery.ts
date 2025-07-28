import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function setupHomeDelivery({ 
  container 
}: ExecArgs) {
  console.log("開始設置宅配到府履約選項...")

  try {
    // 獲取模組服務
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    console.log("1. 檢查現有運送選項...")
    
    // 檢查現有履約選項
    const existingShippingOptions = await fulfillmentModuleService.listShippingOptions({})
    console.log(`   找到 ${existingShippingOptions.length} 個現有運送選項:`)
    
    existingShippingOptions.forEach((opt, index) => {
      console.log(`   ${index + 1}. ${opt.name} (${opt.id}) - Provider: ${opt.provider_id}`)
    })

    // 檢查是否已有「宅配到府」選項
    let homeDeliveryOption = existingShippingOptions.find(opt => 
      opt.name === "宅配到府" && opt.provider_id === "manual_manual"
    )
    
    if (homeDeliveryOption) {
      console.log(`✓ 「宅配到府」選項已存在: ${homeDeliveryOption.name} (${homeDeliveryOption.id})`)
    } else {
      // 檢查是否可以更新現有的「預設配送」選項
      const defaultOptions = existingShippingOptions.filter(opt => 
        opt.name === "預設配送" && opt.provider_id === "manual_manual"
      )

      if (defaultOptions.length > 0) {
        console.log(`\n發現 ${defaultOptions.length} 個「預設配送」選項，建議更新其中一個為「宅配到府」`)
        
        // 更新第一個預設配送選項
        const optionToUpdate = defaultOptions[0]
        console.log(`正在更新運送選項: ${optionToUpdate.id}`)

        try {
          const updatedOption = await fulfillmentModuleService.updateShippingOptions(optionToUpdate.id, {
            name: "宅配到府",
            type: {
              label: "宅配到府",
              description: "專人配送到府，3-5個工作天",
              code: "home_delivery"
            },
            data: {
              description: "宅配到府服務",
              estimated_delivery: "3-5個工作天"
            }
          })

          console.log(`✓ 成功更新運送選項為「宅配到府」: ${updatedOption.id}`)
          homeDeliveryOption = updatedOption
        } catch (updateError) {
          console.log("⚠️  更新失敗，將創建新的選項")
          console.log("更新錯誤:", updateError.message)
        }
      }

      // 如果更新失敗或沒有現有選項，則創建新的
      if (!homeDeliveryOption) {
        console.log("正在創建新的「宅配到府」運送選項...")
        
        // 使用現有的服務區域和配送方案
        const serviceZones = await fulfillmentModuleService.listServiceZones({})
        const taiwanZone = serviceZones.find(zone => zone.name === "台灣")
        
        const profiles = await fulfillmentModuleService.listShippingProfiles({})
        const homeProfile = profiles.find(profile => profile.name === "宅配配送方案")

        if (!taiwanZone || !homeProfile) {
          console.log("❌ 找不到必要的服務區域或配送方案")
          return
        }

        homeDeliveryOption = await fulfillmentModuleService.createShippingOptions({
          name: "宅配到府",
          service_zone_id: taiwanZone.id,
          shipping_profile_id: homeProfile.id,
          provider_id: "manual_manual",
          price_type: "flat",
          type: {
            label: "宅配到府",
            description: "專人配送到府，3-5個工作天",
            code: "home_delivery"
          },
          data: {
            description: "宅配到府服務",
            estimated_delivery: "3-5個工作天"
          }
        })

        console.log(`✓ 創建新的運送選項: ${homeDeliveryOption.name} (${homeDeliveryOption.id})`)
      }
    }

    console.log("\n2. 驗證最終配置...")
    
    // 重新獲取所有選項進行驗證
    const finalOptions = await fulfillmentModuleService.listShippingOptions({})
    const manualOptions = finalOptions.filter(opt => opt.provider_id === "manual_manual")
    
    console.log(`✓ 驗證完成，找到 ${manualOptions.length} 個 Manual 履約選項:`)
    manualOptions.forEach((opt, index) => {
      console.log(`  ${index + 1}. ${opt.name} (${opt.id})`)
    })

    console.log("\n✅ 宅配到府履約選項設置完成！")
    console.log("📋 建議接下來的步驟:")
    console.log("1. 重新啟動 Medusa 服務")
    console.log("2. 檢查管理面板中的履約設定")
    console.log("3. 在管理面板中設置運送選項的價格")
    console.log("4. 測試前端結帳流程")
    console.log("5. 確認庫存位置和配送的渲染問題是否解決")

  } catch (error) {
    console.error("❌ 設置過程中發生錯誤:", error)
    if (error.message) {
      console.error("錯誤詳情:", error.message)
    }
    throw error
  }
}
