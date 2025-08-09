# 聯盟行銷系統 - 後端 API 文件

## 概述

這是一個完整的聯盟行銷系統，包含前端註冊登入功能和後端管理審核系統。系統允許聯盟夥伴註冊、管理員審核、點擊追蹤、轉換記錄和佣金管理。

## 🏗️ 系統架構

### 資料庫模型
- **AffiliatePartner**: 聯盟夥伴資料
- **AffiliateClick**: 點擊追蹤記錄
- **AffiliateConversion**: 轉換和佣金記錄

### 服務層
- **AffiliateService**: 聯盟行銷業務邏輯處理

### API 路由
- **前端 API** (`/store/affiliate/*`): 供前端網站使用
- **管理 API** (`/admin/affiliate/*`): 供 Medusa 後台使用

### 管理介面
- **聯盟儀表板**: 統計資料總覽
- **夥伴管理**: 審核註冊申請
- **佣金管理**: 管理佣金支付

## 📡 API 端點

### 前端 API (Store)

#### 夥伴註冊
```http
POST /store/affiliate/partners
```
```json
{
  "name": "夥伴姓名",
  "email": "partner@example.com",
  "phone": "0912345678",
  "website": "https://partner-website.com",
  "password": "password123"
}
```

#### 夥伴登入
```http
POST /store/affiliate/login
```
```json
{
  "email": "partner@example.com",
  "password": "password123"
}
```

#### 檢查 Email 是否存在
```http
GET /store/affiliate/partners?email=partner@example.com
```

#### 取得夥伴統計資料
```http
GET /store/affiliate/partners/{id}/stats
Authorization: Bearer {token}
```

#### 記錄點擊追蹤
```http
POST /store/affiliate/track
```
```json
{
  "partnerId": "partner_123",
  "productId": "product_456",
  "url": "https://website.com/product/456",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com"
}
```

#### 記錄轉換
```http
POST /store/affiliate/conversion
```
```json
{
  "partnerId": "partner_123",
  "orderId": "order_789",
  "productId": "product_456",
  "orderValue": 1000,
  "commissionRate": 0.05
}
```

### 管理 API (Admin)

#### 取得夥伴列表
```http
GET /admin/affiliate/partners?status=pending&page=1&limit=20
```

#### 審核夥伴
```http
POST /admin/affiliate/partners/{id}/approve
```
```json
{
  "status": "approved",
  "reason": "審核通過原因"
}
```

#### 取得佣金列表
```http
GET /admin/affiliate/commissions?status=pending
```

#### 更新佣金狀態
```http
POST /admin/affiliate/commissions/{id}/status
```
```json
{
  "status": "paid",
  "reason": "已支付備註"
}
```

#### 取得統計資料
```http
GET /admin/affiliate/stats
```

## 🖥️ Medusa 後台管理介面

### 1. 聯盟儀表板
- **路徑**: `/admin/affiliate/dashboard`
- **功能**: 顯示總體統計資料
- **包含**: 夥伴數量、點擊數、轉換率、佣金統計

### 2. 夥伴管理
- **路徑**: `/admin/affiliate`  
- **功能**: 管理聯盟夥伴申請
- **操作**: 
  - 查看待審核的註冊申請
  - 核准或拒絕夥伴申請
  - 查看夥伴詳細資料

### 3. 佣金管理
- **路徑**: `/admin/affiliate/commissions`
- **功能**: 管理佣金支付
- **操作**:
  - 查看待核准的佣金
  - 核准佣金發放
  - 標記佣金為已支付
  - 拒絕無效佣金

## 🔧 安裝和設定

### 1. 資料庫設定
系統會自動創建以下資料表：
- `affiliate_partner`
- `affiliate_click`  
- `affiliate_conversion`

### 2. 環境變數
```bash
# JWT 密鑰 (用於夥伴登入驗證)
AFFILIATE_JWT_SECRET=your-jwt-secret-here

# 佣金設定
DEFAULT_COMMISSION_RATE=0.05
```

### 3. 啟動服務
```bash
cd backend
npm run build
npm run start
```

### 4. 測試 API
```bash
node test-affiliate-api.js
```

## 🚀 開發狀態

### ✅ 已完成
- 資料庫模型定義
- API 路由結構
- Medusa 後台管理介面
- 基本的模擬響應

### 🔄 進行中
- 資料庫實際操作實作
- JWT 身份驗證
- 實際的服務層邏輯

### 📋 待辦事項
- ECPay 金流整合
- Email 通知系統
- 詳細的數據分析報表
- 自動化測試
- API 文檔生成

## 🔐 安全考量

1. **身份驗證**: JWT token 驗證夥伴身份
2. **權限控制**: 管理員權限驗證
3. **資料驗證**: 輸入參數驗證和清理
4. **防重複**: 防止重複點擊和轉換記錄

## 📈 擴展功能

1. **多層級佣金**: 支援多層次聯盟行銷
2. **自定義佣金率**: 不同產品不同佣金率
3. **推廣素材管理**: 提供推廣橫幅和連結
4. **即時通知**: 轉換即時通知夥伴
5. **分析報表**: 詳細的性能分析

## 🎯 使用流程

### 夥伴註冊流程
1. 夥伴在前端填寫註冊表單
2. 系統創建待審核的夥伴記錄
3. 管理員在後台審核申請
4. 審核通過後夥伴可以登入使用

### 佣金計算流程
1. 用戶透過夥伴連結訪問網站（記錄點擊）
2. 用戶完成購買（記錄轉換）
3. 系統自動計算佣金
4. 管理員審核並核准佣金
5. 定期支付佣金給夥伴

---

**注意**: 這是一個基礎框架，實際部署前需要完成服務層的實作和安全性加強。
