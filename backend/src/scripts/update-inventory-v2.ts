import { ExecArgs } from "@medusajs/types"

export default async function updateInventory({ container }: ExecArgs) {
  try {
    console.log("開始更新庫存...")
    
    // 在 Medusa v2 中，使用 product module service
    const productModuleService = container.resolve("product")
    
    // 變體 IDs 和要設定的庫存數量
    const updates = [
      { id: "variant_01JXKK401SB30GWZ4EZH0DFM3A", inventory: 10 }, // 綠M - 10件庫存
      { id: "variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q", inventory: 5 }   // 綠色L - 5件庫存
    ]
    
    for (const update of updates) {
      try {
        console.log(`正在更新變體 ${update.id}，設定庫存為 ${update.inventory}...`)
        
        // 更新變體
        await productModuleService.updateProductVariants({
          id: update.id,
          inventory_quantity: update.inventory,
          manage_inventory: true,
          allow_backorder: false
        })
        
        console.log(`✅ 變體 ${update.id} 庫存已更新為 ${update.inventory}`)
        
        // 驗證更新
        const variant = await productModuleService.retrieveProductVariant(update.id)
        console.log(`驗證: 變體 ${update.id} 已更新:`, variant.title)
        
      } catch (error) {
        console.error(`❌ 更新變體 ${update.id} 失敗:`, error)
      }
    }
    
    console.log("庫存更新完成！")
    return { success: true }
    
  } catch (error) {
    console.error("更新庫存時發生錯誤:", error)
    return { success: false, error }
  }
}
