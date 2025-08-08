-- 修復產品變體的區域價格關聯
DO $$ 
DECLARE
  variant_id_param TEXT := 'variant_01JY75WDZ2FCMC80CBMGCTT5RK';
  region_id_param TEXT := 'reg_01JW1S1F7GB4ZP322G2DMETETH';
  currency_code_param TEXT := 'TWD';
  price_amount_param INT := 600;
  price_set_id TEXT;
  existing_region BOOLEAN;
BEGIN
  -- 檢查價格是否與區域關聯
  SELECT EXISTS(
    SELECT 1 FROM price p 
    JOIN product_variant_price_set pvps ON p.price_set_id = pvps.price_set_id
    WHERE pvps.variant_id = variant_id_param AND p.currency_code = currency_code_param
  ) INTO existing_region;
  
  RAISE NOTICE '產品變體 % 有 TWD 價格記錄? %', variant_id_param, existing_region;
  
  -- 更新所有相關價格記錄，確保它們有正確的區域 ID
  UPDATE price p
  SET region_id = region_id_param
  FROM product_variant_price_set pvps
  WHERE p.price_set_id = pvps.price_set_id
  AND pvps.variant_id = variant_id_param
  AND p.currency_code = currency_code_param
  AND (p.region_id IS NULL OR p.region_id != region_id_param);
  
  -- 檢查完成的更新數量
  RAISE NOTICE '更新了 % 條價格記錄，添加了區域 ID', FOUND;
  
  -- 如果沒有價格記錄，則添加一個新記錄
  IF NOT existing_region THEN
    -- 獲取價格集 ID
    SELECT pvps.price_set_id 
    FROM product_variant_price_set pvps 
    WHERE pvps.variant_id = variant_id_param 
    LIMIT 1 
    INTO price_set_id;
    
    IF price_set_id IS NOT NULL THEN
      -- 創建新價格記錄
      INSERT INTO price (
        id, currency_code, amount, price_set_id, region_id, created_at, updated_at
      ) VALUES (
        'price_' || SUBSTRING(gen_random_uuid()::text, 4),
        currency_code_param,
        price_amount_param,
        price_set_id,
        region_id_param,
        NOW(),
        NOW()
      );
      RAISE NOTICE '為變體 % 添加了新的價格記錄', variant_id;
    ELSE
      RAISE NOTICE '無法找到變體 % 的價格集 ID', variant_id;
    END IF;
  END IF;
END $$;
