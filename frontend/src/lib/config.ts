import Medusa from "@medusajs/js-sdk"

// 確保在服務器端和客戶端都能獲取正確的 URL
export const MEDUSA_BACKEND_URL = 
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
  process.env.MEDUSA_BACKEND_URL || 
  "http://localhost:9000"

// 創建 SDK 實例，確保使用正確的 URL
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// 確保在用於 API 路由和伺服器組件時可以直接使用
export const getApiConfig = () => {
  return {
    baseUrl: MEDUSA_BACKEND_URL,
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  }
}
