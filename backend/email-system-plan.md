# 聯盟行銷系統 - 郵件通知系統實作計劃

## 📧 郵件系統架構

### 建議使用的郵件服務
1. **Nodemailer + Gmail SMTP** (推薦，免費)
2. **SendGrid** (商業級，有免費額度)
3. **AWS SES** (AWS 環境)
4. **Mailgun** (開發友善)

### 需要的郵件模板

#### 🔔 夥伴相關通知
1. **註冊確認郵件**
   - 歡迎訊息
   - 審核狀態說明
   - 聯絡資訊

2. **審核結果通知**
   - 核准通知 (含登入資訊)
   - 拒絕通知 (含拒絕原因)

3. **佣金通知**
   - 新佣金產生
   - 佣金核准
   - 佣金支付確認

#### 👨‍💼 管理員通知
1. **新夥伴申請**
   - 夥伴基本資訊
   - 待審核提醒

2. **系統報告**
   - 每日/每週/每月統計
   - 異常活動警告

### 實作步驟

#### 第一階段：基礎設定
```bash
# 安裝依賴
yarn add nodemailer @types/nodemailer
yarn add handlebars  # 郵件模板引擎
```

#### 第二階段：郵件服務
```typescript
// src/services/email.ts
export class EmailService {
  async sendPartnerWelcome(partner: Partner): Promise<void>
  async sendPartnerApproval(partner: Partner): Promise<void>
  async sendPartnerRejection(partner: Partner, reason: string): Promise<void>
  async sendCommissionNotification(conversion: Conversion): Promise<void>
  async sendAdminNewPartner(partner: Partner): Promise<void>
}
```

#### 第三階段：郵件模板
```html
<!-- templates/partner-welcome.hbs -->
<h1>歡迎加入 {{siteName}} 聯盟行銷計劃！</h1>
<p>親愛的 {{partnerName}}，</p>
<p>感謝您申請加入我們的聯盟行銷計劃...</p>
```

#### 第四階段：整合
- 在 AffiliateService 中呼叫 EmailService
- 設定環境變數
- 測試郵件發送

### 配置範例

#### Gmail SMTP 設定
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Your Site Name
```

#### 郵件模板變數
```typescript
interface PartnerEmailData {
  partnerName: string;
  partnerEmail: string;
  siteName: string;
  loginUrl: string;
  supportEmail: string;
  uniqueCode?: string;
  commissionRate?: number;
}
```

### 測試計劃
1. **單元測試** - 郵件服務方法
2. **整合測試** - 完整流程測試
3. **手動測試** - 實際郵件收發

### 安全考量
1. **防垃圾郵件** - 設定發送頻率限制
2. **模板安全** - 防止 XSS 注入
3. **隱私保護** - 敏感資訊加密
4. **退訂機制** - 提供取消訂閱連結
