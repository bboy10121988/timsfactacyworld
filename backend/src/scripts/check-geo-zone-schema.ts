import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkGeoZoneSchema({ container }) {
  console.log("🔍 檢查 geo_zone 表結構...");

  let client: Client | null = null;

  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 查看 geo_zone 表結構
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'geo_zone'
      ORDER BY ordinal_position;
    `);
    
    console.log("📋 geo_zone 表欄位:", schemaResult.rows);

    // 查看現有的地理區域
    const existingGeoZones = await client.query(`
      SELECT * FROM geo_zone LIMIT 3
    `);
    
    console.log("🌍 現有地理區域範例:", existingGeoZones.rows);

    console.log("✅ 結構檢查完成!");

  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
