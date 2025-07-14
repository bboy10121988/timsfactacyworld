# CORS 配置優化 - 部署指南

## 📋 概述

本文檔提供完整的 CORS 配置優化方案，確保專案在開發和生產環境中都能正常運行，避免跨域錯誤。

## 🔧 後端配置 (Medusa)

### 1. 動態 CORS 配置

後端 `medusa-config.ts` 已優化為：
- ✅ 自動檢測開發/生產環境
- ✅ 動態構建允許的來源列表
- ✅ 支援多域名配置
- ✅ 環境變數覆蓋機制

### 2. 環境變數設置

#### 開發環境 (.env)
```bash
NODE_ENV=development
STORE_CORS=http://localhost:3000,http://127.0.0.1:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000,http://localhost:3000
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:3000,http://localhost:8000
```

#### 生產環境
```bash
NODE_ENV=production
STORE_CORS=https://your-frontend-domain.com
ADMIN_CORS=https://your-admin-domain.com,https://your-frontend-domain.com
AUTH_CORS=https://your-admin-domain.com,https://your-frontend-domain.com
NEXT_PUBLIC_BASE_URL=https://your-frontend-domain.com
MEDUSA_ADMIN_URL=https://your-admin-domain.com
```

## 🌐 前端配置 (Next.js)

### 1. API 代理設置

前端 `next.config.js` 已優化：
- ✅ 動態後端 URL 解析
- ✅ CORS headers 自動設置
- ✅ API 路由代理
- ✅ 圖片來源動態配置

### 2. 環境變數設置

#### 開發環境 (.env.local)
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MEDUSA_BACKEND_URL=http://localhost:9000
```

#### 生產環境
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_BASE_URL=https://your-frontend-domain.com
MEDUSA_BACKEND_URL=https://your-backend-domain.com
```

## 🚀 部署檢查清單

### Railway 部署 (後端)

1. **設置環境變數**：
   ```bash
   NODE_ENV=production
   STORE_CORS=https://your-frontend-domain.vercel.app
   ADMIN_CORS=https://your-admin-domain.railway.app,https://your-frontend-domain.vercel.app
   AUTH_CORS=https://your-admin-domain.railway.app,https://your-frontend-domain.vercel.app
   JWT_SECRET=your_super_secure_jwt_secret_32chars
   COOKIE_SECRET=your_super_secure_cookie_secret_32chars
   DATABASE_URL=postgresql://user:pass@host:port/database
   ```

2. **檢查部署**：
   ```bash
   curl https://your-backend-domain.railway.app/health
   ```

### Vercel 部署 (前端)

1. **設置環境變數**：
   ```bash
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-domain.railway.app
   NEXT_PUBLIC_BASE_URL=https://your-frontend-domain.vercel.app
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_actual_key
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
   ```

2. **檢查部署**：
   - 訪問前端 URL
   - 檢查 API 調用是否正常
   - 驗證圖片載入

## 🔍 問題排查

### 常見 CORS 錯誤

1. **錯誤**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
   
   **解決方案**：
   - 檢查後端 CORS 設置是否包含前端域名
   - 確認環境變數正確設置
   - 運行檢查腳本：`node scripts/check-cors.js`

2. **錯誤**: `No 'Access-Control-Allow-Origin' header is present`
   
   **解決方案**：
   - 確認後端正在運行
   - 檢查 API 端點 URL 是否正確
   - 驗證網路連接

### 檢查工具

運行 CORS 配置檢查：
```bash
cd backend
node scripts/check-cors.js
```

### 測試 CORS 設置

```bash
# 測試後端 API
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-domain.com/store/products

# 應該返回適當的 CORS headers
```

## 📚 最佳實踐

### 安全考量

1. **生產環境 CORS**：
   - ❌ 避免使用 `*` 萬用字符
   - ✅ 明確指定允許的域名
   - ✅ 使用 HTTPS

2. **環境分離**：
   - ✅ 開發/生產環境使用不同配置
   - ✅ 敏感資訊使用環境變數
   - ✅ 定期更新安全密鑰

3. **監控和日誌**：
   - ✅ 監控 CORS 相關錯誤
   - ✅ 記錄跨域請求
   - ✅ 設置告警機制

### 效能優化

1. **快取策略**：
   - 設置適當的 `Access-Control-Max-Age`
   - 優化預檢請求處理

2. **CDN 配置**：
   - 確保 CDN 轉發 CORS headers
   - 配置適當的快取規則

## 🔗 相關資源

- [MDN CORS 文檔](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Medusa CORS 配置](https://docs.medusajs.com/development/backend/configurations#cors)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

💡 **提示**: 部署前請務必運行檢查腳本並測試所有 API 端點的 CORS 設置。
