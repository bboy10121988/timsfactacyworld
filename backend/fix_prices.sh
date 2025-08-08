#!/bin/bash
# 此腳本提供了多種方式來修復資料庫中缺少價格的產品變體

# 顏色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Medusa 資料庫價格修復工具 =====${NC}"
echo -e "${YELLOW}此腳本將幫助您修復缺少價格的產品變體${NC}"
echo ""

# 檢查資料庫連線參數
DB_USER="postgres"
DB_NAME="medusa_db"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}請輸入資料庫使用者密碼: ${NC}"
read -s DB_PASSWORD

# 測試資料庫連線
echo -e "${YELLOW}正在測試資料庫連線...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' > /dev/null 2>&1; then
  echo -e "${GREEN}資料庫連線成功!${NC}"
else
  echo -e "${RED}資料庫連線失敗! 請檢查連線參數和密碼${NC}"
  exit 1
fi

# 檢查缺少價格的變體
echo -e "${YELLOW}正在檢查缺少價格的產品變體...${NC}"
missing_prices=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
  SELECT
    pv.id as variant_id,
    pv.title as variant_title,
    p.title as product_title
  FROM
    product_variant pv
  JOIN
    product p ON pv.product_id = p.id
  LEFT JOIN
    money_amount ma ON pv.id = ma.variant_id
  WHERE
    ma.id IS NULL
  ORDER BY
    p.created_at DESC;
")

if [ -z "$missing_prices" ]; then
  echo -e "${GREEN}找不到任何缺少價格的產品變體!${NC}"
  exit 0
fi

# 計算缺少價格的變體數量
missing_count=$(echo "$missing_prices" | grep -v '^$' | wc -l)
echo -e "${PURPLE}找到 $missing_count 個缺少價格的產品變體:${NC}"
echo "$missing_prices" | sed 's/^/  /'

# 詢問用戶希望修復哪個變體
echo ""
echo -e "${BLUE}請選擇修復選項:${NC}"
echo -e "${YELLOW}1) 修復特定變體 (variant_01JY75WDZ2FCMC80CBMGCTT5RK)${NC}"
echo -e "${YELLOW}2) 修復所有缺少價格的變體${NC}"
echo -e "${YELLOW}3) 取消${NC}"
read -p "請輸入選項 (1-3): " choice

