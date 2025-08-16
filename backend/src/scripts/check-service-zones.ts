import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkServiceZones({ container }) {
  console.log("🔍 檢查服務區域配置...");

  try {
    const remoteQuery = container.resolve("remoteQuery");
    
    // 1. 查詢運輸選項
    const shippingOptions = await remoteQuery({
      entryPoint: "shipping_option",
      fields: ["id", "name", "service_zone_id", "data", "amount"],
    });
    
    console.log("📦 運輸選項:", shippingOptions);
    
    // 2. 查詢服務區域
    const serviceZones = await remoteQuery({
      entryPoint: "service_zone", 
      fields: ["id", "name", "fulfillment_set_id"],
    });
    
    console.log("🌐 服務區域:", serviceZones);
    
    // 3. 查詢履約設定
    const fulfillmentSets = await remoteQuery({
      entryPoint: "fulfillment_set",
      fields: ["id", "name", "type", "location_id"],
    });
    
    console.log("📋 履約設定:", fulfillmentSets);
    
    // 4. 查詢地理區域
    const geoZones = await remoteQuery({
      entryPoint: "geo_zone",
      fields: ["id", "type", "country_code", "metadata"],
    });
    
    console.log("🌍 地理區域:", geoZones);
    
    // 5. 查詢服務區域與地理區域的關聯
    try {
      const serviceZoneGeoZones = await remoteQuery({
        entryPoint: "service_zone_geo_zone",
        fields: ["service_zone_id", "geo_zone_id"],
      });
      
      console.log("🔗 服務區域與地理區域關聯:", serviceZoneGeoZones);
    } catch (error) {
      console.log("⚠️ 無法查詢服務區域與地理區域關聯:", error.message);
    }

    console.log("✅ 檢查完成!");

  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  }
}
