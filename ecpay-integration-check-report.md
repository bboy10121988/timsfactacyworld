# ECPay 金流與 Medusa 訂單系統整合檢查報告

## 檢查結果總結
✅ **整體流程完整** - 綠界付款金流到 Medusa 訂單系統的整合已基本完成
❌ **發現關鍵問題** - Cart metadata 更新缺失（已修復）

## 檢查要點

### 1. 付款建立流程 ✅
**檔案**: `/backend/src/api/store/ecpay/create-payment/route.ts`

**流程**:
1. 前端呼叫 `/api/ecpay/payment` 
2. 轉發至後端 `/store/ecpay/create-payment`
3. 生成唯一 `MerchantTradeNo`
4. 呼叫 ECPay 服務建立付款表單
5. **修復**: 新增 Cart metadata 更新邏輯

**修復內容**:
```typescript
// 將 MerchantTradeNo 保存到 Cart 的 metadata 中
existingCart.metadata = {
  ...existingCart.metadata,
  ecpay_merchant_trade_no: merchantTradeNo,
  ecpay_created_at: new Date().toISOString(),
  ecpay_total_amount: totalAmount
}
```

### 2. Callback 處理流程 ✅
**檔案**: `/backend/src/api/store/ecpay/callback/route.ts`

**流程**:
1. ECPay 付款完成後回調
2. 驗證 CheckMacValue 安全性
3. 根據 MerchantTradeNo 查找對應 Cart
4. 呼叫 Medusa API 完成訂單 (`/store/carts/{id}/complete`)
5. 更新 Order metadata 記錄 ECPay 相關資訊
6. 回應 ECPay `"1|OK"`

**安全性檢查**: 
- ✅ CheckMacValue 驗證
- ✅ RtnCode 狀態檢查
- ✅ 多重 Cart 查找機制

### 3. 環境配置 ✅
**檔案**: `/backend/.env`

```bash
ECPAY_MERCHANT_ID=2000132
ECPAY_HASH_KEY=ejCk326UnaZWKisg  
ECPAY_HASH_IV=q9jcZX8Ib9LM8wYk
ECPAY_RETURN_URL=http://localhost:9000/store/ecpay/callback
```

**URL 配置正確**: Callback 指向後端 API

### 4. 前端整合 ✅
**檔案**: `/frontend/src/app/api/ecpay/payment/route.ts`

**流程**:
1. 驗證購物車和收件資訊
2. 轉發請求至後端
3. 接收 ECPay HTML 表單
4. 在新視窗開啟付款頁面

## 關鍵技術實作

### 訂單完成機制
```typescript
// 使用 HTTP 請求完成購物車（更可靠的方式）
const completeUrl = `${backendUrl}/store/carts/${cart.id}/complete`
const response = await fetch(completeUrl, { 
  method: "POST",
  headers: {
    'Content-Type': 'application/json',
    'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY || ''
  },
  body: JSON.stringify({ payment_captured: true })
})
```

### Metadata 追蹤
**Cart Metadata** (付款建立時):
```typescript
{
  ecpay_merchant_trade_no: "ORDER1234567",
  ecpay_created_at: "2025-01-21T10:00:00Z",
  ecpay_total_amount: 1000
}
```

**Order Metadata** (付款完成時):
```typescript
{
  ecpay_merchant_trade_no: "ORDER1234567",
  ecpay_trade_no: "2025012110000001",
  ecpay_payment_date: "2025/01/21 18:00:00",
  ecpay_payment_type: "Credit_CreditCard",
  ecpay_trade_amt: "1000"
}
```

## 測試建議

### 1. 本地測試
```bash
# 1. 啟動 Medusa 後端
cd backend && npm run dev

# 2. 啟動前端
cd frontend && npm run dev

# 3. 使用 ngrok 公開 callback URL
ngrok http 9000
# 更新 .env 中的 ECPAY_RETURN_URL
```

### 2. 測試流程
1. 建立購物車並選擇商品
2. 進入結帳頁面填寫資訊
3. 點擊付款，確認 ECPay 表單正常開啟
4. 在 ECPay 測試環境完成付款
5. 檢查 callback 是否正常執行
6. 確認 Medusa 中訂單狀態已更新

### 3. 日誌檢查
**後端日誌關鍵字**:
- `🔔 ECPay callback received`
- `✅ ECPay callback verification passed`
- `✅ Order completed successfully`
- `✅ Cart metadata updated with MerchantTradeNo`

## 潛在問題與解決方案

### 1. ❌ 原問題：Cart 找不到
**原因**: 建立付款時未將 MerchantTradeNo 存入 Cart metadata
**解決**: 已在 `create-payment` 中新增 metadata 更新邏輯

### 2. ⚠️ 網路問題
**風險**: Callback 網路中斷或超時
**解決**: 
- 使用多重 Cart 查找機制
- 完整的錯誤處理和日誌記錄
- 可考慮增加重試機制

### 3. ⚠️ 環境差異
**風險**: 測試/正式環境配置差異
**解決**: 
- 環境變數統一管理
- 部署檢查清單
- URL 配置驗證

## 結論

✅ **整合完整性**: ECPay 到 Medusa 的完整金流整合已實現
✅ **安全性**: CheckMacValue 驗證和狀態檢查完備  
✅ **可靠性**: 多重錯誤處理和查找機制
✅ **追蹤性**: 完整的 metadata 記錄和日誌系統

**修復後的系統應該能夠正常處理**:
1. 付款建立 → ECPay 表單
2. 用戶付款 → ECPay callback 
3. Callback 驗證 → Medusa 訂單完成
4. 訂單狀態更新 → 系統記錄完整

**建議**:
1. 在正式環境部署前進行完整測試
2. 設定適當的監控和告警機制
3. 定期檢查 ECPay callback 成功率
