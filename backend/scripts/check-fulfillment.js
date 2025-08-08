"use strict";

export default async function ({ container }) {
  try {
    // 獲取履行服務
    const fulfillmentService = container.resolve("fulfillment");
    
    console.log("=== 履行服務信息 ===");
    console.log("服務方法:", Object.getOwnPropertyNames(Object.getPrototypeOf(fulfillmentService)).filter(m => m !== 'constructor'));
    
    // 獲取可用的履行選項
    try {
      const providers = await fulfillmentService.listFulfillmentOptions();
      console.log("\n=== 可用的履行選項 ===");
      console.log(JSON.stringify(providers, null, 2));
    } catch (err) {
      console.error("獲取履行選項時出錯:", err.message);
    }
    
    // 檢查區域
    const regionService = container.resolve("region");
    const regions = await regionService.list({});
    
    if (regions.length > 0) {
      console.log("\n=== 區域信息 ===");
      
      for (const region of regions) {
        console.log(`\n區域名稱: ${region.name}`);
        console.log(`區域ID: ${region.id}`);
        
        if (region.fulfillment_providers && region.fulfillment_providers.length > 0) {
          console.log("履行提供者:", region.fulfillment_providers);
        } else {
          console.log("此區域沒有設置履行提供者");
        }
        
        try {
          const fulfillmentOptions = await fulfillmentService.listFulfillmentOptions({
            region_id: region.id,
          });
          console.log("區域配送選項:", JSON.stringify(fulfillmentOptions, null, 2));
        } catch (err) {
          console.error(`獲取區域 ${region.id} 的配送選項時出錯:`, err.message);
        }
      }
    } else {
      console.log("\n沒有找到任何區域");
    }
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
  }
}
