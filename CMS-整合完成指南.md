# Sanity CMS 整合完成 - 使用指南

## 🎉 整合成功！

Sanity CMS 已成功整合到 Next.js 前端專案中，並可通過 `/cms` 路徑直接訪問。

## 📁 項目結構

```
frontend/
├── src/app/cms/[[...tool]]/page.tsx    # CMS 路由入口
├── sanity.config.ts                    # 完整 Sanity 配置
├── sanity.config.simple.ts             # 簡化版配置（用於嵌入）
├── sanity.cli.ts                       # Sanity CLI 配置
├── schemas/                             # 內容架構定義
│   ├── index.ts                        # Schema 匯出
│   ├── post.ts                         # 文章 Schema
│   ├── author.ts                       # 作者 Schema
│   ├── category.ts                     # 分類 Schema
│   ├── homePage.ts                     # 首頁 Schema
│   └── blocks/                         # 頁面區塊 Schema
└── src/config/webhook/                  # Webhook 配置
```

## 🚀 訪問方式

| 服務 | URL | 說明 |
|------|-----|------|
| 前端網站 | http://localhost:8000 | Next.js 主網站 |
| CMS Studio | http://localhost:8000/cms | 嵌入式 Sanity Studio |
| 後端 API | http://localhost:9000 | Medusa.js 後端 |
| 整合測試 | http://localhost:8000/integration-test | 系統測試頁面 |

## 📝 內容管理功能

### 已配置的內容類型：
- **📄 Pages**: 一般頁面管理
- **🏠 Home Page**: 首頁內容配置
- **📝 Posts**: 部落格文章
- **👤 Authors**: 作者資訊
- **🏷️ Categories**: 文章分類
- **📋 Header/Footer**: 導航和頁尾設定
- **📑 Return Policy**: 退換貨政策

### 可用的頁面區塊：
- **🖼️ Main Banner**: 主要橫幅
- **📷 Image Text Block**: 圖文區塊
- **⭐ Featured Products**: 精選商品
- **📰 Blog Section**: 部落格區段
- **🎬 YouTube Section**: 影片區段
- **📄 Content Section**: 內容區段
- **🛠️ Service Card Section**: 服務卡片區段

## 🔧 開發指令

```bash
# 啟動整合開發環境（推薦）
npm run dev:integrated

# 或分別啟動各服務
npm run dev:frontend    # 前端 (port 8000)
npm run dev:backend     # 後端 (port 9000)
npm run dev:sanity      # 獨立 Sanity (port 3333)
```

## ⚙️ 環境配置

### 前端環境變數 (.env.local)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=m7o2mv1n
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WEBHOOK_SECRET=your-webhook-secret
```

### Sanity 項目資訊
- **Project ID**: m7o2mv1n
- **Dataset**: production
- **Studio URL**: /cms (嵌入式)

## 🔗 API 整合

### Sanity API 查詢範例
```javascript
// 獲取所有文章
const posts = await sanityClient.fetch('*[_type == "post"]')

// 獲取首頁內容
const homePage = await sanityClient.fetch('*[_type == "homePage"][0]')

// 獲取特定頁面
const page = await sanityClient.fetch('*[_type == "pages" && slug.current == $slug][0]', { slug })
```

## 🛡️ 安全性注意事項

1. **生產環境部署前**：
   - 更新所有環境變數
   - 設定 Sanity 項目的 CORS 配置
   - 配置適當的用戶權限

2. **Webhook 安全**：
   - 確保 SANITY_WEBHOOK_SECRET 的安全性
   - 驗證 webhook 簽名

## 📋 後續優化建議

### 1. 內容預覽功能
- 設定 Next.js Preview Mode
- 配置 Sanity Live Preview

### 2. 效能優化
- 實施 ISR (Incremental Static Regeneration)
- 配置圖片 CDN
- 設定適當的快取策略

### 3. SEO 優化
- 利用 seoMeta schema
- 設定動態 meta tags
- 實施 structured data

### 4. 多語言支援
- 配置 Sanity 國際化
- 實施語言切換功能

## 🐛 故障排除

### 常見問題：

1. **CMS 無法載入**
   - 檢查 Sanity 配置是否正確
   - 確認項目 ID 和 dataset 設定

2. **端口衝突**
   - 前端：8000 (可在 package.json 修改)
   - 後端：9000
   - Sanity：3333

3. **依賴問題**
   - 執行 `npm install` 重新安裝依賴
   - 檢查 Node.js 版本相容性

## 📞 支援資源

- [Sanity 官方文檔](https://www.sanity.io/docs)
- [Next.js + Sanity 整合指南](https://nextjs.org/docs/cms)
- [Medusa.js 文檔](https://docs.medusajs.com/)

---

✨ **整合完成！** 現在您可以通過 http://localhost:8000/cms 直接管理網站內容了。
