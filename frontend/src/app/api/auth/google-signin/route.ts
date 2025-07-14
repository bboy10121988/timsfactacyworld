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

    // 將 Google JWT token 發送到 Medusa 後端
    console.log('發送到 Medusa 後端的資料:', {
      google_id: googleId,
      email,
      first_name: name?.split(' ')[0] || '',
      last_name: name?.split(' ').slice(1).join(' ') || '',
      avatar: picture,
    })

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

    console.log('Medusa 回應狀態:', medusaResponse.status)
    console.log('Medusa 回應 headers:', Object.fromEntries(medusaResponse.headers.entries()))
    
    const responseText = await medusaResponse.text()
    console.log('Medusa 原始回應內容:', responseText)

    if (!medusaResponse.ok) {
      console.error('Medusa 創建/登入用戶錯誤 - 狀態:', medusaResponse.status)
      console.error('Medusa 創建/登入用戶錯誤 - 內容:', responseText)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = responseText
      }
      return NextResponse.json({ 
        error: 'Failed to create/login user',
        details: errorData,
        status: medusaResponse.status
      }, { status: 500 })
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('Medusa 成功回應 (解析後):', responseData)
    } catch (parseError) {
      console.error('無法解析 Medusa 回應 JSON:', parseError)
      console.error('原始回應內容:', responseText)
      return NextResponse.json({ 
        error: 'Invalid response from backend',
        details: responseText 
      }, { status: 500 })
    }

    const { customer } = responseData

    // 對於 Google OAuth 用戶，我們採用一個特殊的方法
    // 我們將客戶資訊保存在一個特殊的 cookie 中
    console.log('為 Google OAuth 用戶設置特殊會話')
    
    try {
      // 設置一個特殊的 Google OAuth 會話標識
      const googleSessionData = {
        customer_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        auth_provider: 'google',
        created_at: new Date().toISOString()
      }
      
      // 使用一個特殊的 token 格式來識別 Google OAuth 用戶
      const googleToken = `google_oauth:${JSON.stringify(googleSessionData)}`
      
      await setAuthToken(googleToken)
      console.log('已設置 Google OAuth 會話 token')
    } catch (authError: any) {
      console.error('設置認證 token 失敗:', authError)
      return NextResponse.json({ 
        error: 'Failed to set authentication',
        details: authError?.message || 'Unknown auth error'
      }, { status: 500 })
    }

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return NextResponse.json({ 
      success: true, 
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      }
    })
  } catch (error: any) {
    console.error('Google 登入錯誤:', error)
    return NextResponse.json({ 
      error: error.message || 'Google login failed' 
    }, { status: 500 })
  }
}
