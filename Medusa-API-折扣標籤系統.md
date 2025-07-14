# Medusa API 折扣標籤系統

## 📋 系統說明

此系統現在**只顯示來自 Medusa 促銷模組的真實折扣標籤**，移除了所有其他來源的標籤（metadata、tags、本地計算等）。

## 🎯 標籤來源

**唯一來源：Medusa 促銷模組 API**
- 透過 `getActivePromotionLabels()` 函數獲取
- 基於真實的購物車測試
- 只顯示有效的促銷活動折扣

## 🏷️ 支援的標籤類型

### 1. 百分比折扣 (`auto-discount`)
- **來源**: Medusa 促銷活動 (percentage type)
- **顯示**: `7折`, `8折`, `9折` 等
- **範例**: 20% OFF → 顯示為 `8折`

### 2. 固定金額折扣 (`manual-discount`)
- **來源**: Medusa 促銷活動 (fixed type)
- **顯示**: `-NT$200`, `折NT$100` 等
- **範例**: 固定折扣 NT$50 → 顯示為 `折NT$50`

### 3. 訂單折扣 (`campaign` / `special-event`)
- **來源**: 促銷代碼包含 "order"
- **顯示**: `滿額訂單8折`, `滿額折NT$200` 等
- **範例**: 訂單滿額享 20% OFF → 顯示為 `滿額訂單8折`

## ⚙️ 技術實現

### 工作流程
1. **創建測試購物車**: 使用指定 region
2. **添加商品**: 將目標商品添加到購物車
3. **檢查促銷**: 分析應用的促銷活動
4. **生成標籤**: 根據促銷類型生成對應標籤
5. **清理購物車**: 刪除測試用購物車

### API 端點
```javascript
// 創建購物車
POST /store/carts
{
  "region_id": "reg_01JW1S1F7GB4ZP322G2DMETETH"
}

// 添加商品
POST /store/carts/{cart_id}/line-items
{
  "variant_id": "variant_id",
  "quantity": 1
}
```

### 標籤計算邏輯
```javascript
// 百分比折扣轉換為台灣折扣表示法
const taiwanDiscount = (100 - discountPercent) / 10
const discountText = `${taiwanDiscount}折`

// 固定金額折扣
const discountText = `-NT$${discountAmount}`
```

## 🎨 標籤樣式

所有標籤使用統一的黑底白字樣式：
```css
.promotion-label {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
  background-color: rgba(41, 37, 36, 0.9);
  color: white;
  border: 1px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## 🔍 測試與除錯

### 測試頁面
- **專用測試頁**: `http://localhost:3000/test-labels`
- **商品頁面**: `http://localhost:3000/products`

### 開發模式日誌
```javascript
console.log(`【${product.title}】Medusa API 促銷標籤:`, labels)
console.log(`【${product.title}】標籤數量:`, labels.length)
```

### 測試腳本
```bash
# 執行促銷活動設定
node setup-promotion-test.js

# 檢查 Medusa 後端狀態
curl http://localhost:9000/health
```

## 🚫 移除的功能

以下功能已被移除，不再支援：

### ❌ Metadata 標籤
- 不再從產品 `metadata` 讀取促銷標籤
- 不支援手動設定的折扣文字

### ❌ Tags 標籤  
- 不再從產品 `tags` 讀取標籤
- 不支援 "new", "hot", "featured" 等標籤

### ❌ 本地計算折扣
- 不再比較 `original_amount` vs `calculated_amount`
- 不支援 fallback 標籤計算

### ❌ 庫存狀態標籤
- 不再顯示 "售完"、"預訂" 等狀態標籤

## 📋 建立促銷活動

### 透過 Medusa Admin
1. 開啟 `http://localhost:9000/admin`
2. 登入管理員帳號
3. 進入 "Promotions" 頁面
4. 點擊 "Create Promotion"
5. 設定促銷資訊：
   - **Code**: 促銷代碼 (如: SUMMER20)
   - **Type**: Percentage 或 Fixed
   - **Value**: 折扣數值
   - **Application**: Products 或 Order
6. 儲存並啟用

### 範例促銷活動
```json
{
  "code": "SUMMER20",
  "type": "percentage",
  "value": 20,
  "application_method": {
    "type": "percentage",
    "target_type": "items"
  }
}
```

## 🎯 優點

### ✅ 數據準確性
- 只顯示真實有效的促銷活動
- 避免假資料或過期標籤

### ✅ 一致性
- 與購物車計算邏輯完全一致
- 用戶看到的標籤與實際折扣相符

### ✅ 維護簡單
- 單一資料來源，易於管理
- 減少程式碼複雜度

### ✅ 商業邏輯清晰
- 促銷活動由後端統一管理
- 前端只負責顯示，不做計算

---

**這個簡化的系統確保了標籤的準確性和一致性，只顯示來自 Medusa 促銷模組的真實折扣標籤。**
