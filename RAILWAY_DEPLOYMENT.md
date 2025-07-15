# Medusa 後端 Railway 部署指南

## 準備工作

### 1. 註冊 Railway 帳號
- 前往 https://railway.app
- 使用 GitHub 帳號註冊
- 連接到你的 GitHub 儲存庫

### 2. 資料庫設置
1. 在 Railway 中創建新項目
2. 添加 PostgreSQL 服務
3. 記下資料庫連接字符串

### 3. 環境變數設置
在 Railway 項目中設置以下環境變數：

```bash
# 必要變數
DATABASE_URL=postgresql://...  (Railway 會自動提供)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
COOKIE_SECRET=your-super-secret-cookie-key-min-32-chars
NODE_ENV=production

# CORS 設置 (將會在部署後更新)
STORE_CORS=https://timsfactacyworld-xxx.vercel.app
ADMIN_CORS=https://your-medusa-backend.railway.app
AUTH_CORS=https://timsfactacyworld-xxx.vercel.app,https://your-medusa-backend.railway.app

# 可選設置
REDIS_URL=redis://...  (如果需要 Redis)
```

### 4. 部署步驟
1. 在 Railway 中選擇 "Deploy from GitHub repo"
2. 選擇 `timsfactacyworld` 儲存庫
3. 設置根目錄為 `/backend`
4. Railway 會自動檢測 Node.js 並部署

### 5. 部署後配置
1. 獲取 Railway 提供的 URL (例如: https://your-app.railway.app)
2. 更新前端的 `NEXT_PUBLIC_MEDUSA_BACKEND_URL` 環境變數
3. 運行資料庫 seed 腳本 (如果需要測試資料)

## 驗證部署
- 訪問 `https://your-app.railway.app/health` 檢查健康狀態
- 檢查管理員面板: `https://your-app.railway.app/app`

## 故障排除
- 檢查 Railway 的建置日誌
- 確保所有環境變數都已設置
- 檢查資料庫連接狀態
