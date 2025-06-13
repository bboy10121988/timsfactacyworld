# 字體系統標準化完成報告 (2025 年最佳實踐版)

## 🚀 最新更新：2025 年最佳字型組合實施

基於 SystemFontStack.com、CSS-Tricks 和 MDN 的最新研究，我們實施了現代化的系統字型堆疊：

### 🎯 核心優勢
- **零網路請求**：使用系統內建字體，載入速度最快
- **原生體驗**：用戶熟悉的系統字體，提升可讀性和舒適度
- **完整 Unicode 支援**：系統字體提供最完整的字符集支援
- **避免 FOIT**：設定 `font-display: swap` 避免隱藏文字閃爍
- **自動優化**：啟用字距調整、連字、上下文替代等現代字型特性

### 📱 跨平台字體對應
| 平台 | 標題字體 | 內文字體 | 中文字體 |
|------|----------|----------|----------|
| macOS/iOS | SF Pro Display | SF Pro Text | PingFang TC/SC |
| Windows | Segoe UI Variable | Segoe UI | Microsoft JhengHei UI |
| Android | Roboto | Roboto | Noto Sans TC/SC |
| Linux | Ubuntu/Cantarell | Liberation Sans | Noto Sans TC/SC |

## 📝 統一字體等級系統

### 主要標題類別 (.h1, .h2, .h3, .h4)

#### .h1 - 主標題
- **字體**: Helvetica Neue
- **大小**: 36px (2.25rem)
- **權重**: 300 (light)
- **行高**: 1.2
- **字距**: 0.2em
- **下邊距**: 1.5rem
- **用途**: 主要標題、區塊標題

#### .h2 - 副標題  
- **字體**: Noto Sans TC
- **大小**: 30px (1.875rem)
- **權重**: 400 (normal)
- **行高**: 1.3
- **顏色**: #6b7280 (gray-500)
- **下邊距**: 1rem
- **用途**: 副標題、描述文字

#### .h3 - 三級標題
- **字體**: Helvetica Neue
- **大小**: 24px (1.5rem)
- **權重**: 400 (normal)
- **行高**: 1.4
- **字距**: 0.1em
- **下邊距**: 0.5rem (當作為主標題時，與副標題組合緊密)
- **用途**: 卡片標題、次要標題

#### .h4 - 四級標題
- **字體**: Noto Sans TC
- **大小**: 20px (1.25rem)
- **權重**: 500 (medium)
- **行高**: 1.4
- **下邊距**: 0.75rem
- **用途**: 小標題、標籤、副標題

### 🎯 標題組合間距系統
- **h1 + h2**: 主標題與大副標題組合，間距 0.5rem
- **h2 + h3**: 副標題與三級標題組合，間距 0.25rem  
- **h3 + h4**: 卡片標題與副標題組合，間距 0.25rem
- **自動顏色**: 副標題自動套用 gray-500 顏色，營造視覺層次

### 向後相容類別

#### .section-heading (等同於 .h2)
- 保持現有代碼正常運作
- 樣式與 .h2 相同

#### .section-subheading (等同於 .h3)
- 保持現有代碼正常運作
- 樣式與 .h3 相同

#### .blog-heading (等同於 .h1)
- 保持現有代碼正常運作
- 樣式與 .h1 相同

## ✅ 已更新的組件列表

### 1. Blog 模組 ⭐ 完全統一
- **blog-posts.tsx**: 主標題從 `blog-heading` → `h1`
- **blog-card.tsx**: 
  - 卡片標題從 `h3` → `h2` 
  - 內文摘要從 `text-base-regular` → `text-content-responsive`
- **sanity-content.tsx**: 
  - 所有內文樣式從 `text-base-regular` → `text-content-responsive`
  - 段落、引用、連結、強調、列表統一使用響應式內文樣式
- **blog-list.tsx**: 分頁按鈕從 `text-sm` → `text-body-small`
- **blog/page.tsx**: 
  - 描述文字統一為 `text-content-responsive`
  - 分類連結統一為 `text-body-small`
  - 錯誤狀態文字統一為 `text-content-responsive`
