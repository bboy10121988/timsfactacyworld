-- 添加合作夥伴額外欄位的 SQL migration
-- 執行時間: 2025-01-12

-- 添加個人資料相關欄位
ALTER TABLE affiliate_partner 
ADD COLUMN IF NOT EXISTS social_media TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- 添加付款資訊相關欄位
ALTER TABLE affiliate_partner 
ADD COLUMN IF NOT EXISTS account_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(20);

-- 添加註釋
COMMENT ON COLUMN affiliate_partner.social_media IS '社交媒體資訊 (Instagram, Facebook 等)';
COMMENT ON COLUMN affiliate_partner.address IS '聯絡地址';
COMMENT ON COLUMN affiliate_partner.account_name IS '銀行帳戶姓名';
COMMENT ON COLUMN affiliate_partner.bank_code IS '銀行代碼';
COMMENT ON COLUMN affiliate_partner.account_number IS '銀行帳號';
COMMENT ON COLUMN affiliate_partner.tax_id IS '統一編號或身分證字號';

-- 查看更新後的表結構
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'affiliate_partner' 
ORDER BY ordinal_position;
