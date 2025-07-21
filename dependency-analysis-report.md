# Medusa 專案依賴分析報告

## 總體概況
- **node_modules 大小**: 1.4GB
- **總依賴數量**: 1,247 個目錄
- **專案結構**: Yarn Workspace (根目錄 + backend + frontend)

## 最大的依賴 (前10名)
1. **@medusajs** - 162MB (Medusa 核心框架，必要)
2. **next** - 149MB (Next.js 框架，必要)
3. **@next** - 127MB (Next.js 相關工具，必要)
4. **@sanity** - 91MB (CMS 系統，必要)
5. **sanity** - 45MB (CMS 系統，必要)
6. **lucide-react** - 41MB (圖標庫，可能過大)
7. **@swc** - 38MB (編譯工具，必要)
8. **date-fns** - 24MB (日期處理，必要)
9. **@react-aria** - 24MB (無障礙組件，部分使用)
10. **hls.js** - 23MB (視頻流播放，可能不需要)

## 根目錄依賴分析

### 已使用的依賴
- **ecpay_aio_nodejs**: ✅ 正在使用 (ECPay 金流整合)
- **concurrently**: ✅ 正在使用 (並行運行腳本)

### 閒置的依賴
- **@cspell/cspell-bundled-dicts**: ❌ 未使用 (拼寫檢查字典)

## Backend 依賴分析

### 已使用的必要依賴
- **@medusajs/framework**: ✅ Medusa 核心框架
- **@medusajs/cli**: ✅ Medusa CLI 工具
- **@mikro-orm/core**: ✅ 數據庫 ORM
- **@mikro-orm/postgresql**: ✅ PostgreSQL 驅動
- **awilix**: ✅ 依賴注入容器
- **pg**: ✅ PostgreSQL 客戶端
- **ecpay_aio_nodejs**: ✅ ECPay 金流整合

### 閒置但必要的依賴 (框架需要)
- **@medusajs/admin-sdk**: ⚠️ Medusa 管理後台 SDK
- **@medusajs/auth**: ⚠️ 認證模組
- **@medusajs/auth-google**: ⚠️ Google 登入
- **@medusajs/inventory**: ⚠️ 庫存管理

### 開發依賴中的閒置項目
- **@swc/jest**: ❌ Jest 測試工具 (未使用)
- **@types/jest**: ❌ Jest 類型定義 (未使用)
- **@types/react**: ❌ React 類型 (backend 不需要)
- **@types/react-dom**: ❌ React DOM 類型 (backend 不需要)
- **prop-types**: ❌ React 屬性驗證 (backend 不需要)
- **react**: ❌ React 庫 (backend 不需要)
- **react-dom**: ❌ React DOM (backend 不需要)
- **ts-node**: ❌ TypeScript 運行時 (可能不需要)
- **typescript**: ❌ TypeScript 編譯器 (可能不需要)

### 缺少但正在使用的依賴
- **axios**: ❌ HTTP 客戶端 (多個腳本使用)
- **@medusajs/types**: ❌ 類型定義 (多個腳本使用)
- **node-fetch**: ❌ HTTP 請求 (部分 API 使用)
- **dotenv**: ❌ 環境變數載入 (腳本使用)

## Frontend 依賴分析

### 已使用的核心依賴
- **next**: ✅ Next.js 框架
- **react**: ✅ React 庫
- **react-dom**: ✅ React DOM
- **@medusajs/js-sdk**: ✅ Medusa JavaScript SDK
- **@headlessui/react**: ✅ 無頭 UI 組件
- **tailwindcss**: ✅ CSS 框架
- **@sanity/client**: ✅ Sanity CMS 客戶端

### 閒置但可能需要的依賴
- **framer-motion**: ❌ 動畫庫 (未使用)
- **next-sitemap**: ❌ 網站地圖生成 (未使用)
- **qs**: ❌ 查詢字串解析 (未使用)
- **react-is**: ❌ React 工具 (未使用)
- **react-youtube**: ❌ YouTube 組件 (未使用)
- **swiper**: ❌ 輪播組件 (未使用)

### 開發依賴中的閒置項目
- **@babel/core**: ❌ Babel 核心 (Next.js 內建)
- **@babel/preset-react**: ❌ Babel React 預設 (Next.js 內建)
- **@types/pg**: ❌ PostgreSQL 類型 (frontend 不需要)
- **@types/react-instantsearch-dom**: ❌ 搜尋組件類型 (未使用)
- **autoprefixer**: ❌ CSS 自動前綴 (Tailwind 內建)
- **babel-loader**: ❌ Babel 載入器 (Next.js 內建)
- **es-abstract**: ❌ ECMAScript 抽象 (未直接使用)
- **eslint-plugin-react**: ❌ React ESLint 插件 (未配置)
- **postcss**: ❌ CSS 後處理器 (可能需要)
- **prettier**: ❌ 程式碼格式化 (未配置)
- **ts-node**: ❌ TypeScript 運行時 (可能不需要)

## 大型但可能不必要的依賴

### 可以優化的依賴
1. **lucide-react** (41MB): 圖標庫，可以考慮按需載入或更換更小的替代品
2. **hls.js** (23MB): 視頻流播放器，如果不需要視頻功能可以移除
3. **@mux** (22MB): Mux 視頻服務，如果不使用視頻功能可以移除
4. **@heroicons/react** (21MB): 圖標庫，可能與 lucide-react 重複

### 可能冗余的大型依賴
- **@react-aria** (24MB): 無障礙組件庫，只有部分使用
- **rxjs** (11MB): 響應式編程庫，可能被其他依賴引入但未直接使用

## 建議的清理行動

### 立即可以移除的依賴
```json
{
  "根目錄": ["@cspell/cspell-bundled-dicts"],
  "backend devDependencies": [
    "@types/react",
    "@types/react-dom", 
    "prop-types",
    "react",
    "react-dom"
  ],
  "frontend dependencies": [
    "framer-motion",
    "next-sitemap", 
    "qs",
    "react-is",
    "react-youtube",
    "swiper"
  ],
  "frontend devDependencies": [
    "@babel/core",
    "@babel/preset-react",
    "@types/pg",
    "@types/react-instantsearch-dom",
    "babel-loader",
    "es-abstract",
    "eslint-plugin-react"
  ]
}
```

### 需要安裝的缺失依賴
```json
{
  "backend": [
    "axios",
    "@medusajs/types",
    "node-fetch", 
    "dotenv"
  ]
}
```

### 需要進一步調查的依賴
- **@swc/jest**, **jest**: 如果不需要測試可以移除
- **vite**: 是否被 Medusa 框架需要
- **yalc**: 本地包管理工具，開發時可能需要

## 預估節省空間
移除建議的無用依賴後，預估可以節省約 **200-300MB** 的空間，將 node_modules 從 1.4GB 減少到約 1.1-1.2GB。

## 風險評估
- **低風險**: 移除明確未使用的開發依賴
- **中風險**: 移除看似未使用的生產依賴 (需要測試)
- **高風險**: 移除框架相關依賴 (可能破壞功能)

## 下一步建議
1. 先移除低風險的依賴並測試
2. 安裝缺失的依賴
3. 運行完整的測試套件
4. 考慮使用更輕量的替代品
5. 實施依賴審計的定期流程
