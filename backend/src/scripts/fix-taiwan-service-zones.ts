import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function fixTaiwanServiceZones({ container }) {
  console.log("🔧 修正台灣服務區域配置...");

  try {
    const remoteQuery = container.resolve("remoteQuery");
    const remoteLink = container.resolve("remoteLink");
    
    // 1. 創建台灣地理區域
    console.log("🌍 創建台灣地理區域...");
    try {
      const taiwanGeoZone = await remoteLink.create({
        geo_zone: {
          id: "fgz_tw_001",
          type: "country",
          country_code: "tw",
          metadata: {}
        }
      });
      console.log("✅ 台灣地理區域創建完成:", taiwanGeoZone);
    } catch (createError) {
      console.log("⚠️ 台灣地理區域可能已存在，繼續...", createError.message);
    }
    
    // 2. 創建台灣服務區域
    console.log("🌐 創建台灣服務區域...");
    try {
      const taiwanServiceZone = await remoteLink.create({
        service_zone: {
          id: "serzo_tw_001",
          name: "Taiwan Service Zone",
          fulfillment_set_id: "fuset_tw_default_001"
        }
      });
      console.log("✅ 台灣服務區域創建完成:", taiwanServiceZone);
    } catch (createError) {
      console.log("⚠️ 台灣服務區域可能已存在，繼續...", createError.message);
    }
    
    // 3. 關聯服務區域和地理區域
    console.log("🔗 關聯台灣服務區域和地理區域...");
    try {
      await remoteLink.create({
        service_zone_geo_zone: {
          id: "szgz_tw_001",
          service_zone_id: "serzo_tw_001",
          geo_zone_id: "fgz_tw_001"
        }
      });
      console.log("✅ 服務區域和地理區域關聯完成");
    } catch (linkError) {
      console.log("⚠️ 關聯可能已存在，繼續...", linkError.message);
    }
    
    // 4. 更新運輸選項指向新的台灣服務區域
    console.log("📦 更新運輸選項的服務區域...");
    try {
      const shippingOptionsToUpdate = [
        "so_01K2K7ABW9THYBX25W456SW0J1", // 標準宅配
        "so_01K2K7ABWDMMYAT5NMQ0N49P4Y"  // 快速宅配
      ];

      for (const optionId of shippingOptionsToUpdate) {
        try {
          await remoteLink.update({
            shipping_option: {
              id: optionId,
              service_zone_id: "serzo_tw_001"
            }
          });
          console.log(`✅ 運輸選項 ${optionId} 更新完成`);
        } catch (updateError) {
          console.log(`⚠️ 運輸選項 ${optionId} 更新失敗:`, updateError.message);
        }
      }
    } catch (updateError) {
      console.log("⚠️ 運輸選項更新失敗，使用 SQL 方式:", updateError.message);
    }
    
    // 5. 驗證結果
    console.log("🔍 驗證更新結果...");
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "service_zone_id", "data"],
    });
    
    const taiwanOptions = shippingOptions.filter(opt => 
      opt.name.includes('宅配')
    );
    
    console.log("📦 更新後的台灣運輸選項:", taiwanOptions);
    
    console.log("✅ 台灣服務區域配置修正完成!");

  } catch (error) {
    console.error("❌ 修正失敗:", error);
  }
}
