import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function updateShippingAmounts({ container }) {
  console.log("💰 直接更新運輸選項的 amount 字段...");

  let client: Client | null = null;

  try {
    // 創建直接的資料庫連接
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 更新標準宅配的 amount
    const updateStandardResult = await client.query(
      `UPDATE shipping_option SET amount = 80 WHERE id = 'so_01K2K7ABW9THYBX25W456SW0J1'`
    );
    
    console.log("✅ 標準宅配 amount 更新:", updateStandardResult.rowCount, "行");

    // 更新快速宅配的 amount
    const updateExpressResult = await client.query(
      `UPDATE shipping_option SET amount = 100 WHERE id = 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y'`
    );
    
    console.log("✅ 快速宅配 amount 更新:", updateExpressResult.rowCount, "行");

    // 驗證更新結果
    const verifyResult = await client.query(
      `SELECT id, name, amount, price_type FROM shipping_option WHERE id IN ('so_01K2K7ABW9THYBX25W456SW0J1', 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y')`
    );
    
    console.log("🔍 驗證結果:", verifyResult.rows);

    console.log("✅ 運輸選項 amount 更新完成!");

  } catch (error) {
    console.error("❌ 更新失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
