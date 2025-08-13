-- 為現有的合作夥伴創建一些收益記錄
INSERT INTO affiliate_conversion (
  id, 
  affiliate_code, 
  order_id, 
  order_total, 
  commission_rate, 
  commission_amount, 
  status,
  raw_order_total,
  raw_commission_rate,
  raw_commission_amount,
  created_at,
  updated_at
) VALUES 
-- 小明的購物分享的收益記錄
('conv_ming_001', '測試用005305', 'order_001', 2580.00, 0.05, 129.00, 'confirmed', '2580', '0.05', '129', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('conv_ming_002', '測試用005305', 'order_002', 1899.00, 0.05, 94.95, 'paid', '1899', '0.05', '94.95', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
('conv_ming_003', '測試用005305', 'order_003', 3250.00, 0.05, 162.50, 'pending', '3250', '0.05', '162.50', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- 美妝達人小雅的收益記錄  
('conv_ya_001', 'YA002', 'order_004', 1680.00, 0.05, 84.00, 'confirmed', '1680', '0.05', '84', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('conv_ya_002', 'YA002', 'order_005', 2200.00, 0.05, 110.00, 'paid', '2200', '0.05', '110', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours'),

-- 科技宅男阿傑的收益記錄
('conv_jay_001', 'JAY005', 'order_006', 4580.00, 0.05, 229.00, 'pending', '4580', '0.05', '229', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('conv_jay_002', 'JAY005', 'order_007', 3200.00, 0.05, 160.00, 'confirmed', '3200', '0.05', '160', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

-- 檢查插入的資料
SELECT 
  ac.id,
  ac.affiliate_code,
  ac.order_id,
  ac.order_total,
  ac.commission_amount,
  ac.status,
  ap.name as partner_name
FROM affiliate_conversion ac
LEFT JOIN affiliate_partner ap ON ac.affiliate_code = ap.affiliate_code
ORDER BY ac.created_at DESC;
