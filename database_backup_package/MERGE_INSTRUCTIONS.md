# 聯盟系統資料庫 Migration 檔案包

## 📋 同事 Merge 操作指南

### 1️⃣ **必要檔案**

請將以下檔案複製到對應位置：

#### **Migration 檔案**
- `backend/src/modules/affiliate/migrations/Migration20250811164316.ts`

#### **模組檔案**
- `backend/src/modules/affiliate/index.ts`
- `backend/src/modules/affiliate/models/affiliate-partner.ts`
- `backend/src/modules/affiliate/models/affiliate-click.ts`
- `backend/src/modules/affiliate/models/affiliate-conversion.ts`
- `backend/src/modules/affiliate/services/affiliate-minimal.ts`

### 2️⃣ **執行步驟**

```bash
# 1. 切換到 backend 目錄
cd backend

# 2. 安裝依賴 (如果需要)
npm install

# 3. 運行 migration
npx medusa db:migrate

# 4. 如果 migration 失敗，手動執行 SQL
psql -d your_database_name -f manual_affiliate_tables.sql
```

### 3️⃣ **手動建立資料表 (備用方案)**

如果 migration 無法正常運行，請執行以下 SQL：

```sql
-- 建立 affiliate_partner 表
CREATE TABLE IF NOT EXISTS "affiliate_partner" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "password" text NOT NULL,
    "phone" text NULL,
    "company" text NULL,
    "affiliate_code" text NOT NULL,
    "referral_link" text NOT NULL,
    "referred_by_code" text NULL,
    "status" text CHECK ("status" IN ('pending', 'approved', 'rejected', 'suspended')) NOT NULL DEFAULT 'pending',
    "commission_rate" numeric NOT NULL DEFAULT 0.08,
    "website" text NULL,
    "social_media" text NULL,
    "address" text NULL,
    "account_name" text NULL,
    "bank_code" text NULL,
    "account_number" text NULL,
    "tax_id" text NULL,
    "notes" text NULL,
    "approved_at" timestamptz NULL,
    "approved_by" text NULL,
    "raw_commission_rate" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "affiliate_partner_pkey" PRIMARY KEY ("id")
);

-- 建立 affiliate_click 表
CREATE TABLE IF NOT EXISTS "affiliate_click" (
    "id" text NOT NULL,
    "affiliate_code" text NOT NULL,
    "product_id" text NULL,
    "ip_address" text NULL,
    "user_agent" text NULL,
    "referrer_url" text NULL,
    "session_id" text NULL,
    "converted" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "affiliate_click_pkey" PRIMARY KEY ("id")
);

-- 建立 affiliate_conversion 表
CREATE TABLE IF NOT EXISTS "affiliate_conversion" (
    "id" text NOT NULL,
    "affiliate_code" text NOT NULL,
    "order_id" text NOT NULL,
    "order_total" numeric NOT NULL,
    "commission_rate" numeric NOT NULL,
    "commission_amount" numeric NOT NULL,
    "status" text CHECK ("status" IN ('pending', 'confirmed', 'cancelled', 'paid')) NOT NULL DEFAULT 'pending',
    "click_id" text NULL,
    "paid_at" timestamptz NULL,
    "payment_reference" text NULL,
    "raw_order_total" jsonb NOT NULL,
    "raw_commission_rate" jsonb NOT NULL,
    "raw_commission_amount" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "affiliate_conversion_pkey" PRIMARY KEY ("id")
);

-- 建立索引
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_email_unique" ON "affiliate_partner" (email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_affiliate_code_unique" ON "affiliate_partner" (affiliate_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_affiliate_partner_deleted_at" ON "affiliate_partner" (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_deleted_at" ON "affiliate_click" (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_affiliate_conversion_deleted_at" ON "affiliate_conversion" (deleted_at) WHERE deleted_at IS NULL;
```

### 4️⃣ **驗證安裝**

執行以下 SQL 確認資料表已建立：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%affiliate%'
ORDER BY table_name;
```

應該看到：
- affiliate_click
- affiliate_conversion  
- affiliate_partner

### 5️⃣ **環境變數 (如果需要)**

確認 `.env` 檔案包含：
```env
MEDUSA_BACKEND_URL=your_backend_url
MEDUSA_ADMIN_CORS=your_admin_cors
# 其他必要的環境變數...
```

## 🎯 **重要提醒**

1. **備份資料庫** - 在執行 migration 前先備份
2. **檢查環境** - 確保 Medusa 版本一致
3. **測試 API** - Migration 後測試聯盟相關 API
4. **檢查權限** - 確認資料庫用戶有建表權限

如果遇到問題，請查看：
- Migration 錯誤日誌
- 資料庫連接設定
- Medusa 模組配置
