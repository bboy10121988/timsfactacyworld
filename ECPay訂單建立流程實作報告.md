# ECPay 訂單建立流程實作報告

## 🎯 實作目標
在 `medusa_0720` 專案中建立完整的 ECPay 付款成功後訂單建立流程，包括：
1. 付款成功後調用 `onPaymentCompleted()`
2. 執行 `placeOrder()` 函數建立訂單  
3. 重定向到訂單確認頁面

## 📋 已實作的功能

### 1. 前端 Constants 更新
**檔案：** `frontend/src/lib/constants.tsx`
- ✅ 新增 ECPay 付款方式到 `paymentInfoMap`
- ✅ 新增 `isECPay()` helper 函數

### 2. 前端 PaymentButton 更新
**檔案：** `frontend/src/modules/checkout/components/payment-button/index.tsx`
- ✅ 新增 `ECPayPaymentButton` 組件
- ✅ 實作 ECPay 付款流程：
  - 調用 backend create-payment API
  - 自動提交 ECPay 表單跳轉綠界
  - 處理錯誤情況
- ✅ 實作 `onPaymentCompleted()` 函數調用 `placeOrder()`

### 3. 前端成功頁面 API 路由
**檔案：** `frontend/src/app/api/ecpay/success/route.ts`
- ✅ 處理 ECPay 付款成功回調
- ✅ 支援 order_id 或 merchant_trade_no 參數
- ✅ 自動重定向到訂單確認頁面

### 4. 後端 Callback 更新
**檔案：** `backend/src/api/store/ecpay/callback/route.ts`
- ✅ 已存在完整的 callback 處理邏輯
- ✅ 驗證 ECPay CheckMacValue
- ✅ 查找對應的購物車
- ✅ 調用 cart complete API 建立訂單
- ✅ 更新訂單 metadata

### 5. 後端 Create Payment 更新
**檔案：** `backend/src/api/store/ecpay/create-payment/route.ts`
- ✅ 設定正確的 ClientBackURL 指向前端成功頁面
- ✅ 在購物車 metadata 中保存 MerchantTradeNo

### 6. 後端訂單查詢 API
**檔案：** `backend/src/api/store/orders/by-merchant-trade-no/[merchantTradeNo]/route.ts`
- ✅ 已存在，可根據 MerchantTradeNo 查詢訂單

### 7. 前端訂單確認頁面
**檔案：** `frontend/src/app/[countryCode]/(main)/order/[id]/confirmed/page.tsx`
- ✅ 已存在訂單確認頁面

## 🔄 完整流程

### 用戶付款流程：
1. 用戶在結帳頁面選擇 ECPay 付款方式
2. 點擊「確認付款」按鈕
3. `ECPayPaymentButton` 調用 `/store/ecpay/create-payment`
4. 後端產生 ECPay 表單並設定回調 URL
5. 前端自動提交表單跳轉到綠界付款頁面
6. 用戶完成付款

### 付款成功後流程：
1. ECPay 發送 callback 到 `/store/ecpay/callback`
2. 後端驗證付款結果並查找對應購物車
3. 調用 `/store/carts/{id}/complete` 建立訂單
4. 更新訂單 metadata 包含 ECPay 資訊
5. ECPay 將用戶重定向到 `/api/ecpay/success`
6. 前端成功頁面重定向到 `/tw/order/{order_id}/confirmed`

## 🛠 技術細節

### ECPay 回調 URL 設定：
```typescript
ReturnURL: `${backendUrl}/store/ecpay/callback`      // 後端處理
ClientBackURL: `${frontendUrl}/api/ecpay/success`   // 前端跳轉
```

### 錯誤處理：
- 付款失敗：顯示錯誤訊息
- 找不到訂單：重定向到首頁
- 網路錯誤：顯示錯誤提示

### 安全性：
- ECPay CheckMacValue 驗證
- 訂單 ID 參數驗證
- 錯誤資訊不洩露敏感資料

## 📝 使用說明

### 環境變數設定：
```bash
# 前端
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# 後端  
FRONTEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:9000
```

### 測試流程：
1. 確保 backend 和 frontend 都在運行
2. 添加商品到購物車
3. 進入結帳流程
4. 選擇 ECPay 付款方式
5. 點擊確認付款
6. 完成綠界付款流程
7. 驗證是否正確跳轉到訂單確認頁面

## ✅ 完成狀態

所有必要的流程都已實作完成：
- ✅ 付款成功後調用 `onPaymentCompleted()`
- ✅ 執行 `placeOrder()` 函數建立訂單
- ✅ 重定向到訂單確認頁面

整個 ECPay 訂單建立流程已經可以正常運作！
