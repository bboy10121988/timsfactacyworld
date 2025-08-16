import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function fixShippingPrices({ container }) {
  console.log("💰 修正運輸選項的 TWD 價格...");

  let client: Client | null = null;

  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 標準宅配價格設定 ID: pset_01K2K7ABYWXB1EVY5Q5KHJW5YG -> 應該是 80 TWD
    // 快速宅配價格設定 ID: pset_01K2K7ABZ3SJ30P9QQ4MPNWAV6 -> 應該是 100 TWD

    // 更新標準宅配的 TWD 價格（80 元）
    console.log("📦 更新標準宅配價格 (80 TWD)...");
    const updateStandardResult = await client.query(`
      UPDATE price 
      SET raw_amount = '{"value": "80", "precision": 20}', amount = '80'
      WHERE price_set_id = 'pset_01K2K7ABYWXB1EVY5Q5KHJW5YG' 
      AND currency_code = 'twd'
    `);
    
    console.log("✅ 標準宅配價格更新:", updateStandardResult.rowCount, "行");

    // 更新快速宅配的 TWD 價格（100 元）
    console.log("📦 更新快速宅配價格 (100 TWD)...");
    const updateExpressResult = await client.query(`
      UPDATE price 
      SET raw_amount = '{"value": "100", "precision": 20}', amount = '100'
      WHERE price_set_id = 'pset_01K2K7ABZ3SJ30P9QQ4MPNWAV6' 
      AND currency_code = 'twd'
    `);
    
    console.log("✅ 快速宅配價格更新:", updateExpressResult.rowCount, "行");

    // 驗證更新結果
    console.log("🔍 驗證價格更新結果...");
    const verifyResult = await client.query(`
      SELECT 
        p.id, p.currency_code, p.amount, p.raw_amount, p.price_set_id,
        so.name as shipping_option_name
      FROM price p
      JOIN shipping_option_price_set sops ON p.price_set_id = sops.price_set_id
      JOIN shipping_option so ON sops.shipping_option_id = so.id
      WHERE p.currency_code = 'twd' 
      AND so.id IN ('so_01K2K7ABW9THYBX25W456SW0J1', 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y')
      ORDER BY so.name
    `);
    
    console.log("💰 更新後的 TWD 價格:");
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.shipping_option_name}: ${row.amount} TWD`);
    });

    console.log("✅ 運輸選項價格修正完成!");

  } catch (error) {
    console.error("❌ 修正失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
