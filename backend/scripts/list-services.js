"use strict";

export default async function ({ container }) {
  try {
    // 獲取所有註冊的服務名稱
    const registrations = container.registrations;
    
    console.log("=== 系統中註冊的服務 ===");
    console.log(Object.keys(registrations).sort().join('\n'));
    
    // 查找與配送相關的服務
    const shippingServices = Object.keys(registrations)
      .filter(name => name.toLowerCase().includes('ship') || 
               name.toLowerCase().includes('fulfillment') || 
               name.toLowerCase().includes('delivery'))
      .sort();
    
    console.log("\n=== 與配送相關的服務 ===");
    console.log(shippingServices.join('\n'));
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
  }
}
