#!/bin/bash

echo "🚀 ========== ECPay 完整流程測試 =========="
echo "📅 測試時間: $(date)"
echo "🔄 測試流程: 綠界 → 中間件 → Callback → Medusa 內部服務"
echo "==============================================="

echo ""
echo "🌐 模擬綠界發送付款通知到我們的 callback..."
echo "📡 URL: http://localhost:9000/store/ecpay/callback"
echo ""

# 模擬綠界發送的真實 callback 資料
curl -X POST "http://localhost:9000/store/ecpay/callback" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "User-Agent: ECPay-Gateway" \
  -d "MerchantTradeNo=ORDER1234567" \
  -d "RtnCode=1" \
  -d "RtnMsg=交易成功" \
  -d "TradeNo=2024072212345678" \
  -d "TradeAmt=1500" \
  -d "PaymentDate=2024/07/22 14:30:15" \
  -d "PaymentType=Credit_CreditCard" \
  -d "CheckMacValue=ABC123DEF456" \
  --verbose

echo ""
echo ""
echo "==============================================="
echo "✅ 測試完成！"
echo ""
echo "📊 請檢查以下內容："
echo "1. 🛡️ 中間件是否顯示 'ECPay callback - API Key validation bypassed'"
echo "2. 📥 Callback 是否接收到詳細的付款資料"
echo "3. 🔍 是否成功查找到對應的購物車"
echo "4. 💳 是否成功建立 Medusa 訂單"
echo "5. 🎯 是否回應綠界 '1|OK'"
echo ""
echo "💡 如果看到錯誤，請檢查後端 console 的詳細 log"
