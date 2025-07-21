# 宅配訂單 Callback 功能實作報告

## 🎯 功能概述
當客戶完成宅配訂單時，系統會自動發送一個 HTTP callback 到指定的端點 `http://localhost:9000/app/orders`，通知外部系統有新的宅配訂單需要處理。

## 🔧 技術實作

### 1. 修改訂單完成邏輯
**檔案**: `/backend/src/api/store/carts/[id]/complete/route.ts`

**新增功能**:
- 自動偵測宅配配送方式
- 組裝完整的訂單資料
- 發送非同步 HTTP callback
- 錯誤處理不影響主流程

**觸發條件**:
```typescript
const isHomeDelivery = shippingMethod?.name?.includes('宅配') || 
                      shippingMethod?.name?.toLowerCase().includes('home') ||
                      (cart.metadata && (cart.metadata as any).shipping_type === 'home_delivery')
```

### 2. 創建 Callback 接收端點
**檔案**: `/backend/src/api/app/orders/route.ts`

**功能**:
- 接收宅配訂單 callback 資料
- 驗證必要欄位
- 記錄訂單處理日誌
- 提供 API 文檔

## 📋 Callback 資料結構

```typescript
interface HomeDeliveryOrderCallback {
  order_id: string              // 訂單編號
  cart_id: string               // 購物車編號
  status: string                // 訂單狀態
  payment_status: string        // 付款狀態
  fulfillment_status: string    // 履行狀態
  total: number                 // 總金額
  currency_code: string         // 幣別
  email: string                 // 客戶 Email
  customer_id?: string          // 客戶編號
  shipping_address: object      // 配送地址
  billing_address?: object      // 帳單地址
  items: array                  // 訂單商品清單
  shipping_method: string       // 配送方式
  created_at: string            // 建立時間
  metadata?: object             // 額外資料
  callback_type: string         // Callback 類型標識
}
```

## 🚀 部署配置

### 環境變數
在 `.env` 檔案中可設定 callback URL：
```bash
# 宅配訂單 callback URL（可選，預設為 http://localhost:9000/app/orders）
HOME_DELIVERY_CALLBACK_URL=http://localhost:9000/app/orders
```

### CORS 設定
確保 callback 接收端點允許來自 Medusa 後端的請求。

## 📊 測試驗證

### 1. 使用測試工具
開啟 `宅配訂單callback測試工具.html` 進行測試：
- 測試 callback 接收端點
- 模擬宅配訂單完成
- 完整流程測試

### 2. 手動測試
1. 在前端完成一個宅配訂單
2. 檢查後端控制台日誌
3. 確認 callback 是否成功發送

### 3. 監控 Callback
查看後端日誌關鍵字：
```bash
🚚 Detected home delivery order, sending callback...
✅ Home delivery callback sent successfully
⚠️ Home delivery callback failed
```

## 🔄 工作流程

```
1. 客戶完成結帳 (宅配)
   ↓
2. 系統偵測配送方式
   ↓  
3. 創建訂單成功
   ↓
4. 自動發送 callback
   ↓
5. 外部系統接收處理
```

## 💼 業務應用場景

### 倉庫管理系統整合
- 自動通知倉庫準備出貨
- 更新庫存狀態
- 安排揀貨作業

### 客戶服務系統
- 發送訂單確認郵件
- 建立客服工單
- 更新客戶訂單狀態

### 物流系統整合
- 自動建立配送單
- 安排配送路線
- 追蹤配送狀態

## ⚠️ 注意事項

1. **非阻塞設計**: Callback 失敗不會影響訂單完成流程
2. **錯誤處理**: 完整的錯誤日誌記錄
3. **安全性**: 建議在正式環境中加入認證機制
4. **重試機制**: 可考慮在未來版本中加入重試邏輯
5. **監控告警**: 建議設定 callback 失敗的監控告警

## 📁 檔案清單

| 檔案路徑 | 功能描述 | 狀態 |
|---------|---------|------|
| `/backend/src/api/store/carts/[id]/complete/route.ts` | 修改訂單完成邏輯，加入 callback | ✅ 完成 |
| `/backend/src/api/app/orders/route.ts` | Callback 接收端點 | ✅ 完成 |
| `宅配訂單callback測試工具.html` | 測試工具 | ✅ 完成 |

## ✅ 完成狀態

- **功能實作**: ✅ 完成
- **測試工具**: ✅ 完成
- **文檔說明**: ✅ 完成
- **部署就緒**: ✅ 可立即使用

## 🚀 後續建議

1. **監控儀表板**: 建立 callback 成功率監控
2. **重試機制**: 加入失敗重試邏輯
3. **認證機制**: 在正式環境加入 API 認證
4. **批次處理**: 考慮批次發送 callback 減少請求頻率
5. **webhook 管理**: 建立 webhook 管理介面

---

**實作完成時間**: 2025年7月21日  
**狀態**: ✅ 可立即使用  
**測試建議**: 使用提供的測試工具進行驗證
