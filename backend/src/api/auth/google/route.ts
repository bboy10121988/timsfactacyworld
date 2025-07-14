import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleRedirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/tw/auth/google/callback"
  
  if (!googleClientId) {
    return res.status(400).json({ error: "Google OAuth not configured" })
  }

  const authUrl = `https://accounts.google.com/oauth2/authorize?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(googleRedirectUri)}&` +
    `response_type=code&` +
    `scope=openid email profile&` +
    `access_type=offline`

  // 添加 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  return res.json({ authUrl })
}
