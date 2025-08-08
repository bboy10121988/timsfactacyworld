"use strict";

export default async function ({ container }) {
  try {
    // 獲取履行服務
    const fulfillmentService = container.resolve("fulfillment");
    
    console.log("=== 履行服務信息 ===");
    console.log("服務方法:", Object.getOwnPropertyNames(Object.getPrototypeOf(fulfillmentService)).filter(m => m !== 'constructor'));
    
    // 檢查配送選項
    try {
      const shippingOptions = await fulfillmentService.listShippingOptions({});
      console.log("\n=== 配送選項 ===");
      console.log(JSON.stringify(shippingOptions, null, 2));
      
      if (shippingOptions.length === 0) {
        console.log("沒有找到任何配送選項");
      }
    } catch (err) {
      console.error("獲取配送選項時出錯:", err);
    }
    
    // 檢查區域
    try {
      const regionService = container.resolve("region");
      console.log("\n=== 區域服務方法 ===");
      console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(regionService)).filter(m => m !== 'constructor'));
      
      // 嘗試使用 retrieveAll 方法
      const regions = await regionService.retrieveAll();
      
      console.log("\n=== 區域信息 ===");
      console.log(JSON.stringify(regions, null, 2));
      
      if (regions.length === 0) {
        console.log("沒有找到任何區域");
      }
    } catch (err) {
      console.error("獲取區域時出錯:", err);
    }
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
  }
}
