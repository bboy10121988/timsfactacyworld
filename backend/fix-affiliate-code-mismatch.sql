-- 修復資料庫中的 affiliate_code 不匹配問題

-- 1. 先查看當前不匹配的情況
SELECT 'Current Mismatches' as note;
SELECT ac.affiliate_code as conversion_code, ap.affiliate_code as partner_code, ap.id, ap.name
FROM affiliate_conversion ac 
LEFT JOIN affiliate_partner ap ON ac.affiliate_code = ap.affiliate_code
WHERE ap.id IS NULL;

-- 2. 修復不匹配的 affiliate_code
-- 將 測試用005305 的收益記錄歸屬給小明 (aff_001)
UPDATE affiliate_conversion 
SET affiliate_code = 'MING2025'
WHERE affiliate_code = '測試用005305';

-- 3. 為缺少合作夥伴的收益記錄創建或更新對應關係
-- YA002 ➔ 創建或更新為美妝達人小雅
UPDATE affiliate_partner 
SET affiliate_code = 'YA002'
WHERE id = 'aff_002' AND name = '美妝達人小雅';

-- JAY005 ➔ 創建或更新為科技宅男阿傑  
UPDATE affiliate_partner 
SET affiliate_code = 'JAY005'
WHERE id = 'aff_005' AND name = '科技宅男阿傑';

-- 4. 驗證修復結果
SELECT 'After Fix - All Conversions with Partners' as note;
SELECT 
  ac.id,
  ac.affiliate_code,
  ac.order_id,
  ac.order_total,
  ac.commission_amount,
  ac.status,
  ap.id as partner_id,
  ap.name as partner_name
FROM affiliate_conversion ac 
LEFT JOIN affiliate_partner ap ON ac.affiliate_code = ap.affiliate_code
ORDER BY ac.created_at DESC;

-- 5. 檢查每個合作夥伴的收益統計
SELECT 'Partner Earnings Summary' as note;
SELECT 
  ap.id,
  ap.name,
  ap.affiliate_code,
  COUNT(ac.id) as total_conversions,
  SUM(ac.commission_amount) as total_commission,
  AVG(ac.commission_amount) as avg_commission
FROM affiliate_partner ap
LEFT JOIN affiliate_conversion ac ON ap.affiliate_code = ac.affiliate_code
GROUP BY ap.id, ap.name, ap.affiliate_code
ORDER BY total_commission DESC;
