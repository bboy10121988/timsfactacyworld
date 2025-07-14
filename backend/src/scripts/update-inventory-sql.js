/**
 * 這個文件包含了更新產品變體庫存的 SQL 語句
 * 在終端中執行這些 SQL 來更新庫存
 */

// 修改綠M變體的庫存設置
const updateGreenM = `
UPDATE "product_variant"
SET 
  manage_inventory = false,
  allow_backorder = true,
  inventory_quantity = 10
WHERE id = 'variant_01JXKK401SB30GWZ4EZH0DFM3A';
`;

// 修改綠色L變體的庫存設置
const updateGreenL = `
UPDATE "product_variant"
SET 
  manage_inventory = false,
  allow_backorder = true,
  inventory_quantity = 10
WHERE id = 'variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q';
`;

// 確認庫存是否更新
const checkInventory = `
SELECT id, title, inventory_quantity, manage_inventory, allow_backorder
FROM "product_variant"
WHERE id IN ('variant_01JXKK401SB30GWZ4EZH0DFM3A', 'variant_01JXKKNPXR6ZXZV2AAM3YXQB9Q');
`;

console.log(`
請按照以下步驟在終端中執行 SQL 來更新庫存：

1. 連接到您的 Medusa 數據庫（假設使用 PostgreSQL）：
   psql -U <用戶名> -d <數據庫名> -h <主機>

   如果使用 SQLite：
   sqlite3 <數據庫文件路徑>

2. 執行以下 SQL 命令來更新綠M變體：
   ${updateGreenM}

3. 執行以下 SQL 命令來更新綠色L變體：
   ${updateGreenL}

4. 確認更新是否成功：
   ${checkInventory}

5. 重啟 Medusa 服務以確保變更生效：
   cd /Users/raychou/medusa_0525/backend && npm run dev
`);
