# 依賴套件分析報告 - 詳細版本

## 前端依賴使用情況分析

### 🔍 實際使用中的套件 (Active Dependencies)

#### Medusa 核心套件
- `@medusajs/ui` - 廣泛使用於各種元件：Button, Heading, clx, Table, Text 等
- `@medusajs/icons` - 使用於圖示：ArrowRightOnRectangle, Plus, CheckCircleSolid 等  
- `@medusajs/types` - 廣泛使用於型別定義：HttpTypes
- `@medusajs/js-sdk` - API 呼叫
- `@medusajs/store` - Store 功能

#### UI 相關套件
- `@headlessui/react` - 使用於 Modal (Dialog, Transition) 和 Disclosure
- `@portabletext/react` - CMS 內容渲染 (PortableText)
- `@portabletext/types` - 型別定義
- `clsx` - CSS 類別合併 (在多個檔案中使用)
- `date-fns` - 日期格式化
- `date-fns/locale` - 繁體中文本地化

#### Next.js 與 React
- `next` - Next.js 框架
- `react` - React 核心
- `react-dom` - React DOM 操作

#### CSS 與樣式
- `tailwindcss` - 主要 CSS 框架
- `@tailwindcss/forms` - 表單樣式
- `@tailwindcss/typography` - 文字樣式

#### 開發工具
- `typescript` - TypeScript 支援
- `eslint` - 程式碼檢查
- `@types/*` - TypeScript 型別定義

### 🔄 後端服務套件 (Backend Dependencies)
- 所有 `@medusajs/*` 後端套件都是必要的
- 資料庫相關套件 (PostgreSQL)
- Redis 快取服務

### ⚠️ 可能閒置的套件 (Potentially Idle Dependencies)

#### 從 node_modules 分析可能未使用的套件：

1. **CSS 處理相關**
   - `@alloc/quick-lru` - 目前已安裝但可能不是直接使用
   - 許多 PostCSS 插件可能被 Tailwind 自動使用

2. **構建工具依賴**
   - 許多子依賴是由主要套件自動引入的
   - Webpack、Babel 相關的套件通常是 Next.js 的依賴

3. **型別定義套件**
   - 某些 `@types/*` 可能沒有對應的實際使用

### 📊 依賴分類統計

#### 核心業務套件 (不可移除)
- Medusa 相關：約 50+ 套件
- Next.js/React：約 30+ 套件  
- UI 元件庫：約 20+ 套件

#### 開發工具套件 (開發時需要)
- TypeScript 相關：約 40+ 套件
- ESLint 相關：約 30+ 套件
- 構建工具：約 50+ 套件

#### 子依賴套件 (自動安裝)
- 各主要套件的依賴：約 300+ 套件

### 🎯 優化建議

#### 立即可以檢查的套件：
1. 檢查 devDependencies 是否有未使用的套件
2. 檢查是否有重複功能的套件
3. 檢查版本過舊的套件

#### 保持的核心套件：
- 所有 @medusajs/* 套件
- Next.js 與 React 生態系統
- Tailwind CSS 與相關插件
- @headlessui/react (Modal 使用中)
- @portabletext/* (CMS 內容渲染)
- date-fns (日期處理)
- clsx (CSS 類別管理)

#### 風險評估：
- 移除任何 @medusajs/* 套件會破壞核心功能
- UI 相關套件都有實際使用，不建議移除
- 大部分套件都是必要的依賴或子依賴

### 💡 輕量化建議

1. **確保只安裝必要的 devDependencies**
2. **定期清理 node_modules 並重新安裝**
3. **使用 npm ls --depth=0 檢查直接依賴**
4. **考慮使用 npm audit 檢查安全性**
5. **定期更新套件版本以獲得更好的樹搖優化**

### 結論

當前專案的依賴結構相當精簡，大部分套件都有實際使用。建議專注於：
1. 保持套件版本更新
2. 定期檢查是否有新的輕量化替代方案
3. 優化構建配置而非移除套件
4. 使用動態導入減少初始包大小

**目前的 474 個套件中，約 90% 都是必要的核心依賴或子依賴。**
