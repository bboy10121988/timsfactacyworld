import { loadEnv } from "@medusajs/utils";
import { Client } from "pg";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default async function checkShippingOptionTypes({ container }) {
  console.log("🔍 檢查 shipping_option_type 表結構和資料...");

  let client: Client | null = null;

  try {
    // 創建直接的資料庫連接
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("🔗 資料庫連接成功");

    // 查看 shipping_option_type 表的結構
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'shipping_option_type'
      ORDER BY ordinal_position;
    `);
    
    console.log("📋 shipping_option_type 表欄位:", schemaResult.rows);

    // 查看現有的運輸選項類型資料
    const dataResult = await client.query(`
      SELECT * FROM shipping_option_type 
      WHERE id IN ('sotype_01K2RV95G3B8PD908FWTGHYZDZ', 'sotype_01K2RV95RAJXSVT2B7BH5AZRXJ')
    `);
    
    console.log("📦 現有運輸選項類型資料:", dataResult.rows);

    // 查看是否有 price 相關的表
    const priceTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%price%' OR table_name LIKE '%shipping%'
      ORDER BY table_name;
    `);
    
    console.log("💰 價格相關的表:", priceTablesResult.rows.map(row => row.table_name));

    console.log("✅ 檢查完成!");

  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  } finally {
    if (client) {
      await client.end();
      console.log("🔌 資料庫連接已關閉");
    }
  }
}
