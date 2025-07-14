# 🚨 需要立即在 Vercel 設定的環境變數清單

## 前端 (Frontend) - 必須設定：
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_878a01cbc11b1ed2acfb97a538e26610e073ced57ed8ad18f72677e836190adb
NEXT_PUBLIC_BASE_URL=https://timsfactacyworld.vercel.app
NEXT_PUBLIC_DEFAULT_REGION=tw
REVALIDATE_SECRET=supersecret123456789
SANITY_WEBHOOK_SECRET=sanity-webhook-secret-key

## 後端 (Backend) - 必須設定：
DATABASE_URL=你的_PostgreSQL_連接字串
JWT_SECRET=請生成32字符長的隨機字串
COOKIE_SECRET=請生成32字符長的隨機字串
STORE_CORS=https://timsfactacyworld.vercel.app
ADMIN_CORS=https://timsfactacyworld-oo5lfxhmf-bboy10121988s-projects.vercel.app
AUTH_CORS=https://timsfactacyworld.vercel.app
NEXT_PUBLIC_BASE_URL=https://timsfactacyworld.vercel.app
MEDUSA_ADMIN_URL=https://timsfactacyworld-oo5lfxhmf-bboy10121988s-projects.vercel.app
STORE_URL=https://timsfactacyworld.vercel.app
GOOGLE_CALLBACK_URL=https://timsfactacyworld.vercel.app/tw/auth/google/callback

## 可選但建議設定：
REDIS_URL=你的_Redis_連接字串_或_Vercel_KV_URL
ECPAY_BASE_URL=https://payment-stage.ecpay.com.tw

## 如何生成 JWT_SECRET 和 COOKIE_SECRET：
# 在終端執行：
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

## Vercel 設定步驟：
1. 進入 Vercel Dashboard
2. 選擇你的項目
3. 點擊 Settings → Environment Variables
4. 逐一添加上述變數
5. 重新部署項目

## 🔍 Server Components 錯誤可能原因：
- DATABASE_URL 未設定導致後端無法連接資料庫
- JWT_SECRET/COOKIE_SECRET 未設定導致認證失敗
- CORS 設定不正確導致跨域請求失敗
