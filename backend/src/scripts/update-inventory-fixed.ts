import { ExecArgs } from "@medusajs/types"

export default async function updateInventory({ container }: ExecArgs) {
  try {
    // 找出所有可用的服務
    console.log("所有可用的服務:", Object.keys(container.registrations).filter(name => 
      name.toLowerCase().includes("variant") || 
      name.toLowerCase().includes("product")
    ));
    
    // 要更新的變體 IDs
    const variantIds = [
      "variant_01JXKK401SB30GWZ4EZH0DFM3A", // 綠M
      "variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q"  // 綠色L
    ]
    
    console.log("嘗試更新變體:", variantIds)
    
    // 嘗試直接使用 productService
    try {
      const productService = container.resolve("productService") as any
      for (const variantId of variantIds) {
        try {
          console.log(`嘗試使用 productService 更新變體 ${variantId}...`)
          const variant = await productService.retrieveVariant(variantId)
          console.log("找到變體:", variant)
          
          const updated = await productService.updateVariant(variant.product_id, variantId, {
            allow_backorder: true,
            manage_inventory: false,
            inventory_quantity: 10
          })
          
          console.log(`變體 ${variantId} 已更新:`, updated)
        } catch (variantError) {
          console.error(`使用 productService 更新變體 ${variantId} 失敗:`, variantError)
        }
      }
    } catch (error) {
      console.error("使用 productService 失敗:", error)
    }
    
    return { success: true, message: "嘗試更新庫存完成" }
  } catch (error) {
    console.error("更新庫存時發生錯誤:", error)
    return { success: false, error }
  }
}
