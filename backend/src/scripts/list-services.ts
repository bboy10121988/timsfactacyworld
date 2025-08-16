import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function listServices({ container }) {
  console.log("🔍 列出可用的服務...");

  try {
    // 嘗試不同的服務名稱
    const serviceNames = [
      'fulfillmentModuleService',
      'fulfillmentService', 
      'regionModuleService',
      'regionService',
      'shippingOptionService',
      'manager',
      'query'
    ];

    for (const serviceName of serviceNames) {
      try {
        const service = container.resolve(serviceName);
        console.log(`✅ 找到服務: ${serviceName}`);
      } catch (error) {
        console.log(`❌ 找不到服務: ${serviceName}`);
      }
    }

    // 嘗試使用 remoteQuery
    try {
      const remoteQuery = container.resolve("remoteQuery");
      console.log("✅ 找到 remoteQuery 服務");
      
      // 使用 remoteQuery 查詢運輸選項
      const shippingOptions = await remoteQuery({
        entryPoint: "shipping_option",
        fields: ["id", "name", "service_zone_id", "data"],
      });
      
      console.log("📦 運輸選項:", shippingOptions);
      
    } catch (error) {
      console.log("❌ remoteQuery 失敗:", error.message);
    }

  } catch (error) {
    console.error("❌ 列出服務失敗:", error);
  }
}
