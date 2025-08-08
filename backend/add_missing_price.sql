/**
 * 這個 SQL 腳本用來為特定產品變體添加缺失的價格
 * 
 * 使用方法：
 * - 保存為 SQL 文件
 * 在後端目錄執行：
 * - psql -U postgres -d medusa_db -f add_missing_price.sql
 * 或在 pgAdmin 中執行
 */

-- 變體ID和價格資訊
DO $$ 
DECLARE
  variant_id TEXT := 'variant_01JY75WDZ2FCMC80CBMGCTT5RK';
  region_id TEXT := 'reg_01JW1S1F7GB4ZP322G2DMETETH';
  currency_code TEXT := 'twd';
  price_amount INT := 490;
  new_id TEXT;
BEGIN
  -- 檢查價格是否已存在
  IF NOT EXISTS (
    SELECT 1 FROM money_amount 
    WHERE variant_id = variant_id AND region_id = region_id
  ) THEN
    -- 生成新的價格ID
    SELECT 'ma_' || SUBSTRING(gen_random_uuid()::text, 4) INTO new_id;
    
    -- 插入新價格
    INSERT INTO money_amount (
      id, currency_code, amount, variant_id, region_id, created_at, updated_at
    )
    VALUES (
      new_id, currency_code, price_amount, variant_id, region_id, NOW(), NOW()
    );
    
    RAISE NOTICE '已為變體 % 添加價格: % %', variant_id, price_amount, currency_code;
  ELSE
    RAISE NOTICE '變體 % 已有價格設定，不需要添加', variant_id;
  END IF;
END $$;
