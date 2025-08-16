import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function fixTaiwanShippingOptions({ container }) {
  console.log("🔧 修正台灣運輸選項配置...");

  const fulfillmentModuleService = container.resolve("fulfillmentModuleService");
  const regionModuleService = container.resolve("regionModuleService");
  
  try {
    // 1. 獲取台灣地區
    const regions = await regionModuleService.listRegions({ name: "Taiwan" });
    if (!regions.length) {
      console.error("❌ 找不到台灣地區");
      return;
    }
    
    const taiwanRegion = regions[0];
    console.log("📍 找到台灣地區:", taiwanRegion.id, taiwanRegion.name);

    // 2. 獲取運輸選項
    const shippingOptions = await fulfillmentModuleService.listShippingOptions();
    console.log("📦 找到運輸選項數量:", shippingOptions.length);
    
    const taiwanOptions = shippingOptions.filter(option => 
      option.name.includes('宅配') || 
      option.name.includes('標準') || 
      option.name.includes('快速')
    );

    console.log("🇹🇼 台灣相關的運輸選項:", taiwanOptions.map(o => ({
      id: o.id, 
      name: o.name,
      service_zone_id: o.service_zone_id
    })));

    // 3. 獲取服務區域
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();
    console.log("🏢 fulfillmentSets:", fulfillmentSets.map(fs => ({
      id: fs.id,
      name: fs.name,
      location_id: fs.location_id
    })));

    // 4. 創建包含台灣的地理區域
    let taiwanGeoZone;
    try {
      const existingGeoZones = await fulfillmentModuleService.listGeoZones({ 
        type: "country" 
      });
      
      taiwanGeoZone = existingGeoZones.find(gz => 
        gz.metadata && (
          gz.metadata.iso_2 === 'tw' || 
          gz.metadata.country_code === 'tw' ||
          JSON.stringify(gz.metadata).includes('tw')
        )
      );

      if (!taiwanGeoZone) {
        console.log("🌍 創建台灣地理區域...");
        taiwanGeoZone = await fulfillmentModuleService.createGeoZones({
          type: "country",
          metadata: {
            iso_2: "tw",
            country_code: "tw",
            name: "Taiwan"
          }
        });
        console.log("✅ 創建台灣地理區域成功:", taiwanGeoZone.id);
      } else {
        console.log("📍 找到現有台灣地理區域:", taiwanGeoZone.id);
      }
    } catch (geoError) {
      console.log("⚠️ 地理區域處理失敗，繼續其他步驟:", geoError.message);
    }

    // 5. 檢查服務區域是否正確關聯
    if (taiwanOptions.length > 0) {
      for (const option of taiwanOptions) {
        console.log(`🔄 檢查運輸選項 ${option.name} (${option.id}) 的配置...`);
        
        if (option.service_zone_id) {
          try {
            const serviceZone = await fulfillmentModuleService.retrieveServiceZone(
              option.service_zone_id
            );
            console.log(`📍 服務區域 ${serviceZone.name} (${serviceZone.id}) 已存在`);
          } catch (error) {
            console.log(`⚠️ 服務區域 ${option.service_zone_id} 可能有問題:`, error.message);
          }
        }
      }
    }

    console.log("✅ 台灣運輸選項配置檢查完成!");
    
  } catch (error) {
    console.error("❌ 修正失敗:", error);
  }
}
