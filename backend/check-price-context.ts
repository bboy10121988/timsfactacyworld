import { Client } from "pg";

async function checkPriceContext() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    database: "medusa_0525", 
    user: "raychou",
    password: "1012"
  });
  
  await client.connect();
  
  try {
    console.log("🔍 檢查價格上下文...");
    
    // 檢查區域設置
    console.log("\n🌍 檢查區域設置:");
    const regionResult = await client.query(`
      SELECT r.id, r.name, r.currency_code, r.automatic_taxes
      FROM region r 
      WHERE r.id = 'reg_01JW1S1F7GB4ZP322G2DMETETH'
    `);
    console.log("區域:", regionResult.rows);
    
    // 檢查價格上下文或規則
    console.log("\n💰 檢查完整價格鏈:");
    const fullPriceResult = await client.query(`
      SELECT 
        pv.product_id,
        pv.id as variant_id,
        pv.title as variant_title,
        pvps.price_set_id,
        ps.id as price_set_check,
        p.id as price_id,
        p.amount,
        p.currency_code,
        p.raw_amount,
        p.price_list_id,
        p.min_quantity,
        p.max_quantity
      FROM product_variant pv
      JOIN product_variant_price_set pvps ON pv.id = pvps.variant_id
      JOIN price_set ps ON pvps.price_set_id = ps.id
      JOIN price p ON ps.id = p.price_set_id
      WHERE pv.id = 'variant_01JW1N0A9DSKBGGZECDBGYTTR2'
        AND p.currency_code = 'TWD'
        AND p.deleted_at IS NULL
    `);
    console.log("完整價格鏈:", fullPriceResult.rows);
    
    // 檢查商品是否關聯到正確的 Sales Channel
    console.log("\n🏪 檢查Sales Channel關聯:");
    const salesChannelResult = await client.query(`
      SELECT 
        p.id as product_id,
        p.title as product_title,
        psc.sales_channel_id,
        sc.name as channel_name
      FROM product p
      JOIN product_sales_channel psc ON p.id = psc.product_id
      JOIN sales_channel sc ON psc.sales_channel_id = sc.id
      WHERE p.id = 'prod_01JW1N0A7VBTFTB5807TXTWZ1X'
    `);
    console.log("Sales Channel關聯:", salesChannelResult.rows);
    
  } catch (error) {
    console.error("❌ 錯誤:", error);
  } finally {
    await client.end();
  }
}

checkPriceContext();
