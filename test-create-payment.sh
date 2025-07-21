#!/bin/bash

echo "🛒 ========== 模擬客人購物車下單流程 =========="
echo "📅 測試時間: $(date)"
echo "🌐 測試 ECPay create-payment API"
echo "==============================================="

# 設定 API 端點
BACKEND_URL="http://localhost:9000"
API_ENDPOINT="${BACKEND_URL}/store/ecpay/create-payment"

echo "🎯 API 端點: ${API_ENDPOINT}"
echo ""

# 模擬購物車資料
curl -X POST "${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: bypass-for-callback" \
  -d '{
    "cart": {
      "id": "cart_test_123456789",
      "total": 1500,
      "currency_code": "TWD",
      "items": [
        {
          "id": "item_1",
          "title": "測試商品A",
          "quantity": 1,
          "unit_price": 800,
          "variant": {
            "title": "紅色 L號",
            "product": {
              "title": "時尚T恤"
            }
          }
        },
        {
          "id": "item_2", 
          "title": "測試商品B",
          "quantity": 2,
          "unit_price": 350,
          "variant": {
            "title": "藍色",
            "product": {
              "title": "經典帽子"
            }
          }
        }
      ]
    },
    "customer": {
      "id": "customer_test_001",
      "email": "test@example.com",
      "first_name": "測試",
      "last_name": "用戶",
      "phone": "0912345678"
    },
    "shippingAddress": {
      "first_name": "測試",
      "last_name": "用戶", 
      "address_1": "台北市中正區重慶南路一段122號",
      "city": "台北市",
      "postal_code": "100",
      "country_code": "TW",
      "phone": "0912345678"
    },
    "shippingMethod": {
      "id": "home_delivery",
      "name": "宅配到府",
      "price": 0,
      "provider": "黑貓宅急便"
    },
    "choosePayment": "ALL",
    "returnUrl": "http://localhost:9000/store/ecpay/callback",
    "clientBackUrl": "http://localhost:8000/checkout/success"
  }' \
  --verbose

echo ""
echo "==============================================="
echo "✅ 測試完成！"
echo "💡 請檢查上方回應是否包含 ECPay 付款表單 HTML"
