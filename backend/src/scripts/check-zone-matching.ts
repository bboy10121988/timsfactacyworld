import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkServiceZoneMatching({ container }) {
  console.log("🔍 檢查購物車地區與服務區域匹配...");

  let client: Client | null = null;

  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    const cartId = "cart_01K2RVTHP970X98HXB04DV3WRS";

    // 1. 檢查購物車的地區和國家
    console.log("🛒 檢查購物車資訊...");
    const cartResult = await client.query(`
      SELECT c.id, c.region_id, c.currency_code,
             r.name as region_name, r.currency_code as region_currency
      FROM cart c
      JOIN region r ON c.region_id = r.id
      WHERE c.id = $1
    `, [cartId]);
    
    console.log("🛒 購物車資訊:", cartResult.rows[0]);

    // 2. 檢查台灣地區的國家
    console.log("🇹🇼 檢查台灣地區的國家...");
    const taiwanCountryResult = await client.query(`
      SELECT c.iso_2, c.name, c.region_id
      FROM country c
      WHERE c.iso_2 = 'tw'
    `);
    
    console.log("🇹🇼 台灣國家設定:", taiwanCountryResult.rows);

    // 3. 檢查所有地區的國家
    console.log("🌍 檢查所有地區的國家關聯...");
    const allRegionCountriesResult = await client.query(`
      SELECT r.id as region_id, r.name as region_name, 
             c.iso_2, c.name as country_name
      FROM region r
      JOIN country c ON r.id = c.region_id
      ORDER BY r.name, c.iso_2
    `);
    
    console.log("🌍 地區國家關聯:");
    allRegionCountriesResult.rows.forEach(row => {
      console.log(`  ${row.region_name} (${row.region_id}): ${row.country_name} (${row.iso_2})`);
    });

    // 4. 檢查服務區域與地理區域的關聯
    console.log("🔗 檢查服務區域與地理區域關聯...");
    
    // 先檢查是否存在 service_zone_geo_zone 表
    const tableExistsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'service_zone_geo_zone'
      );
    `);
    
    if (tableExistsResult.rows[0].exists) {
      const serviceZoneGeoResult = await client.query(`
        SELECT szgz.service_zone_id, sz.name as service_zone_name,
               szgz.geo_zone_id, gz.type as geo_zone_type, gz.country_code
        FROM service_zone_geo_zone szgz
        JOIN service_zone sz ON szgz.service_zone_id = sz.id
        JOIN geo_zone gz ON szgz.geo_zone_id = gz.id
      `);
      
      console.log("🔗 服務區域與地理區域關聯:", serviceZoneGeoResult.rows);
    } else {
      console.log("⚠️ service_zone_geo_zone 表不存在");
    }

    console.log("✅ 匹配檢查完成!");

  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
