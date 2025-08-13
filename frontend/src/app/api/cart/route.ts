import { NextRequest, NextResponse } from 'next/server'
import { getRegion } from '@lib/data/regions'

// 輔助函數：創建新購物車
async function createNewCart(baseUrl: string, publishableKey: string | undefined, countryCode: string): Promise<string> {
  console.log('🔄 Creating new cart...')
  
  // 動態獲取區域 ID
  const region = await getRegion(countryCode)
  if (!region) {
    throw new Error(`No region found for country code: ${countryCode}`)
  }
  
  console.log('📍 Using region:', region.id, 'for country:', countryCode)
  
  const cartResponse = await fetch(`${baseUrl}/store/carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': publishableKey || ''
    },
    body: JSON.stringify({
      region_id: region.id  // 使用動態區域 ID
    })
  })

  if (!cartResponse.ok) {
    const errorText = await cartResponse.text()
    console.error('❌ Failed to create cart:', errorText)
    throw new Error(`Failed to create cart: ${cartResponse.status}`)
  }

  const cartData = await cartResponse.json()
  const cartId = cartData.cart.id
  console.log('✅ Cart created:', cartId)
  return cartId
}

export async function GET() {
  try {
    console.log('🛒 Cart API GET called')
    return NextResponse.json({ status: 'API is working' })
  } catch (error) {
    console.error('❌ Cart API GET error:', error)
    return NextResponse.json({ error: 'GET failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🛒 Cart API called - start')
  try {
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))
    
    const { variantId, quantity, countryCode } = body

    if (!variantId || !quantity || !countryCode) {
      console.error('❌ Missing required fields:', { variantId, quantity, countryCode })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 使用直接的 fetch 調用後端，而不是 SDK
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    let cartId: string

    // 1. 檢查是否已有購物車 cookie
    const existingCartId = request.cookies.get('_medusa_cart_id')?.value
    
    if (existingCartId) {
      console.log('� Found existing cart ID:', existingCartId)
      
      // 驗證購物車是否仍然有效
      try {
        const verifyResponse = await fetch(`${baseUrl}/store/carts/${existingCartId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': publishableKey || ''
          }
        })
        
        if (verifyResponse.ok) {
          const existingCart = await verifyResponse.json()
          console.log('✅ Using existing cart:', existingCartId)
          cartId = existingCartId
        } else {
          console.log('⚠️ Existing cart invalid, creating new one')
          throw new Error('Cart not found')
        }
      } catch (error) {
        console.log('⚠️ Error verifying existing cart, creating new one:', error)
        // 如果現有購物車無效，創建新的
        cartId = await createNewCart(baseUrl, publishableKey, countryCode)
      }
    } else {
      console.log('🔄 No existing cart, creating new one...')
      cartId = await createNewCart(baseUrl, publishableKey, countryCode)
    }

    // 2. 添加商品到購物車
    console.log('🔄 Adding item to cart...')
    const addItemResponse = await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || ''
      },
      body: JSON.stringify({
        variant_id: variantId,
        quantity: quantity
      })
    })

    if (!addItemResponse.ok) {
      const errorText = await addItemResponse.text()
      console.error('❌ Failed to add item to cart:', errorText)
      throw new Error(`Failed to add item to cart: ${addItemResponse.status}`)
    }

    const cartWithItem = await addItemResponse.json()
    console.log('✅ Item added to cart successfully')

    // 設定購物車 cookie
    const response = NextResponse.json({ success: true, cartId })
    response.cookies.set('_medusa_cart_id', cartId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false, // 允許客戶端讀取
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    console.error('❌ Cart API error:', error)
    
    // 詳細錯誤日誌
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to add item to cart',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    )
  }
}