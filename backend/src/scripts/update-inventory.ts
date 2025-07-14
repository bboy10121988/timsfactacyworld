import { ExecArgs } from "@medusajs/types"

export default async function updateInventory({ container }: ExecArgs) {
  try {
    // 獲取產品服務
    const productService = container.resolve("productVariantService")
    // 嘗試使用另一個服務名稱
    console.log("嘗試使用替代服務名稱...")
    const productVariantService = container.resolve("variantService")
    
    // 要更新的變體 IDs
    const variantIds = [
      "variant_01JXKK401SB30GWZ4EZH0DFM3A", // 綠M
      "variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q"  // 綠色L
    ]
    
    console.log("嘗試更新變體:", variantIds)
    
    // 方案1: 設置變體為允許缺貨訂購
    for (const variantId of variantIds) {
      try {
        const updated = await productService.update(variantId, {
          allow_backorder: true
        })
        console.log(`變體 ${variantId} 已更新為允許缺貨訂購:`, updated)
      } catch (variantError) {
        console.error(`更新變體 ${variantId} 失敗:`, variantError)
      }
    }
    
    return { success: true, message: "庫存已更新" }
  } catch (error) {
    console.error("更新庫存時發生錯誤:", error)
    return { success: false, error }
  }
}
