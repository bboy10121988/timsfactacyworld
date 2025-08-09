# 聯盟行銷系統 - 生產環境部署指南

## 🚀 部署前檢查清單

### 資料庫遷移
- [ ] 將記憶體儲存改為 PostgreSQL
- [ ] 設計資料庫 Schema
- [ ] 建立索引優化查詢
- [ ] 設定資料備份策略

### 安全性強化
- [ ] JWT Secret 環境變數化
- [ ] API Rate Limiting
- [ ] Input Validation 強化
- [ ] SQL Injection 防護
- [ ] CORS 設定

### 性能優化
- [ ] 資料庫連接池
- [ ] Redis 緩存層
- [ ] CDN 靜態資源
- [ ] 圖片壓縮優化

### 監控與日誌
- [ ] 系統監控 (CPU, Memory, Disk)
- [ ] 應用監控 (Response Time, Error Rate)
- [ ] 日誌收集與分析
- [ ] 錯誤追蹤 (Sentry)

## 📋 資料庫 Schema 設計

### Partners 表
```sql
CREATE TABLE affiliate_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(500),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    review_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Clicks 表
```sql
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES affiliate_partners(id),
    product_id VARCHAR(255),
    url TEXT,
    user_agent TEXT,
    referrer TEXT,
    ip_address INET,
    click_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_partner_time (partner_id, click_time),
    INDEX idx_product (product_id)
);
```

### Conversions 表
```sql
CREATE TABLE affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES affiliate_partners(id),
    order_id VARCHAR(255) UNIQUE NOT NULL,
    product_id VARCHAR(255),
    order_value DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    conversion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_reason TEXT,
    INDEX idx_partner_status (partner_id, status),
    INDEX idx_order (order_id)
);
```

## 🔧 環境變數配置

### 生產環境 .env
```env
# 資料庫
DATABASE_URL=postgresql://user:pass@localhost:5432/affiliate_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# 郵件服務
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yoursite.com

# Redis (可選)
REDIS_URL=redis://localhost:6379

# 監控
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# API 限制
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000  # 15分鐘
```

## 🚦 CI/CD 流程

### GitHub Actions 範例
```yaml
name: Deploy Affiliate System

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: yarn install
    - name: Run tests
      run: yarn test
    - name: Build
      run: yarn build
    - name: Deploy to server
      run: |
        # 部署腳本
```

## 📊 監控儀表板指標

### 業務指標
- 新增夥伴數量
- 點擊轉換率
- 佣金支付狀況
- 收入增長趨勢

### 技術指標
- API 回應時間
- 錯誤率
- 資料庫查詢性能
- 系統資源使用率
