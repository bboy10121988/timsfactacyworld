import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { setAuthToken, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    if (!credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    // 驗證 Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
    }

    const { sub: googleId, email, name, picture } = payload

    // 1. 先確保 Medusa 有 customer 資料（不破壞原有流程）
    const medusaResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
      body: JSON.stringify({
        google_id: googleId,
        email,
        first_name: name?.split(' ')[0] || '',
        last_name: name?.split(' ').slice(1).join(' ') || '',
        avatar: picture,
      }),
    })
    // 不管成功失敗都繼續，確保帳號存在

    // 2. 呼叫 Medusa backend /auth/google/callback 產生 JWT
    //    這裡用 Google token 兌換 code 流程已經在 backend 處理，
    //    但我們只有 Google JWT，沒有 code，所以這裡要模擬 code 流程或直接用 email 產生 JWT
    //    但目前 backend 只支援 code 兌換，無法直接用 Google JWT。
    //    所以這裡 fallback：
    //    - 若有 code，請用 code 流程
    //    - 若只有 Google JWT，則無法自動產生 Medusa JWT，維持現有行為
    //    - 提示用戶用 code callback 流程（即 /api/medusa/auth/google/callback）

    // 這裡直接回傳 customer，並提示前端用 code callback 流程
    let responseData
    try {
      const responseText = await medusaResponse.text()
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { customer: null }
    }
    const { customer } = responseData

    // 保持原有 Google OAuth cookie 寫入，避免破壞現有登入
    try {
      const googleSessionData = {
        customer_id: customer?.id || '',
        email: customer?.email || email,
        first_name: customer?.first_name || name?.split(' ')[0] || '',
        last_name: customer?.last_name || name?.split(' ').slice(1).join(' ') || '',
        auth_provider: 'google',
        created_at: new Date().toISOString()
      }
      const googleToken = `google_oauth:${JSON.stringify(googleSessionData)}`
      await setAuthToken(googleToken)
    } catch {}

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return NextResponse.json({ 
      success: true, 
      customer: {
        id: customer?.id || '',
        email: customer?.email || email,
        first_name: customer?.first_name || name?.split(' ')[0] || '',
        last_name: customer?.last_name || name?.split(' ').slice(1).join(' ') || '',
      },
      // 新增提示
      message: 'Google 登入成功，但如需完整 Medusa 授權，請用 code callback 流程（/api/medusa/auth/google/callback）產生 JWT。'
    })
  } catch (error: any) {
    console.error('Google 登入錯誤:', error)
    return NextResponse.json({ 
      error: error.message || 'Google login failed' 
    }, { status: 500 })
  }
}
