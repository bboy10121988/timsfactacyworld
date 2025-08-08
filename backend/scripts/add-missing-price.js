// 建立一個修復腳本來執行資料庫查詢
// 將此文件保存為 backend/scripts/add-missing-price.js

const path = require("path");
const { getConfigFile } = require("@medusajs/medusa/dist/utils");
const { Client } = require("pg");

const variantId = "variant_01JY75WDZ2FCMC80CBMGCTT5RK";
const regionId = "reg_01JW1S1F7GB4ZP322G2DMETETH";
const currencyCode = "twd";
const amount = 490;

const INSERT_PRICE_SQL = `
INSERT INTO money_amount (
  id, 
  currency_code, 
  amount, 
  region_id, 
  variant_id, 
  created_at, 
  updated_at, 
  min_quantity, 
  max_quantity
) 
VALUES (
  'ma_' || SUBSTRING(gen_random_uuid()::text, 4), 
  $1, 
  $2, 
  $3, 
  $4, 
  NOW(), 
  NOW(), 
  NULL, 
  NULL
)
ON CONFLICT DO NOTHING
RETURNING *;
`;

async function main() {
  // 讀取資料庫配置
  const { configModule } = getConfigFile(
    path.resolve("."),
    "medusa-config"
  );
  
  const dbConfig = configModule.projectConfig.database_url || configModule.projectConfig.database;
  
  // 建立資料庫連接
  const client = new Client({
    connectionString: dbConfig
  });
  
  try {
    await client.connect();
    console.log("已連接到資料庫");
    
    // 檢查是否已經有價格
    const checkResult = await client.query(
      `SELECT * FROM money_amount WHERE variant_id = $1 AND region_id = $2`,
      [variantId, regionId]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`變體 ${variantId} 已有價格設定，不需要添加`);
      return;
    }
    
    // 添加價格
    const result = await client.query(
      INSERT_PRICE_SQL,
      [currencyCode, amount, regionId, variantId]
    );
    
    if (result.rows.length > 0) {
      console.log(`成功為變體 ${variantId} 添加價格: ${amount} ${currencyCode}`);
    } else {
      console.log(`無法為變體 ${variantId} 添加價格`);
    }
    
  } catch (error) {
    console.error("執行腳本時發生錯誤:", error);
  } finally {
    await client.end();
    console.log("資料庫連接已關閉");
  }
}

main();
