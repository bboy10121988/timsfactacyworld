import { Client } from "pg";

async function checkPrices() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    database: "medusa_0525", 
    user: "raychou",
    password: "1012"
  });
  
  await client.connect();
  
  try {
    console.log("🔍 檢查商品變體的價格設置...");
    
    const result = await client.query(`
      SELECT 
        pv.id as variant_id,
        pv.title,
        pvps.price_set_id,
        p.id as price_id,
        p.amount,
        p.currency_code,
        p.raw_amount
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pv.id = pvps.variant_id
      LEFT JOIN price p ON pvps.price_set_id = p.price_set_id
      WHERE pv.id = 'variant_01JW1N0A9DSKBGGZECDBGYTTR2'
        AND (p.currency_code = 'TWD' OR p.currency_code IS NULL)
      ORDER BY p.currency_code
    `);
    
    console.log("結果:", result.rows);
    
    // 檢查價格規則
    console.log("\n🔍 檢查價格規則...");
    const rulesResult = await client.query(`
      SELECT pr.* 
      FROM price_rule pr 
      JOIN price p ON pr.price_id = p.id 
      WHERE p.price_set_id = 'pset_01JW1N0AAKSBFFFDV82523TFE3'
        AND p.currency_code = 'TWD'
    `);
    
    console.log("價格規則:", rulesResult.rows);
    
  } catch (error) {
    console.error("❌ 錯誤:", error);
  } finally {
    await client.end();
  }
}

checkPrices();
