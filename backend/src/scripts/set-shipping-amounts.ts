import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function setShippingOptionAmounts({ container }) {
  console.log("💰 設置運輸選項的 amount 字段...");

  try {
    const remoteQuery = container.resolve("remoteQuery");
    
    // 獲取運輸選項
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "amount", "data", "price_type"],
    });
    
    console.log("📦 所有運輸選項:", shippingOptions);
    
    // 找出台灣相關的運輸選項
    const taiwanOptions = shippingOptions.filter(option => 
      option.name.includes('宅配') || 
      option.name.includes('標準') || 
      option.name.includes('快速')
    );
    
    console.log("🇹🇼 台灣運輸選項:", taiwanOptions);
    
    if (taiwanOptions.length === 0) {
      console.log("❌ 找不到台灣運輸選項");
      return;
    }

    // 尝试另一种方法 - 通过 Admin API 进行更新
    console.log("🔧 嘗試通過 Admin API 更新運輸選項...");
    
    const adminApiUrl = "http://localhost:9000/admin";
    
    // 先获取 auth token (这是一个简化的示例)
    console.log("🔑 注意：需要 Admin API 權限來更新運輸選項");
    console.log("💡 建議使用以下步驟手動修正：");
    console.log("1. 登入 Medusa Admin 後台");
    console.log("2. 前往 Settings > Shipping");
    console.log("3. 編輯台灣運輸選項");
    console.log("4. 確保價格設定正確");
    
    // 顯示需要更新的詳細信息
    taiwanOptions.forEach(option => {
      const targetPrice = option.data?.price;
      console.log(`📦 運輸選項 ${option.name}:`);
      console.log(`   - ID: ${option.id}`);
      console.log(`   - 當前 amount: ${option.amount}`);
      console.log(`   - 目標 amount: ${targetPrice}`);
      console.log(`   - price_type: ${option.price_type}`);
    });

    console.log("✅ 分析完成!");
    
  } catch (error) {
    console.error("❌ 設置失敗:", error);
  }
}
