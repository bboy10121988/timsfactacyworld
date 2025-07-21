import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log('🗺️ 前端 ECPay Logistics Map API 被呼叫')
  
  try {
    const { storeType, cartId, extraData } = await req.json()
    
    console.log('📦 前端收到的參數:')
    console.log('- storeType:', storeType)
    console.log('- cartId:', cartId)
    console.log('- extraData:', extraData)

    // 驗證必要參數
    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "缺少購物車 ID" },
        { status: 400 }
      )
    }

    console.log('🔄 準備調用後端物流地圖 API...')
    console.log('後端 URL:', `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/logistics/map`)
    
    // 將 storeType 映射到 shippingMethod
    const shippingMethodMap: { [key: string]: string } = {
      'UNIMARTC2C': '7-11',
      'FAMIC2C': '全家',
      'HILIFEC2C': '萊爾富'
    }
    
    const shippingMethod = shippingMethodMap[storeType] || storeType
    console.log('🏪 映射後的 shippingMethod:', shippingMethod)
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/logistics/map`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ 
          shippingMethod,
          cartId,
          extraData
        }),
      }
    )

    console.log('後端回應狀態:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('後端回應數據:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating logistics map:", error)
    return NextResponse.json(
      { error: "Failed to create logistics map" },
      { status: 500 }
    )
  }
}
