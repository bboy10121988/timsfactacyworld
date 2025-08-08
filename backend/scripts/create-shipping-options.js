"use strict";

export default async function ({ container }) {
  try {
    // 獲取履行服務
    const fulfillmentService = container.resolve("fulfillment");
    
    // 首先檢查是否已經有類似的配送選項
    const existingOptions = await fulfillmentService.listShippingOptions({});
    
    // 檢查是否已經有「快速宅配」
    const hasExpressDelivery = existingOptions.some(option => option.name === "快速宅配");
    
    if (!hasExpressDelivery) {
      // 建立一個新的「快速宅配」選項
      console.log("正在創建「快速宅配」配送選項...");
      
      // 取得現有的 service_zone_id 和 shipping_profile_id
      // 通常可以使用已存在的配送選項的值
      const serviceZoneId = existingOptions[0]?.service_zone_id;
      const shippingProfileId = existingOptions[0]?.shipping_profile_id;
      const providerId = existingOptions[0]?.provider_id;
      const typeId = existingOptions[0]?.shipping_option_type_id;
      
      try {
        // 創建新的配送選項
        await fulfillmentService.createShippingOptions({
          shippingOptions: [
            {
              name: "快速宅配",
              price_type: "flat",
              amount: 120, // 設定配送費用為120元
              data: {
                id: "manual-fulfillment"
              },
              metadata: {
                description: "1-2天送達"
              },
              service_zone_id: serviceZoneId,
              shipping_profile_id: shippingProfileId,
              provider_id: providerId,
              shipping_option_type_id: typeId
            }
          ]
        });
        
        console.log("「快速宅配」配送選項創建成功！");
      } catch (err) {
        console.error("創建「快速宅配」配送選項時出錯:", err);
      }
    } else {
      console.log("「快速宅配」配送選項已存在，不需要重新創建。");
    }
    
    // 檢查是否已經有「711 超商取貨」
    const has711Pickup = existingOptions.some(option => option.name === "711 超商取貨");
    
    if (!has711Pickup) {
      // 建立一個新的「711 超商取貨」選項
      console.log("正在創建「711 超商取貨」配送選項...");
      
      // 取得現有的 service_zone_id 和 shipping_profile_id
      const serviceZoneId = existingOptions[0]?.service_zone_id;
      const shippingProfileId = existingOptions[0]?.shipping_profile_id;
      const providerId = existingOptions[0]?.provider_id;
      const typeId = existingOptions[0]?.shipping_option_type_id;
      
      try {
        // 創建新的配送選項
        await fulfillmentService.createShippingOptions({
          shippingOptions: [
            {
              name: "711 超商取貨",
              price_type: "flat",
              amount: 60, // 設定配送費用為60元
              data: {
                id: "manual-fulfillment"
              },
              metadata: {
                description: "全台7-11門市取貨"
              },
              service_zone_id: serviceZoneId,
              shipping_profile_id: shippingProfileId,
              provider_id: providerId,
              shipping_option_type_id: typeId
            }
          ]
        });
        
        console.log("「711 超商取貨」配送選項創建成功！");
      } catch (err) {
        console.error("創建「711 超商取貨」配送選項時出錯:", err);
      }
    } else {
      console.log("「711 超商取貨」配送選項已存在，不需要重新創建。");
    }
    
    // 檢查配送選項是否成功創建
    const updatedOptions = await fulfillmentService.listShippingOptions({});
    console.log("\n=== 更新後的配送選項 ===");
    console.log(JSON.stringify(updatedOptions, null, 2));
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
  }
}
