# Medusa 促銷標籤系統使用指南

## 概述

本系統整合了所有 Medusa 促銷活動類型，自動根據商品資料生成相應的標籤，支援：

- 自動折扣計算
- 手動設定的促銷標籤
- 庫存狀態標籤
- 各種行銷活動標籤

## 支援的標籤類型

### 1. 自動折扣標籤 (auto-discount)
- 自動計算商品變體的 `original_amount` 與 `calculated_amount` 差異
- 顯示格式：`XX% OFF`
- 最高優先級顯示

### 2. 手動折扣標籤 (manual-discount)
- 從商品 metadata 的 `discount` 欄位讀取
- 只有在沒有自動折扣時才顯示
- 支援智能格式化

### 3. 促銷活動標籤 (promotion/campaign)
- `promotion`: 自定義促銷文字
- `campaign`: 促銷活動名稱
- `promotion_type`: 促銷類型（new, hot, limited, etc.）

### 4. 庫存狀態標籤
- `sold-out`: 完全售罄
- `preorder`: 可預訂

### 5. 特殊標籤
- `flash-sale`: 限時搶購
- `clearance`: 清倉特價
- `bundle`: 組合優惠
- `exclusive`: 獨家商品
- `discount-code`: 折扣碼提示

## Metadata 設定範例

### 基本促銷設定
```json
{
  "discount": "20",
  "promotion": "春季特賣",
  "promotion_type": "sale"
}
```

### 進階促銷設定
```json
{
  "campaign": "雙11購物節",
  "flash_sale": true,
  "bundle": "買二送一",
  "discount_code_available": true,
  "special_event": "限時優惠"
}
```

### 庫存狀態設定
```json
{
  "clearance": true,
  "exclusive": true
}
```

## 標籤優先級（數字越小優先級越高）

1. `sold-out` (1) - 售完
2. `flash-sale` (2) - 限時搶購
3. `auto-discount` (3) - 自動折扣
4. `manual-discount` (4) - 手動折扣
5. `clearance` (5) - 清倉
6. `campaign` (6) - 促銷活動
7. `bundle` (7) - 組合優惠
8. `exclusive` (8) - 獨家
9. `limited` (9) - 限量
10. `promotion` (10) - 促銷
11. `special-event` (11) - 特殊活動
12. `discount-code` (12) - 折扣碼提示
13. `preorder` (13) - 預訂
14. `new` (14) - 新品
15. `hot` (15) - 熱銷
16. `bestseller` (16) - 暢銷
17. `featured` (17) - 精選
18. `sale` (18) - 特價

## 使用方式

### 在 ProductPreview 組件中
```tsx
import { getPromotionLabels } from "@lib/promotion-utils"

const promotionLabels = getPromotionLabels(product)

// 渲染標籤
{promotionLabels.map((label, index) => (
  <div key={`${label.type}-${index}`} className={label.className}>
    {label.text}
  </div>
))}
```

### 除錯模式
```tsx
import { debugPromotionLabels } from "@lib/promotion-utils"

const debugInfo = debugPromotionLabels(product)
console.log("促銷標籤分析:", debugInfo)
```

## CSS 樣式

所有標籤都使用 `.product-label` 基礎樣式，並根據類型添加特定樣式：

```css
.product-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

.product-label.discount {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  animation: pulse-glow 2s infinite;
}

.product-label.flash-sale {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  animation: flash-pulse 1s infinite;
}
```

## 測試範例

### 1. 自動折扣商品
商品變體設定：
- `original_amount`: 1000
- `calculated_amount`: 800
- 結果：顯示 "20% OFF"

### 2. 手動促銷商品
Metadata 設定：
```json
{
  "promotion": "春季特賣",
  "promotion_type": "sale"
}
```

### 3. 限時搶購商品
Metadata 設定：
```json
{
  "flash_sale": true,
  "discount": "30"
}
```

### 4. 組合優惠商品
Metadata 設定：
```json
{
  "bundle": "買二送一",
  "promotion_type": "bundle"
}
```

## 注意事項

1. **標籤限制**：最多同時顯示 3 個標籤
2. **自動覆蓋**：自動計算的折扣會覆蓋手動設定的折扣
3. **庫存優先**：售完和預訂標籤具有最高優先級
4. **響應式設計**：標籤在小螢幕上會自動調整大小
5. **除錯模式**：只在開發環境顯示除錯資訊

## API 參考

### getPromotionLabels(product)
返回商品的所有促銷標籤陣列。

### debugPromotionLabels(product)
返回詳細的標籤分析資訊，用於除錯。

### getProductStockStatus(product)
返回商品的庫存狀態資訊。

### calculateProductDiscount(product)
計算商品的自動折扣資訊。
