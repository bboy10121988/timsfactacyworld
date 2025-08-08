/**
 * 修復缺失產品價格的 SQL 腳本
 * 執行方式: 將此檔案另存為 fix_prices.sql 後，用 psql 執行:
 * psql -U medusa -d medusa_db -f fix_prices.sql
 */

-- 開始交易
BEGIN;

-- 定義要修復的變體和價格信息
DO $$ 
DECLARE
  variant_id TEXT := 'variant_01JY75WDZ2FCMC80CBMGCTT5RK';
  region_id TEXT := 'reg_01JW1S1F7GB4ZP322G2DMETETH';
  currency_code TEXT := 'twd';
  price_amount INT := 490;
  money_amount_id TEXT;
BEGIN
  -- 檢查變體是否存在
  IF NOT EXISTS (SELECT 1 FROM product_variant WHERE id = variant_id) THEN
    RAISE NOTICE '錯誤: 變體 % 不存在', variant_id;
    RETURN;
  END IF;
  
  -- 檢查地區是否存在
  IF NOT EXISTS (SELECT 1 FROM region WHERE id = region_id) THEN
    RAISE NOTICE '錯誤: 地區 % 不存在', region_id;
    RETURN;
  END IF;
  
  -- 檢查變體價格是否已存在
  IF EXISTS (
    SELECT 1 FROM money_amount 
    WHERE variant_id = variant_id AND region_id = region_id
  ) THEN
    RAISE NOTICE '變體 % 已有價格設定，將更新為 % %', variant_id, price_amount, currency_code;
    
    -- 更新現有價格
    UPDATE money_amount
    SET amount = price_amount, updated_at = NOW()
    WHERE variant_id = variant_id AND region_id = region_id;
  ELSE
    -- 生成新的價格 ID
    SELECT 'ma_' || SUBSTRING(gen_random_uuid()::text, 4) INTO money_amount_id;
    
    -- 插入新價格
    INSERT INTO money_amount (
      id, currency_code, amount, variant_id, region_id, created_at, updated_at, min_quantity, max_quantity
    )
    VALUES (
      money_amount_id, currency_code, price_amount, variant_id, region_id, NOW(), NOW(), NULL, NULL
    );
    
    RAISE NOTICE '已為變體 % 添加價格: % %', variant_id, price_amount, currency_code;
  END IF;
  
  -- 刷新產品庫存緩存
  UPDATE product_variant
  SET updated_at = NOW()
  WHERE id = variant_id;

END $$;

-- 提交交易
COMMIT;

-- 顯示所有修復後的產品變體價格
SELECT 
  pv.title as variant_title, 
  p.title as product_title,
  ma.currency_code, 
  ma.amount / 100.0 as price, 
  ma.region_id,
  r.name as region_name
FROM money_amount ma
JOIN product_variant pv ON ma.variant_id = pv.id
JOIN product p ON pv.product_id = p.id
JOIN region r ON ma.region_id = r.id
WHERE ma.variant_id = 'variant_01JY75WDZ2FCMC80CBMGCTT5RK'
ORDER BY ma.created_at DESC;
