"use strict";

export default async function ({ container, configModule }) {
  try {
    console.log("=== 關聯配送選項到台灣區域 ===");
    
    // 使用 fulfillment 和 region 服務
    const fulfillmentService = container.resolve("fulfillment");
    const regionService = container.resolve("regionService");
    
    if (!fulfillmentService || !regionService) {
      console.log("無法解析必要的服務");
      // 列出所有可用的服務
      console.log("可用服務:");
      const services = container.registrations;
      Object.keys(services).forEach(service => console.log(`- ${service}`));
      return;
    }
    
    console.log("找到必要的服務");
    
    // 1. 獲取所有配送選項
    const shippingOptions = await fulfillmentService.listShippingOptions();
    
    // 2. 找到預設配送選項
    const defaultOption = shippingOptions.find(option => 
      option.name === "預設配送" || option.name.includes("預設"));
    
    if (!defaultOption) {
      console.log("沒有找到預設配送選項，請先創建一個");
      return;
    }
    
    console.log(`找到預設配送選項: ${defaultOption.name} (ID: ${defaultOption.id})`);
    
    // 3. 獲取所有區域 - 使用 regionService
    let regions = [];
    
    try {
      // 嘗試不同的方法來獲取區域
      if (typeof regionService.list === 'function') {
        console.log("使用 regionService.list 獲取區域");
        regions = await regionService.list();
      } else if (typeof regionService.listAndCount === 'function') {
        console.log("使用 regionService.listAndCount 獲取區域");
        const [result] = await regionService.listAndCount({});
        regions = result;
      } else {
        console.log("嘗試使用 regionService.retrieve 獲取台灣區域");
        // 列出所有 regionService 方法
        console.log("區域服務方法:");
        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(regionService)));
      }
    } catch (regionError) {
      console.log("獲取區域時出錯:", regionError.message);
    }
    
    if (!regions || regions.length === 0) {
      console.log("無法獲取區域列表，嘗試列出資料庫中的區域");
      // 嘗試直接從資料庫獲取區域
      try {
        const manager = container.resolve("manager");
        const result = await manager.query("SELECT id, name FROM region");
        regions = result;
        console.log(`從資料庫找到 ${regions.length} 個區域`);
      } catch (dbError) {
        console.log("從資料庫獲取區域失敗:", dbError.message);
        return;
      }
    }
    
    if (!regions || regions.length === 0) {
      console.log("無法獲取任何區域列表");
      return;
    }
    
    console.log(`找到 ${regions.length} 個區域`);
    
    // 4. 找到台灣區域
    const taiwanRegion = regions.find(region => 
      region.name === "Taiwan" || 
      region.name === "台灣" || 
      region.name.includes("Taiwan") || 
      region.name.includes("台灣"));
    
    if (!taiwanRegion) {
      console.log("沒有找到台灣區域，列出所有可用區域:");
      regions.forEach((region, index) => {
        console.log(`${index + 1}. ${region.name} (ID: ${region.id})`);
      });
      return;
    }
    
    console.log(`找到台灣區域: ${taiwanRegion.name} (ID: ${taiwanRegion.id})`);
    
    // 5. 檢查配送選項是否已關聯到區域
    if (defaultOption.region_id === taiwanRegion.id) {
      console.log("預設配送選項已經關聯到台灣區域，無需更改");
      return;
    }
    
    // 6. 關聯配送選項到台灣區域
    console.log("開始關聯配送選項到台灣區域...");
    
    try {
      // 直接使用資料庫更新配送選項
      const manager = container.resolve("manager");
      const result = await manager.query(
        `UPDATE shipping_option SET region_id = ? WHERE id = ?`,
        [taiwanRegion.id, defaultOption.id]
      );
      
      console.log("✅ 成功將預設配送選項關聯到台灣區域");
      console.log("資料庫更新結果:", result);
    } catch (updateError) {
      console.log("更新配送選項時出錯:", updateError.message);
      console.log(updateError.stack);
    }
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}
