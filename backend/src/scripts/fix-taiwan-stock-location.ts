import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function fixTaiwanStockLocation({ container }: { container: MedusaContainer }) {
  console.log("🔧 修復台灣庫存地點的國家代碼")
  
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // 1. 檢查當前的台灣庫存地點
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "name", 
      "address.id",
      "address.country_code",
      "address.address_1"
    ],
    filters: { id: "sloc_tw_warehouse_001" }
  });
  
  if (stockLocations.length === 0) {
    console.log("❌ 找不到台灣庫存地點")
    return
  }
  
  const stockLocation = stockLocations[0]
  console.log("📍 當前庫存地點:")
  console.log(`名稱: ${stockLocation.name}`)
  console.log(`地址 ID: ${stockLocation.address?.id || 'N/A'}`)
  console.log(`國家代碼: ${stockLocation.address?.country_code || '未設定'}`)
  
  // 2. 如果沒有地址或國家代碼不正確，則更新
  if (!stockLocation.address?.country_code || stockLocation.address.country_code !== 'tw') {
    console.log("\n🔨 更新庫存地點地址...")
    
    try {
      // 使用 remote query 來更新
      const updateData = {
        address: {
          country_code: "tw",
          address_1: "台灣台北市信義區信義路五段7號",
          city: "台北市",
          postal_code: "11049"
        }
      }
      
      // 由於我們不能直接更新，讓我們使用 SQL 查詢
      console.log("需要手動執行以下 SQL 來修復:")
      console.log(`
      UPDATE stock_location_address 
      SET country_code = 'tw', 
          address_1 = '台灣台北市信義區信義路五段7號',
          city = '台北市',
          postal_code = '11049'
      WHERE id = '${stockLocation.address?.id}';
      `)
      
      // 或者我們可以嘗試通過模組服務來更新
      const stockLocationModule = container.resolve("stockLocationModuleService")
      if (stockLocationModule && stockLocation.address?.id) {
        await stockLocationModule.updateStockLocationAddress(
          stockLocation.address.id,
          {
            country_code: "tw",
            address_1: "台灣台北市信義區信義路五段7號",
            city: "台北市",
            postal_code: "11049"
          }
        )
        console.log("✅ 地址更新成功")
      }
      
    } catch (error: any) {
      console.error("❌ 更新失敗:", error.message)
      console.log("\n💡 手動 SQL 更新方案:")
      console.log("請在資料庫中執行:")
      console.log(`UPDATE stock_location_address SET country_code = 'tw' WHERE stock_location_id = 'sloc_tw_warehouse_001';`)
    }
  } else {
    console.log("✅ 庫存地點的國家代碼已正確設定")
  }
  
  // 3. 再次檢查更新後的結果
  const { data: updatedLocations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "name",
      "address.country_code"
    ],
    filters: { id: "sloc_tw_warehouse_001" }
  });
  
  if (updatedLocations[0]) {
    console.log("\n📊 更新後的庫存地點:")
    console.log(`名稱: ${updatedLocations[0].name}`)
    console.log(`國家代碼: ${updatedLocations[0].address?.country_code || '仍未設定'}`)
  }
}
