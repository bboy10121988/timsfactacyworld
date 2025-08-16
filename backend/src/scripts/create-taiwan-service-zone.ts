import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function createTaiwanServiceZone({ container }) {
  console.log("🏗️ 創建完整的台灣服務區域配置...");

  let client: Client | null = null;

  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 1. 創建台灣服務區域（關聯到台灣履約設定）
    console.log("🌐 創建台灣服務區域...");
    await client.query(`
      INSERT INTO service_zone (id, name, fulfillment_set_id, created_at, updated_at)
      VALUES ('serzo_tw_001', 'Taiwan Service Zone', 'fuset_tw_default_001', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET 
        name = 'Taiwan Service Zone', 
        fulfillment_set_id = 'fuset_tw_default_001',
        updated_at = NOW()
    `);
    console.log("✅ 台灣服務區域已確保存在");

    // 2. 創建台灣地理區域（直接關聯到服務區域）
    console.log("🌍 創建台灣地理區域...");
    await client.query(`
      INSERT INTO geo_zone (id, type, country_code, service_zone_id, metadata, created_at, updated_at)
      VALUES ('fgz_tw_001', 'country', 'tw', 'serzo_tw_001', '{}', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET 
        service_zone_id = 'serzo_tw_001',
        updated_at = NOW()
    `);
    console.log("✅ 台灣地理區域已確保存在");

    // 3. 更新台灣運輸選項，讓它們指向台灣服務區域
    console.log("📦 更新台灣運輸選項的服務區域...");
    const updateResult = await client.query(`
      UPDATE shipping_option 
      SET service_zone_id = 'serzo_tw_001'
      WHERE id IN ('so_01K2K7ABW9THYBX25W456SW0J1', 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y')
    `);
    
    console.log(`✅ 更新了 ${updateResult.rowCount} 個運輸選項`);

    // 4. 驗證配置
    console.log("🔍 驗證最終配置...");
    
    // 檢查運輸選項
    const verifyShippingResult = await client.query(`
      SELECT so.id, so.name, so.service_zone_id, sz.name as service_zone_name
      FROM shipping_option so
      JOIN service_zone sz ON so.service_zone_id = sz.id
      WHERE so.id IN ('so_01K2K7ABW9THYBX25W456SW0J1', 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y')
    `);
    
    console.log("📦 運輸選項配置:", verifyShippingResult.rows);

    // 檢查服務區域和地理區域
    const verifyServiceZoneResult = await client.query(`
      SELECT sz.id, sz.name, sz.fulfillment_set_id,
             gz.id as geo_zone_id, gz.type, gz.country_code
      FROM service_zone sz
      LEFT JOIN geo_zone gz ON sz.id = gz.service_zone_id
      WHERE sz.id = 'serzo_tw_001'
    `);
    
    console.log("🌐 台灣服務區域配置:", verifyServiceZoneResult.rows);

    console.log("✅ 台灣服務區域配置創建完成!");

  } catch (error) {
    console.error("❌ 創建失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
