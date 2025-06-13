# 字型系統最佳實踐指南 (2025 年版)

## 🌟 核心理念：系統字體優先

根據 SystemFontStack.com、CSS-Tricks、MDN 等權威資源的最新建議，現代 Web 應用應優先使用系統字體：

### 為什麼選擇系統字體？

1. **性能最佳化**
   - 零網路請求，瞬間載入
   - 無需字體解析時間
   - 避免 FOIT (Flash of Invisible Text)

2. **用戶體驗**
   - 用戶熟悉的字體，提升可讀性
   - 原生應用般的體驗
   - 減少認知負擔

3. **技術優勢**
   - 完整的 Unicode 支援
   - 多種字重和樣式
   - 自動支援新的作業系統字體更新

## 🎨 我們的字型堆疊策略

### 系統字體堆疊 (Font Stack)
```css
/* 內文字體 - 系統字體優先 */
--font-base: 
  /* 現代系統字體 */
  -apple-system, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI',
  /* 中文優質字體 */
  'Noto Sans TC', 'Noto Sans SC', 'Microsoft JhengHei UI', 'PingFang TC',
  /* 西文現代字體 */
  'Inter Variable', 'Inter', 'Roboto', 'Helvetica Neue',
  /* 系統備用 */
  system-ui, ui-sans-serif, sans-serif;

/* 標題字體 - 英文優先優化 */
--font-heading: 
  /* Apple 系統字體 */
  'SF Pro Display', -apple-system, BlinkMacSystemFont,
  /* Microsoft 現代字體 */
  'Segoe UI Variable', 'Segoe UI',
  /* 中文標題字體 */
  'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei UI',
  /* 系統備用 */
  system-ui, ui-sans-serif, sans-serif;
```

### 字型載入優化
```css
:root {
  --font-display: swap; /* 避免 FOIT */
}

html {
  font-display: var(--font-display);
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## 📊 性能對比

| 方案 | 載入時間 | 網路請求 | 字符支援 | 用戶體驗 |
|------|----------|----------|----------|----------|
| 系統字體 | 0ms | 0 | 完整 | 原生 |
| Web 字體 | 100-500ms | 1-3 個 | 有限 | 需適應 |
| Google Fonts | 200-800ms | 2-4 個 | 有限 | 需適應 |

## 🌍 國際化支援

### 多語言字體對應
- **繁體中文**：Noto Sans TC, PingFang TC, Microsoft JhengHei UI
- **簡體中文**：Noto Sans SC, PingFang SC, Microsoft YaHei UI
- **日文**：Hiragino Sans, Yu Gothic UI, Meiryo UI
- **韓文**：Malgun Gothic, Apple SD Gothic Neo
- **阿拉伯文**：Segoe UI, Tahoma, Arabic UI

### 表情符號支援
```css
'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'
```

## 🛠️ 實際應用指南

### 基本使用
```tsx
// ✅ 推薦：使用統一類別
<h1 className="h1">主標題</h1>
<p className="text-content-responsive">內文</p>

// ❌ 避免：內聯字體樣式
<h1 style={{fontFamily: 'Helvetica Neue', fontSize: '36px'}}>標題</h1>
```

### 響應式設計
```css
.text-content-responsive {
  font-size: 1rem; /* 16px mobile */
}

@media (min-width: 768px) {
  .text-content-responsive {
    font-size: 1.125rem; /* 18px desktop */
  }
}
```

### 無障礙支援
```css
/* 符合 WCAG 2.1 AA 標準 */
.h1 { color: #111827; } /* 對比度 > 7:1 */
.h2 { color: #6b7280; } /* 對比度 > 4.5:1 */
```

## 🔧 除錯和測試

### 字體檢測工具
```javascript
// 檢測實際使用的字體
function detectFont(element) {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.fontFamily;
}

// 使用方式
console.log('當前字體：', detectFont(document.querySelector('.h1')));
```

### 瀏覽器開發者工具
1. 開啟 DevTools → Elements
2. 選擇文字元素
3. 查看 Computed 面板中的 `font-family`
4. 確認實際渲染的字體

## 📋 檢查清單

### 實施前檢查
- [ ] 確認目標用戶的主要平台 (Windows, macOS, Android, iOS)
- [ ] 測試主要語言的顯示效果
- [ ] 驗證字體堆疊的覆蓋率

### 實施後驗證
- [ ] 在不同作業系統上測試
- [ ] 檢查 Lighthouse 字體相關評分
- [ ] 驗證載入性能改善
- [ ] 確認無障礙標準符合性

### 維護指南
- [ ] 定期更新字體堆疊 (年度檢查)
- [ ] 監控新的系統字體發布
- [ ] 追蹤瀏覽器字體支援更新

## 🏆 2025 年最推薦組合

### 🥇 第一名：現代系統字體堆疊
我們實施的組合，基於 SystemFontStack.com 建議：

**優勢：**
- ✅ 零延遲載入
- ✅ 跨平台一致性
- ✅ 完整 Unicode 支援
- ✅ 原生用戶體驗
- ✅ 自動支援新系統字體

### 🥈 第二名：Google Fonts + 系統備用
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Sans+TC:wght@300;400;500;600&display=swap');
```

**優勢：**
- ✅ 設計一致性
- ✅ 完整字重支援
- ❌ 需要網路載入
- ❌ 增加載入時間

### 🥉 第三名：Adobe Fonts
**優勢：**
- ✅ 專業字型品質
- ✅ 進階排版功能
- ❌ 需要訂閱服務
- ❌ 載入性能影響

## 📱 平台字體對應

| 平台 | 標題字體 | 內文字體 | 中文字體 |
|------|----------|----------|----------|
| macOS/iOS | SF Pro Display | SF Pro Text | PingFang TC/SC |
| Windows | Segoe UI Variable | Segoe UI | Microsoft JhengHei UI |
| Android | Roboto | Roboto | Noto Sans TC/SC |
| Linux | Ubuntu/Cantarell | Liberation Sans | Noto Sans TC/SC |

## 🔗 參考資源

- [SystemFontStack.com](https://systemfontstack.com/) - 現代系統字體指南
- [CSS-Tricks: Font Stacks](https://css-tricks.com/snippets/css/font-stacks/) - 字體堆疊最佳實踐
- [MDN: font-family](https://developer.mozilla.org/docs/Web/CSS/font-family) - 官方文檔
- [Web.dev: Font Display](https://web.dev/font-display/) - 字體載入優化
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - 無障礙指南

## 🎯 總結

現代 Web 字型設計的趨勢是**回歸系統字體**，因為：

1. **性能第一**：零延遲載入
2. **用戶熟悉**：提升可讀性和舒適度  
3. **維護簡單**：減少字體管理複雜度
4. **未來友好**：自動受益於作業系統字體改進

我們的字型系統完美實現了這一理念，為用戶提供最佳的閱讀體驗！
