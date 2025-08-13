-- 添加合作夥伴表缺少的欄位
-- 社群媒體資訊
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS social_media TEXT;

-- 地址資訊
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS address TEXT;

-- 付款資訊欄位
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS tax_id VARCHAR(20);

-- 添加唯一代碼欄位 (如果還沒有的話)
ALTER TABLE affiliate_partner ADD COLUMN IF NOT EXISTS unique_code VARCHAR(20) UNIQUE;

-- 創建索引來提升查詢效能
CREATE INDEX IF NOT EXISTS idx_affiliate_partner_unique_code ON affiliate_partner(unique_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_partner_tax_id ON affiliate_partner(tax_id);

-- 顯示更新後的表結構
\d affiliate_partner;
