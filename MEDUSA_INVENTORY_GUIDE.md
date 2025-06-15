# Medusa 庫存管理指南

本指南將幫助您在 Medusa v2 中設置和管理庫存系統。

## 前置條件

- 已安裝 @medusajs/inventory 模組
- 已在 medusa-config.ts 中啟用庫存模組

## 步驟 1：建立庫存位置 (Stock Location)

首先，您需要創建至少一個庫存位置：

1. 登入管理員後台
2. 導航至 **Settings > Stock Locations**
3. 點擊 **Add Stock Location**
4. 填寫位置資訊（名稱、地址等）
5. 點擊 **Save**

## 步驟 2：將商品變體與庫存項目關聯

對於每個需要追蹤庫存的商品變體：

1. 導航至 **Products**
2. 選擇要管理庫存的商品
3. 在 **Variants** 部分，點擊特定變體
4. 在 **Inventory** 標籤下：
   - 如果尚未關聯，點擊 **Create Inventory Item**
   - 設置 SKU 和/或 EAN 編碼（可選）
   - 點擊 **Save**

## 步驟 3：設置庫存數量

1. 導航至 **Inventory > Inventory Items**
2. 找到您剛建立的庫存項目
3. 點擊 **Edit**
4. 在 **Stock Levels** 部分：
   - 選擇庫存位置
   - 設置庫存數量
   - 點擊 **Save**

## 步驟 4：前端獲取庫存資訊

在前端，您需要額外調用庫存 API 來獲取即時庫存數量：

```javascript
// 1. 先獲取商品變體資訊
const productResponse = await fetch('/store/products/prod_123');
const productData = await productResponse.json();

// 2. 從變體中獲取 inventory_item_id
const variant = productData.product.variants[0];
const inventoryItemId = variant.inventory_item_id;

// 3. 使用 inventory_item_id 查詢庫存可用數量
if (inventoryItemId) {
  const inventoryResponse = await fetch(`/store/inventory-items/${inventoryItemId}/availability`);
  const inventoryData = await inventoryResponse.json();
  
  // 4. 庫存資訊
  console.log(`可用數量: ${inventoryData.available_quantity}`);
  console.log(`總庫存: ${inventoryData.stocked_quantity}`);
  console.log(`已預留: ${inventoryData.reserved_quantity}`);
}
```

## 常見問題排解

### 問題：API 不返回庫存資訊

檢查：
- 庫存模組是否已正確安裝並配置
- 商品變體是否已關聯庫存項目
- 庫存項目是否已分配庫存位置和數量

### 問題：庫存總是顯示為 0

檢查：
- 在管理後台，確認您已經為庫存項目設置了數量
- 確認該庫存項目已分配到至少一個庫存位置

### 問題：庫存變更未反映到前端

- Medusa 的庫存是即時查詢的，但可能存在緩存
- 確認您使用的是 `/store/inventory-items/{id}/availability` 端點
- 檢查您是否在獲取最新的 inventory_item_id
