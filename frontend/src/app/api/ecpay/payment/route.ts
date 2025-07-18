import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log('🌐🌐🌐 前端 ECPay API 被呼叫！！！')
  console.log('⏰ 時間:', new Date().toISOString())
  
  try {
    const { cart, customer, shippingAddress, shippingMethod } = await req.json()
    
    console.log('📦 前端收到的參數:')
    console.log('- cart ID:', cart?.id)
    console.log('- customer ID:', customer?.id) 
    console.log('- shippingAddress:', !!shippingAddress ? '✅ 有地址' : '❌ 無地址')
    console.log('- shippingMethod:', shippingMethod)

    // 驗證必要資訊
    if (!cart || !cart.id) {
      return NextResponse.json(
        { success: false, message: "購物車資訊無效" },
        { status: 400 }
      )
    }

    if (!shippingAddress ||
        !shippingAddress.first_name || 
        !shippingAddress.last_name ||
        !shippingAddress.address_1 ||
        !shippingAddress.city ||
        !shippingAddress.phone) {
      return NextResponse.json(
        { success: false, message: "請先填寫完整收件資訊" },
        { status: 400 }
      )
    }

    console.log('🔄 準備調用後端 API...')
    console.log('後端 URL:', `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/create-payment`)
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/create-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ 
          cart,
          customer,
          shippingAddress,
          shippingMethod
        }),
      }
    )

    console.log('後端回應狀態:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('後端回應數據:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
