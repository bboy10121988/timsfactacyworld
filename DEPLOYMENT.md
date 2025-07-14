# 部署指南

## 前後端分離部署架構

- **前端 (Next.js)**: GitHub Pages (靜態網站)
- **後端 (Medusa)**: Vercel (Serverless Functions)

## 🚀 部署步驟

### 1. 後端部署到 Vercel

1. 訪問 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "New Project"
3. 選擇你的 GitHub 倉庫 `bboy10121988/timsfactacyworld`
4. 配置設置：
   - **Framework Preset**: Other
   - **Root Directory**: `./` (根目錄)
   - **Build Command**: `cd backend && yarn build`
   - **Output Directory**: `backend/dist`
   - **Install Command**: `cd backend && yarn install`

5. 在 Environment Variables 中添加：
   ```
   DATABASE_URL=your-postgres-database-url
   JWT_SECRET=your-jwt-secret-key
   COOKIE_SECRET=your-cookie-secret-key
   MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
   STORE_CORS=https://bboy10121988.github.io/timsfactacyworld
   ADMIN_CORS=https://your-project.vercel.app
   NODE_ENV=production
   ```

6. 部署完成後，記下 Vercel 給你的 URL (例如: `https://your-project.vercel.app`)

### 2. 前端部署到 GitHub Pages

1. 在 GitHub 倉庫中，進入 Settings > Pages
2. 選擇 Source: "GitHub Actions"
3. 確認 `frontend/.env.production` 文件包含正確的後端 URL：
   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-project.vercel.app
   NEXT_PUBLIC_BASE_URL=https://bboy10121988.github.io/timsfactacyworld
   ```
4. 推送代碼到 main 分支，GitHub Actions 會自動部署前端到 GitHub Pages

## 🔧 本地開發

```bash
# 安裝依賴
yarn install

# 同時啟動前後端
yarn dev

# 單獨啟動後端
yarn dev:backend

# 單獨啟動前端  
yarn dev:frontend
```

## 📝 注意事項

### Vercel 限制
- 10秒函數執行時間限制
- 無本地文件系統，建議使用 S3 存儲
- 無法運行長期後台進程

### GitHub Pages 限制
- 僅支持靜態站點
- 需要配置 `output: 'export'` 在 next.config.js

### 資料庫建議
- 使用 [Supabase](https://supabase.com/) (免費 PostgreSQL)
- 或 [Neon](https://neon.tech/) (免費 PostgreSQL)
- 或 [Railway](https://railway.app/) (PostgreSQL + Redis)

### 文件存儲建議
- AWS S3
- Cloudinary
- 或 Vercel Blob

## 🔄 CI/CD 工作流

1. 推送到 main 分支
2. GitHub Actions 自動構建前端並部署到 GitHub Pages
3. Vercel 自動檢測後端變更並重新部署

## 🐛 故障排除

### 後端部署失敗
- 檢查環境變數是否正確設置
- 查看 Vercel 函數日誌
- 確保資料庫連接正常

### 前端部署失敗
- 檢查 GitHub Actions 日誌
- 確保 next.config.js 配置正確
- 驗證環境變數設置