case $choice in
  1)
    echo -e "${YELLOW}正在修復變體 variant_01JY75WDZ2FCMC80CBMGCTT5RK...${NC}"
    
    # 獲取默認區域
    region_id=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM region LIMIT 1;")
    region_id=$(echo $region_id | xargs) # 去除空白
    
    if [ -z "$region_id" ]; then
      echo -e "${RED}找不到任何區域設定!${NC}"
      exit 1
    fi
    
    # 修復特定變體的價格
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
      DO \$\$
      DECLARE
        money_amount_id TEXT;
      BEGIN
        -- 檢查變體價格是否已存在
        IF EXISTS (
          SELECT 1 FROM money_amount 
          WHERE variant_id = 'variant_01JY75WDZ2FCMC80CBMGCTT5RK'
        ) THEN
          RAISE NOTICE '變體已有價格設定，將更新為 490 twd';
          
          -- 更新現有價格
          UPDATE money_amount
          SET amount = 490, updated_at = NOW()
          WHERE variant_id = 'variant_01JY75WDZ2FCMC80CBMGCTT5RK';
        ELSE
          -- 生成新的價格 ID
          SELECT 'ma_' || SUBSTRING(gen_random_uuid()::text, 4) INTO money_amount_id;
          
          -- 插入新價格
          INSERT INTO money_amount (
            id, currency_code, amount, variant_id, region_id, created_at, updated_at
          )
          VALUES (
            money_amount_id, 'twd', 490, 'variant_01JY75WDZ2FCMC80CBMGCTT5RK', '$region_id', NOW(), NOW()
          );
          
          RAISE NOTICE '已為變體添加價格: 490 twd';
        END IF;
        
        -- 刷新產品庫存緩存
        UPDATE product_variant
        SET updated_at = NOW()
        WHERE id = 'variant_01JY75WDZ2FCMC80CBMGCTT5RK';
      END \$\$;
    "
    
    echo -e "${GREEN}變體價格修復完成!${NC}"
    ;;
    
  2)
    echo -e "${YELLOW}正在修復所有缺少價格的變體...${NC}"
    
    # 獲取默認區域和貨幣
    region_info=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT id, currency_code FROM region LIMIT 1;")
    region_id=$(echo $region_info | cut -d '|' -f 1 | xargs)
    currency_code=$(echo $region_info | cut -d '|' -f 2 | xargs)
    
    if [ -z "$region_id" ] || [ -z "$currency_code" ]; then
      echo -e "${RED}找不到任何區域設定!${NC}"
      exit 1
    fi
    
    echo -e "${BLUE}使用區域 $region_id ($currency_code)${NC}"
    
    # 修復所有缺少價格的變體
    echo "$missing_prices" | while read line; do
      if [ -z "$line" ]; then
        continue
      fi
      
      variant_id=$(echo $line | cut -d '|' -f 1 | xargs)
      variant_title=$(echo $line | cut -d '|' -f 2 | xargs)
      product_title=$(echo $line | cut -d '|' -f 3 | xargs)
      
      # 特殊變體使用特定價格
      price=999 # 默認價格 9.99
      if [ "$variant_id" = "variant_01JY75WDZ2FCMC80CBMGCTT5RK" ]; then
        price=490
      fi
      
      echo -e "  正在為 ${YELLOW}$product_title - $variant_title${NC} 添加價格..."
      
      PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        INSERT INTO money_amount (
          id, currency_code, amount, variant_id, region_id, created_at, updated_at
        )
        VALUES (
          'ma_' || SUBSTRING(gen_random_uuid()::text, 4), 
          '$currency_code', $price, '$variant_id', '$region_id', NOW(), NOW()
        )
        ON CONFLICT DO NOTHING;
      " > /dev/null
      
      if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✓ 成功添加價格: $(echo "scale=2; $price/100" | bc) $currency_code${NC}"
      else
        echo -e "  ${RED}✗ 添加價格失敗${NC}"
      fi
    done
    
    # 刷新所有修改的變體
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
      UPDATE product_variant
      SET updated_at = NOW()
      WHERE id IN (
        SELECT pv.id
        FROM product_variant pv
        JOIN money_amount ma ON pv.id = ma.variant_id
        WHERE ma.created_at > NOW() - INTERVAL '5 minutes'
      );
    " > /dev/null
    
    echo -e "${GREEN}所有變體價格修復完成!${NC}"
    ;;
    
  3)
    echo -e "${YELLOW}已取消操作${NC}"
    exit 0
    ;;
    
  *)
    echo -e "${RED}無效的選項${NC}"
    exit 1
    ;;
esac

# 驗證修復結果
echo -e "${YELLOW}正在驗證修復結果...${NC}"
fixed_variant=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
  SELECT 
    pv.title as variant_title, 
    p.title as product_title,
    ma.currency_code, 
    ma.amount / 100.0 as price
  FROM money_amount ma
  JOIN product_variant pv ON ma.variant_id = pv.id
  JOIN product p ON pv.product_id = p.id
  WHERE ma.variant_id = 'variant_01JY75WDZ2FCMC80CBMGCTT5RK'
  ORDER BY ma.created_at DESC
  LIMIT 1;
")

if [ -n "$fixed_variant" ]; then
  echo -e "${GREEN}變體已成功修復:${NC}"
  echo "$fixed_variant" | sed 's/^/  /'
else
  echo -e "${RED}驗證失敗，無法找到修復後的變體價格${NC}"
fi

echo ""
echo -e "${BLUE}修復完成! 請重新啟動 Medusa 服務以確保變更生效${NC}"
