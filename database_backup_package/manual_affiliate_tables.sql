-- 聯盟系統資料表建立 SQL
-- 執行前請確保已備份資料庫

-- 1. 建立 affiliate_partner 表 (聯盟夥伴)
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

-- 2. 建立 affiliate_click 表 (點擊追蹤)
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

-- 3. 建立 affiliate_conversion 表 (轉換和佣金)
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

-- 4. 建立必要索引
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_email_unique" 
ON "affiliate_partner" (email) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_partner_affiliate_code_unique" 
ON "affiliate_partner" (affiliate_code) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_affiliate_partner_deleted_at" 
ON "affiliate_partner" (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_deleted_at" 
ON "affiliate_click" (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_affiliate_conversion_deleted_at" 
ON "affiliate_conversion" (deleted_at) WHERE deleted_at IS NULL;

-- 5. 建立額外的性能索引
CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_affiliate_code" 
ON "affiliate_click" (affiliate_code);

CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_created_at" 
ON "affiliate_click" (created_at);

CREATE INDEX IF NOT EXISTS "IDX_affiliate_conversion_affiliate_code" 
ON "affiliate_conversion" (affiliate_code);

CREATE INDEX IF NOT EXISTS "IDX_affiliate_conversion_order_id" 
ON "affiliate_conversion" (order_id);

CREATE INDEX IF NOT EXISTS "IDX_affiliate_conversion_status" 
ON "affiliate_conversion" (status);

-- 完成提示
SELECT 'Affiliate tables created successfully!' as message;

-- 驗證建立結果
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE '%affiliate%'
ORDER BY table_name;
