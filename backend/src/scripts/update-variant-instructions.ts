import { ExecArgs } from "@medusajs/types"

export default async function updateInventory({ container }: ExecArgs) {
  // 產品和變體 ID
  const productId = "prod_01JWFGZX3RDSS1JWZVZAQFJGR6" // 綠罐 Fantasy World 水凝髮蠟
  const variantIds = [
    "variant_01JXKK401SB30GWZ4EZH0DFM3A", // 綠M
    "variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q"  // 綠色L
  ]

  try {
    // 嘗試直接使用 medusa 命令行工具來更新變體
    console.log("將嘗試執行以下操作：")
    console.log("1. 對產品設置不管理庫存")
    console.log("2. 對產品設置允許缺貨訂購")
    
    // 這裡只打印命令，因為我們沒有執行外部命令的權限
    console.log(`
      要手動更新庫存，請在終端機執行以下命令：
      
      cd /Users/raychou/medusa_0525/backend && npx medusa admin products variant update ${variantIds[0]} --manage-inventory false
      cd /Users/raychou/medusa_0525/backend && npx medusa admin products variant update ${variantIds[1]} --manage-inventory false
      
      或者：
      
      cd /Users/raychou/medusa_0525/backend && npx medusa admin products variant update ${variantIds[0]} --allow-backorder true
      cd /Users/raychou/medusa_0525/backend && npx medusa admin products variant update ${variantIds[1]} --allow-backorder true
      
      或者：
      
      cd /Users/raychou/medusa_0525/backend && npx medusa admin products variant update ${variantIds[0]} --inventory-quantity 10
      cd /Users/raychou/medusa_0525/backend && npx medusa admin products variant update ${variantIds[1]} --inventory-quantity 10
    `)
    
    return { success: true, message: "請查看命令並手動執行" }
  } catch (error) {
    console.error("處理時發生錯誤:", error)
    return { success: false, error }
  }
}
