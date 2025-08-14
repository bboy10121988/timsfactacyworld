# Medusa Fresh Seeded 資料庫備份包

## 📦 備份內容

此備份包包含完整的 `medusa_fresh_seeded` 資料庫及相關檔案：

### 🗄️ 資料庫備份
- `medusa_fresh_seeded_backup_20250813_212638.sql.gz` - 完整資料庫備份（壓縮檔）
- 大小：2.6K (壓縮後)
- 原始大小：9.7K
- 壓縮率：72.8%

### 📋 相關檔案
- `manual_affiliate_tables.sql` - 聯盟系統資料表建立 SQL
- `MERGE_INSTRUCTIONS.md` - 詳細的合併操作指南
- `railway_vars.env.example` - 環境變數範例檔案
- `README_RESTORE.md` - 本說明檔案

## 🔧 還原步驟

### 方法 1：完整還原資料庫

```bash
# 1. 解壓縮備份檔案
gunzip medusa_fresh_seeded_backup_20250813_212638.sql.gz

# 2. 創建新資料庫（如果需要）
createdb medusa_fresh_seeded

# 3. 還原資料庫
psql -d medusa_fresh_seeded -f medusa_fresh_seeded_backup_20250813_212638.sql
```

### 方法 2：只添加聯盟系統資料表

如果只需要添加聯盟系統的資料表到現有資料庫：

```bash
# 執行聯盟系統資料表建立
psql -d your_existing_database -f manual_affiliate_tables.sql
```

### 方法 3：使用遠端資料庫

```bash
# 設定環境變數
export DATABASE_URL="your_database_connection_string"

# 還原到遠端資料庫
psql $DATABASE_URL -f medusa_fresh_seeded_backup_20250813_212638.sql
```

## 🎯 資料庫內容

此備份包含完整的 Medusa 電商系統資料：

### 核心系統資料表
- 產品 (products, product_variants)
- 區域與價格 (regions, prices, money_amounts)
- 訂單系統 (orders, line_items, carts)
- 客戶管理 (customers)
- 庫存管理 (inventory_items, reservation_items)
- 運送選項 (shipping_options, fulfillment_providers)

### 聯盟行銷系統資料表
- `affiliate_partner` - 聯盟夥伴資料
- `affiliate_click` - 點擊追蹤記錄
- `affiliate_conversion` - 轉換和佣金記錄

### 設定資料
- 發布金鑰 (publishable_api_keys)
- 銷售頻道 (sales_channels)
- 區域設定 (台灣地區配置)
- 價格設定 (TWD 幣別支援)

## ⚠️ 重要提醒

1. **資料庫版本**: 確保目標資料庫版本相容
2. **權限檢查**: 確認資料庫用戶有建立資料表權限
3. **備份現有資料**: 還原前請備份現有資料庫
4. **環境變數**: 記得設定正確的環境變數
5. **依賴檢查**: 確保所有 Medusa 依賴已安裝

## 🔍 驗證還原

還原後可執行以下查詢驗證：

```sql
-- 檢查資料表數量
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- 檢查聯盟系統資料表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%affiliate%';

-- 檢查基本資料
SELECT count(*) as product_count FROM product;
SELECT count(*) as region_count FROM region;
SELECT count(*) as customer_count FROM customer;
```

## 📞 支援

如果還原過程中遇到問題：

1. 檢查錯誤日誌
2. 確認資料庫連線設定
3. 驗證 PostgreSQL 版本相容性
4. 檢查磁碟空間是否足夠

---
**備份時間**: 2025年8月13日 21:26:38  
**版本**: ray0808 分支  
**環境**: PostgreSQL (Railway)
