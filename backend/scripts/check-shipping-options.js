"use strict";

export default async function ({ container, configModule }) {
  try {
    console.log("=== 查詢配送選項 ===");
    
    // 使用 fulfillment 服務查詢配送選項
    try {
      const fulfillmentService = container.resolve("fulfillment");
      
      if (fulfillmentService) {
        console.log("找到 fulfillment 服務");
        
        // 使用 listShippingOptions 方法獲取配送選項
        const shippingOptions = await fulfillmentService.listShippingOptions();
        
        console.log("\n=== 配送選項 ===");
        if (shippingOptions.length === 0) {
          console.log("沒有找到配送選項");
        } else {
          console.log(`找到 ${shippingOptions.length} 個配送選項:`);
          shippingOptions.forEach((option, index) => {
            console.log(`\n選項 ${index + 1}:`);
            console.log(`- ID: ${option.id}`);
            console.log(`- 名稱: ${option.name}`);
            console.log(`- 金額: ${option.amount || 0}`);
            console.log(`- 數據: ${JSON.stringify(option.data)}`);
            console.log(`- 區域: ${option.region_id || '未定義'}`);
            console.log(`- 提供者: ${option.provider_id}`);
            console.log(`- 建立時間: ${option.created_at}`);
            console.log(`- 要求物流配送: ${option.requires_shipping ? '是' : '否'}`);
          });
          
          // 查找預設配送選項
          const defaultOption = shippingOptions.find(option => option.name === "預設配送" || option.name.includes("預設"));
          if (defaultOption) {
            console.log("\n=== 預設配送選項 ===");
            console.log(`- ID: ${defaultOption.id}`);
            console.log(`- 名稱: ${defaultOption.name}`);
            console.log(`- 金額: ${defaultOption.amount || 0}`);
            console.log(`- 數據: ${JSON.stringify(defaultOption.data)}`);
            console.log(`- 區域: ${defaultOption.region_id || '未定義'}`);
            console.log(`- 提供者: ${defaultOption.provider_id}`);
            console.log(`- 建立時間: ${defaultOption.created_at}`);
            console.log(`- 要求物流配送: ${defaultOption.requires_shipping ? '是' : '否'}`);
          } else {
            console.log("\n沒有找到名為「預設配送」的選項");
          }
        }
        
        // 獲取區域信息
        try {
          const regionService = container.resolve("region");
          if (regionService) {
            console.log("\n=== 區域信息 ===");
            
            // 嘗試不同的方法來獲取區域列表
            let regions = [];
            if (typeof regionService.list === 'function') {
              regions = await regionService.list();
            } else if (typeof regionService.listAndCount === 'function') {
              const [result] = await regionService.listAndCount();
              regions = result;
            } else {
              console.log("無法找到獲取區域列表的方法");
              
              // 輸出 region 服務的所有方法
              console.log("region 服務方法:");
              console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(regionService)));
            }
            
            if (regions.length === 0) {
              console.log("沒有找到區域");
            } else {
              console.log(`找到 ${regions.length} 個區域:`);
              regions.forEach((region, index) => {
                console.log(`\n區域 ${index + 1}:`);
                console.log(`- ID: ${region.id}`);
                console.log(`- 名稱: ${region.name}`);
                console.log(`- 貨幣: ${region.currency_code}`);
                
                // 顯示區域關聯的配送選項
                const regionShippingOptions = shippingOptions.filter(option => option.region_id === region.id);
                if (regionShippingOptions.length > 0) {
                  console.log(`- 關聯的配送選項: ${regionShippingOptions.length} 個`);
                  regionShippingOptions.forEach((option, idx) => {
                    console.log(`  ${idx + 1}. ${option.name} (ID: ${option.id})`);
                  });
                } else {
                  console.log("- 沒有關聯的配送選項");
                }
              });
            }
          }
        } catch (e) {
          console.log("無法獲取區域信息:", e.message);
          console.log(e.stack);
        }
        
        // 檢查解決方案
        console.log("\n=== 問題診斷與解決方案 ===");
        if (shippingOptions.length > 0) {
          const defaultOption = shippingOptions.find(option => option.name === "預設配送" || option.name.includes("預設"));
          if (defaultOption && !defaultOption.region_id) {
            console.log("發現問題: 預設配送選項沒有關聯到任何區域");
            console.log("建議解決方案: 需要將預設配送選項關聯到一個區域");
            console.log("可以通過後台管理介面 -> 設置 -> 配送選項 -> 編輯預設配送 來設置區域");
          }
        }
      }
    } catch (error) {
      console.log("無法使用 fulfillment 服務:", error.message);
      console.log(error.stack);
    }
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}
