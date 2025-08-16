import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkShippingOptionSchema({ container }) {
  console.log("🔍 檢查 shipping_option 表結構...");

  let client: Client | null = null;

  try {
    // 創建直接的資料庫連接
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 查看 shipping_option 表的結構
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'shipping_option'
      ORDER BY ordinal_position;
    `);
    
    console.log("📋 shipping_option 表欄位:", schemaResult.rows);

    // 查看現有的運輸選項資料
    const dataResult = await client.query(`
      SELECT * FROM shipping_option 
      WHERE id IN ('so_01K2K7ABW9THYBX25W456SW0J1', 'so_01K2K7ABWDMMYAT5NMQ0N49P4Y')
    `);
    
    console.log("📦 現有運輸選項資料:", dataResult.rows);

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
