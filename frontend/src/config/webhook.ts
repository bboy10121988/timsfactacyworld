/**
 * Webhook 配置
 * 
 * WEBHOOK_URL: Frontend API endpoint 的位置
 * WEBHOOK_SECRET: 用於驗證 webhook 請求的密鑰
 * 注意：確保這個 secret 與 frontend 的 .env.local 中的 SANITY_WEBHOOK_SECRET 值相同
 */

export const WEBHOOK_URL = 'http://localhost:8000/api/generate-page'
export const WEBHOOK_SECRET = 'your-webhook-secret-key' // 修改為你的實際 secret
