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
  'ma_' || SUBSTRING(GEN_RANDOM_UUID()::text, 4), 
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

module.exports = async (connection) => {
  console.log("執行變體價格修復腳本...");
  
  try {
    // 檢查是否已經有價格
    const checkResult = await connection.query(
      `SELECT * FROM money_amount WHERE variant_id = $1 AND region_id = $2`,
      [variantId, regionId]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`變體 ${variantId} 已有價格設定，不需要添加`);
      return;
    }
    
    // 添加價格
    const result = await connection.query(
      INSERT_PRICE_SQL,
      [currencyCode, amount, regionId, variantId]
    );
    
    if (result.rows.length > 0) {
      console.log(`成功為變體 ${variantId} 添加價格: ${amount} ${currencyCode}`);
    } else {
      console.log(`無法為變體 ${variantId} 添加價格`);
    }
  } catch (error) {
    console.error("添加價格時發生錯誤:", error);
    throw error;
  }
};
