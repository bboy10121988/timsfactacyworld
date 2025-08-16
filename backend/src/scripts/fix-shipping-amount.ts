import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function fixShippingWithManualSQL({ container }) {
  console.log("🔧 直接透過資料庫修正台灣運輸選項...");

  try {
    // 先檢查是否有台灣履約設定的服務區域
    const remoteQuery = container.resolve("remoteQuery");
    
    // 檢查台灣履約設定
    const taiwanFulfillmentSet = await remoteQuery({
      entryPoint: "fulfillment_set",
      fields: ["id", "name", "type"],
      filters: { id: "fuset_tw_default_001" }
    });
    
    console.log("🏭 台灣履約設定:", taiwanFulfillmentSet);
    
    if (taiwanFulfillmentSet.length === 0) {
      console.log("❌ 台灣履約設定不存在，無法繼續");
      return;
    }

    // 檢查現有服務區域
    const serviceZones = await remoteQuery({
      entryPoint: "service_zone",
      fields: ["id", "name", "fulfillment_set_id"],
    });
    
    console.log("🌐 現有服務區域:", serviceZones);
    
    // 查找是否已有台灣履約設定的服務區域
    const taiwanServiceZone = serviceZones.find(sz => 
      sz.fulfillment_set_id === "fuset_tw_default_001"
    );
    
    if (!taiwanServiceZone) {
      console.log("❌ 沒有找到台灣履約設定的服務區域");
      console.log("💡 建議：需要為台灣履約設定創建對應的服務區域");
      return;
    }
    
    console.log("✅ 找到台灣服務區域:", taiwanServiceZone);
    
    // 現在讓我們更新運輸選項，讓它們指向正確的服務區域
    // 但首先檢查此方法是否可行
    console.log("📦 將運輸選項重新關聯到台灣服務區域...");
    
    // 暫時的做法：如果沒有適當的台灣服務區域，我們將把運輸選項的價格設置到 amount 字段
    // 這樣 API 就能夠正確返回運輸選項
    console.log("💰 嘗試設置運輸選項的 amount 字段...");
    
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "amount", "data"],
      filters: {
        name: ["標準宅配", "快速宅配"]
      }
    });
    
    console.log("📦 當前台灣運輸選項:", shippingOptions);
    
    // 由於 amount 欄位為 null，這就是為什麼 API 不回傳選項的原因
    // 讓我們直接從 data 中提取價格，設置 amount
    for (const option of shippingOptions) {
      const price = option.data?.price;
      if (price && !option.amount) {
        console.log(`💰 運輸選項 ${option.name} 需要設置 amount: ${price}`);
      }
    }
    
    console.log("✅ 分析完成!");
    console.log("💡 問題根源：運輸選項的 amount 字段為空，需要設置正確的價格");

  } catch (error) {
    console.error("❌ 修正失敗:", error);
  }
}
