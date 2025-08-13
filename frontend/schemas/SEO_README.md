# Sanity SEO 標籤系統說明

## 📋 概述

我們已經為 Tim's Fantasy World 建立了完整的 SEO 標籤系統，讓每個頁面都能獨立設定搜尋引擎優化參數。

## 🔍 SEO 設定結構

### 基礎 SEO 設定 `🔍 基礎 SEO 設定`
- **SEO 標題**: 顯示在搜尋結果的標題 (建議 50-60 字元)
- **Meta 描述**: 顯示在搜尋結果的描述 (建議 150-160 字元)  
- **SEO 關鍵字**: 3-5 個主要關鍵字，用標籤形式輸入

### 進階 SEO 設定 `⚙️ 進階 SEO 設定`
- **標準網址**: 避免重複內容的首選網址
- **禁止搜尋引擎索引**: noindex 設定
- **禁止跟隨連結**: nofollow 設定
- **頁面優先級**: 相對重要性 (0.1-1.0)

### 社群媒體分享 `📱 社群媒體分享`
- **社群分享標題**: Facebook, LinkedIn 等平台的標題
- **社群分享描述**: 社群媒體顯示的描述
- **社群分享圖片**: Open Graph 圖片 (建議 1200x630px)
- **Twitter 卡片類型**: Twitter 分享的卡片樣式

## 📄 支援的內容類型

### 1. 首頁 `🏠 homePage`
- 網站首頁的 SEO 設定
- 包含多個內容區塊

### 2. 動態頁面 `📄 pages`
- 關於我們、服務說明等靜態頁面
- 自訂網址路徑
- 啟用/停用控制

### 3. 部落格文章 `✍️ post`
- 文章標題、內容、作者
- 發布狀態管理
- 分類標籤系統

### 4. 分類頁面 `📂 category`  
- 商品分類頁面的 SEO
- 網址路徑設定
- 啟用狀態控制

### 5. 商品頁面 SEO `🛍️ productPage`
- 針對特定商品的 SEO 優化
- 透過商品代碼 (handle) 匹配 Medusa 商品
- 可選擇性啟用自訂 SEO

### 6. 商品系列頁面 SEO `📦 collectionPage`
- 針對特定商品系列的 SEO 優化  
- 透過系列代碼 (handle) 匹配 Medusa 系列
- 可選擇性啟用自訂 SEO

## 🎯 使用指南

### 基本 SEO 設定流程
1. 進入對應的內容類型
2. 展開 `🔍 SEO 優化設定` 區塊
3. 填寫基礎 SEO 設定（標題、描述、關鍵字）
4. 根據需要設定進階選項
5. 設定社群媒體分享資訊

### 商品/系列 SEO 設定
1. 在 `商品頁面 SEO` 或 `商品系列頁面 SEO` 中新增項目
2. 輸入對應的 Medusa handle
3. 設定 SEO 參數
4. 啟用 `啟用自訂 SEO` 選項

## 📊 管理功能

### 預覽功能
每個內容類型都有豐富的預覽資訊：
- 顯示 SEO 標題狀態
- 啟用/停用狀態標示
- 相關元數據預覽

### 驗證規則
- 必填欄位驗證
- 字元數限制警告
- 圖片替代文字必填

## 🔧 開發整合

### 前端調用
```typescript
// 獲取頁面 SEO 資料
const pageData = await getPageBySlug(slug)
const seoData = pageData.seo

// 生成 metadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: seoData.seoTitle || defaultTitle,
    description: seoData.seoDescription || defaultDescription,
    keywords: seoData.seoKeywords,
    openGraph: {
      title: seoData.ogTitle || seoData.seoTitle,
      description: seoData.ogDescription || seoData.seoDescription,
      images: [seoData.ogImage]
    }
  }
}
```

### 商品頁面 SEO 整合
```typescript
// 檢查是否有自訂 SEO 設定
const customSEO = await getProductPageSEO(productHandle)
if (customSEO && customSEO.isActive) {
  // 使用自訂 SEO
  return customSEO.seo
} else {
  // 使用預設商品 SEO
  return generateDefaultProductSEO(product)
}
```

## 📈 SEO 最佳實踐

1. **標題優化**: 每個頁面使用獨特的 SEO 標題
2. **描述撰寫**: 吸引人且包含主要關鍵字的描述
3. **關鍵字選擇**: 相關性高、競爭度適中的關鍵字
4. **圖片優化**: 社群分享圖片使用高品質、符合比例的圖片
5. **定期檢查**: 監控 SEO 表現並適時調整

## 🚀 下一步

1. 設定網站基礎 SEO 資訊
2. 為主要頁面填寫 SEO 設定
3. 為熱門商品/系列建立專屬 SEO
4. 定期更新部落格文章 SEO
5. 監控搜尋表現並優化
