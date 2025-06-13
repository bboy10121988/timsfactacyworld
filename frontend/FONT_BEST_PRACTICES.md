# 🎯 中英文字型系統最佳實踐指南

## 📋 2025年最推薦的字型組合

### 🌟 設計原則

1. **性能優先**: 系統字體 > 本地字體 > 網路字體
2. **中文優先**: 內文以中文易讀性為主
3. **英文品質**: 標題以英文設計感為主
4. **向下相容**: 完整的 fallback 字體鏈
5. **現代化**: 支援最新的系統字體

### 💻 系統字體選擇邏輯

#### 內文字體 (--font-base)
```css
--font-base: 
  /* 🇹🇼 中文優質字體 */
  'Noto Sans TC',              /* Google 高品質中文字體 */
  'Microsoft JhengHei UI',     /* Windows 11 新版中文字體 */
  'Microsoft JhengHei',        /* Windows 經典中文字體 */
  
  /* 🖥️ 現代系統字體 */
  -apple-system,               /* macOS/iOS 系統字體別名 */
  BlinkMacSystemFont,          /* Chrome macOS 系統字體 */
  'Segoe UI',                  /* Windows 系統字體 */
  'Segoe UI Variable',         /* Windows 11 可變字體 */
  
  /* 🌐 經典Web字體 */
  'Helvetica Neue', Helvetica, Arial,
  
  /* 🔧 開源備用字體 */
  'Roboto',                    /* Android 系統字體 */
  'Ubuntu', 'Cantarell',       /* Linux 字體 */
  'Fira Sans',                 /* Mozilla 字體 */
  
  /* 🔄 系統通用 */
  system-ui, ui-sans-serif, sans-serif,
  
  /* 😀 表情符號支援 */
  'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji';
```

#### 標題字體 (--font-heading)
```css
--font-heading: 
  /* 🇺🇸 英文優質字體 */
  'SF Pro Display',            /* Apple 專業字體 */
  -apple-system,               /* macOS 系統字體 */
  BlinkMacSystemFont,          /* Chrome 系統字體 */
  'Segoe UI Variable',         /* Windows 11 可變字體 */
  'Segoe UI',                  /* Windows 系統字體 */
  
  /* 🇹🇼 中文配合字體 */
  'Noto Sans TC',              /* 中文標準字體 */
  'Microsoft JhengHei UI',     /* Windows 中文字體 */
  'Microsoft JhengHei',        /* Windows 經典中文 */
  
  /* ✨ 經典標題字體 */
  'Helvetica Neue', Helvetica,
  'Avenir Next', Avenir,       /* Apple 設計字體 */
  
  /* 🆕 現代Web字體 */
  'Inter',                     /* 現代幾何字體 */
  'Roboto',                    /* Google 字體 */
  'Ubuntu',                    /* Canonical 字體 */
  
  /* 🔄 系統通用 */
  system-ui, ui-sans-serif, sans-serif,
  
  /* 😀 表情符號支援 */
  'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji';
```

### 🎯 字體選擇理由

#### 為什麼這個組合最好？

1. **Noto Sans TC**: Google 開發的高品質中文字體
   - ✅ 完整的繁體中文支援
   - ✅ 在各平台渲染一致
   - ✅ 免費且開源

2. **-apple-system & SF Pro Display**: Apple 系統字體
   - ✅ macOS/iOS 上的最佳體驗
   - ✅ 現代化設計
   - ✅ 支援可變字重

3. **Segoe UI Variable**: Windows 11 字體
   - ✅ Windows 上的最佳體驗
   - ✅ 支援可變字體技術
   - ✅ 更好的渲染效果

4. **Inter**: 現代幾何字體
   - ✅ 專為數位螢幕設計
   - ✅ 優秀的易讀性
   - ✅ 完整的字重系列

### 📱 平台適配表

| 平台 | 內文字體 | 標題字體 | 備註 |
|------|----------|----------|------|
| macOS | SF Pro Text | SF Pro Display | 系統原生字體 |
| Windows 11 | Segoe UI Variable | Segoe UI Variable | 新版可變字體 |
| Windows 10 | Segoe UI | Segoe UI | 經典系統字體 |
| Android | Roboto | Roboto | Google 字體 |
| Linux | Ubuntu/Cantarell | Ubuntu/Cantarell | 發行版字體 |
| 中文系統 | Noto Sans TC | Noto Sans TC | 統一中文體驗 |

### ⚡ 性能優勢

1. **零網路請求**: 100% 系統字體，無需下載
2. **即時渲染**: 無字體載入延遲
3. **原生體驗**: 與作業系統一致的用戶體驗
4. **記憶體效率**: 系統已載入，無額外記憶體消耗

### 🔧 實施建議

#### 1. 漸進式升級
```css
/* 舊專案相容 */
.legacy-text {
  font-family: Arial, sans-serif;
}

/* 新專案使用 */
.modern-text {
  font-family: var(--font-base);
}
```

#### 2. 字重優化
```css
/* 針對不同用途使用不同字重 */
.heading { font-weight: 600; }    /* Semi-bold 標題 */
.body { font-weight: 400; }       /* Regular 內文 */
.caption { font-weight: 300; }    /* Light 說明文字 */
```

#### 3. 響應式字體大小
```css
/* 使用相對單位 */
.responsive-text {
  font-size: clamp(1rem, 2.5vw, 1.125rem);
}
```

### 🚀 進階技巧

#### 1. 字體特性優化
```css
html {
  /* 字體渲染優化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  
  /* 字體特性 */
  font-feature-settings: 
    "kern" 1,          /* 字距調整 */
    "liga" 1,          /* 連字 */
    "calt" 1;          /* 上下文替代 */
}
```

#### 2. 中英文混排優化
```css
.mixed-text {
  /* 中英文間距優化 */
  font-variant-east-asian: proportional-width;
  text-spacing: ideograph-alpha ideograph-numeric;
}
```

### 📊 瀏覽器支援

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| system-ui | ✅ | ✅ | ✅ | ✅ |
| -apple-system | ✅ | ✅ | ✅ | ✅ |
| font-feature-settings | ✅ | ✅ | ✅ | ✅ |
| Variable Fonts | ✅ | ✅ | ✅ | ✅ |

### ❓ 常見問題

**Q: 為什麼不使用 Web Fonts？**
A: 系統字體載入更快，記憶體使用更少，且現代系統字體品質已經很高。

**Q: 如何處理舊瀏覽器？**
A: 字體堆疊會自動向下相容到 Arial/Helvetica。

**Q: 中文顯示會有問題嗎？**
A: Noto Sans TC 在所有平台都有良好支援，是最穩定的選擇。

### 🔗 參考資源

- [System Font Stack](https://systemfontstack.com/)
- [Modern Font Stacks](https://modernfontstacks.com/)
- [Web.dev Font Best Practices](https://web.dev/font-best-practices/)
- [CSS Tricks Font Stacks](https://css-tricks.com/snippets/css/font-stacks/)