- **blog/[slug]/page.tsx**: 
  - 移除 `prose prose-lg` 容器
  - 日期和分類標籤統一為 `text-body-small`

### 2. Home 模組
- **image-text-block/index.tsx**: 所有布局變體統一使用 `text-content-responsive` 內文樣式
- **service-cards-section/index.tsx**: 
  - 卡片標題使用 `h3`
  - 區塊標題使用 `h1`
  - 副標題使用 `h2`
  - 所有小標題使用 `h4`
  - **✨ 新增**: 標題副標題間距優化，移除容器 margin，使用全域組合樣式
- **hero/index.tsx**: 主標題使用 `h1`，副標題使用 `h2`
- **youtube-section.tsx**: 描述文字從 `h2` 修正為 `text-body-large`

### 3. Pages 模組
- **contact-section.tsx**: 已確認使用正確的統一類別
- **page-renderer.tsx**: 已確認符合標準

### 4. Layout 模組
- **footer/index.tsx**: 已確認符合標準

### 5. Products 模組
- **product-preview/index.tsx**: 按鈕文字統一使用 `h4`

## 🎯 字體系統特色

### 響應式設計
- `.h1` 在桌面端自動調整為更大尺寸 (2.5rem)
- 行高自動優化為 1.2
- **✨ 新增**: 智能標題組合間距系統

### 多語言支援
- **中文內容**: 使用 Noto Sans TC
- **英文標題**: 使用 Helvetica Neue
- **系統字體**: 完整的 fallback 字體堆疊

### 一致性保證
- 所有標題元素使用統一的間距系統
- 顏色遵循設計系統 (gray-500, gray-600 等)
- 字距和行高經過優化以提升可讀性
- **✨ 新增**: 標題副標題自動組合間距，無需手動調整

## 🔧 技術實現

### CSS 變數系統
```css
:root {
  --font-base: var(--font-source-han-sans-tc), 'Noto Sans TC', ...;
  --font-heading: 'Helvetica Neue', var(--font-source-han-sans-tc), ...;
}
```

### Tailwind 整合
- 在 `tailwind.config.js` 中定義相同的類別
- 確保與 Tailwind 的其他工具類別完美配合

### 向後相容
- 保留所有舊的類別名稱
- 漸進式升級，不破壞現有功能

## 📊 清理成果

### 移除的自定義樣式
- `font-['Helvetica_Neue'] font-light tracking-[0.2em]`
- `text-3xl md:text-4xl`
- `font-['Helvetica_Neue'] text-sm font-light tracking-[0.2em]`
- 各種內聯字體樣式

### 統一後的效果
- **代碼減少**: 大幅減少重複的內聯樣式
- **維護性提升**: 集中管理字體樣式
- **一致性確保**: 全站統一的視覺層次
- **效能優化**: 減少 CSS 檔案大小

## 🚀 使用建議

### 新組件開發
```tsx
// ✅ 推薦寫法
<h1 className="h1">主標題</h1>
<h2 className="h2">副標題</h2>
<h3 className="h3">三級標題</h3>
<h4 className="h4">四級標題</h4>

// ❌ 避免使用
<h1 className="text-3xl font-['Helvetica_Neue'] font-light tracking-[0.2em]">標題</h1>
```

### 顏色組合
```tsx
// 主標題 (深色)
<h1 className="h1">標題</h1>

// 主標題 (白色，用於深色背景)
<h1 className="h1 text-white">標題</h1>

// 副標題已內建灰色
<h2 className="h2">副標題</h2>
```

## 🎉 完成狀態

✅ **字體系統標準化 100% 完成**
- 所有主要組件已更新
- 統一 CSS 類別系統建立
- 向後相容性確保
- 響應式設計實現
- 多語言字體支援完善

整個網站現在擁有一致、可維護且高效的字體系統！
