import { loadEnv } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkShippingOptionsAssociation({ container }) {
  console.log("🔍 檢查運輸選項關聯...");

  const query = container.resolve("manager");
  
  try {
    // 檢查運輸選項與地區的關聯
    const shippingOptionsQuery = `
      SELECT 
        so.id as shipping_option_id,
        so.name,
        so.type,
        so.data,
        serzo.id as service_zone_id,
        serzo.name as service_zone_name
      FROM shipping_option so
      JOIN service_zone serzo ON so.service_zone_id = serzo.id;
    `;

    const shippingOptions = await query.query(shippingOptionsQuery);
    console.log("📦 運輸選項:", JSON.stringify(shippingOptions, null, 2));

    // 檢查服務區域與地理區域的關聯
    const serviceZonesQuery = `
      SELECT 
        szgz.service_zone_id,
        szgz.geo_zone_id,
        gz.type as geo_zone_type,
        gz.metadata as geo_zone_metadata
      FROM service_zone_geo_zone szgz
      JOIN geo_zone gz ON szgz.geo_zone_id = gz.id;
    `;

    const serviceZones = await query.query(serviceZonesQuery);
    console.log("🌐 服務區域與地理區域關聯:", JSON.stringify(serviceZones, null, 2));

    // 檢查台灣地區 ID
    const regionQuery = `SELECT id, name, currency_code FROM region WHERE name = 'Taiwan'`;
    const regions = await query.query(regionQuery);
    console.log("🏴 台灣地區:", JSON.stringify(regions, null, 2));

    console.log("✅ 檢查完成!");
  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  }
}
