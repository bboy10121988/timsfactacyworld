import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkPriceSets({ container }) {
  console.log("💰 檢查運輸選項價格設定...");

  let client: Client | null = null;

  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 檢查 shipping_option_price_set 表
    console.log("📋 檢查 shipping_option_price_set...");
    const shippingPriceSetResult = await client.query(`
      SELECT * FROM shipping_option_price_set 
      WHERE shipping_option_id IN ('so_01K2K7ABW9THYBX25W456SW0J1', 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y')
    `);
    
    console.log("🚢 運輸選項價格設定關聯:", shippingPriceSetResult.rows);

    if (shippingPriceSetResult.rows.length > 0) {
      // 如果有價格設定，檢查相關的 price_set 和 price 表
      const priceSetIds = shippingPriceSetResult.rows.map(row => `'${row.price_set_id}'`).join(',');
      
      console.log("📋 檢查 price_set...");
      const priceSetResult = await client.query(`
        SELECT * FROM price_set WHERE id IN (${priceSetIds})
      `);
      
      console.log("💰 價格設定:", priceSetResult.rows);

      console.log("📋 檢查 price...");
      const priceResult = await client.query(`
        SELECT * FROM price WHERE price_set_id IN (${priceSetIds})
      `);
      
      console.log("💲 價格詳情:", priceResult.rows);
    } else {
      console.log("❌ 沒有找到運輸選項的價格設定關聯");
      console.log("💡 這可能就是為什麼 API 不返回運輸選項的原因！");
      
      // 檢查是否存在任何價格設定
      const allPriceSetsResult = await client.query(`
        SELECT id FROM price_set LIMIT 5
      `);
      
      console.log("🔍 現有的價格設定 (前5個):", allPriceSetsResult.rows);
      
      if (allPriceSetsResult.rows.length > 0) {
        console.log("💡 解決方案：需要為台灣運輸選項創建價格設定！");
      }
    }

    console.log("✅ 價格設定檢查完成!");

  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
