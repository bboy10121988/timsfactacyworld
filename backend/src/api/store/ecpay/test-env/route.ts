import { Request, Response } from "express"

export async function GET(req: Request, res: Response) {
  try {
    // 檢查環境變數
    const merchantId = process.env.ECPAY_MERCHANT_ID || "2000132"
    const hashKey = process.env.ECPAY_HASH_KEY || "ejCk326UnaZWKisg"
    const hashIv = process.env.ECPAY_HASH_IV || "q9jcZX8Ib9LM8wYk"
    const operationMode = process.env.NODE_ENV === "production" ? "Production" : "Test"

    // 環境變數狀態檢查
    const envStatus: string[] = []
    if (merchantId === "2000132") {
      envStatus.push("⚠️ 使用預設 MerchantID")
    } else if (merchantId === "3002607") {
      envStatus.push("✅ 使用官方測試 MerchantID")
    } else {
      envStatus.push("ℹ️ 使用自定義 MerchantID")
    }

    if (hashKey === "ejCk326UnaZWKisg") {
      envStatus.push("⚠️ 使用預設 HashKey")
    } else if (hashKey === "pwFHCqoQZGmho4w6") {
      envStatus.push("✅ 使用官方測試 HashKey")
    } else {
      envStatus.push("ℹ️ 使用自定義 HashKey")
    }

    if (hashIv === "q9jcZX8Ib9LM8wYk") {
      envStatus.push("⚠️ 使用預設 HashIV")
    } else if (hashIv === "EkRm7iFT261dpevs") {
      envStatus.push("✅ 使用官方測試 HashIV")
    } else {
      envStatus.push("ℹ️ 使用自定義 HashIV")
    }

    console.log('🔧 ECPay 環境檢查 API 被調用')
    console.log('📊 環境資訊:', {
      operationMode,
      merchantId: merchantId ? '***' + merchantId.slice(-4) : 'NOT_SET',
      hashKey: hashKey ? '***' + hashKey.slice(-4) : 'NOT_SET',
      hashIv: hashIv ? '***' + hashIv.slice(-4) : 'NOT_SET'
    })

    res.json({
      success: true,
      message: "ECPay 環境檢查成功",
      operationMode,
      merchantId,
      hashKey: hashKey ? hashKey.slice(0, 4) + '***' + hashKey.slice(-4) : undefined,
      hashIv: hashIv ? hashIv.slice(0, 4) + '***' + hashIv.slice(-4) : undefined,
      envStatus: envStatus.join(', '),
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ ECPay 環境檢查失敗:', error)
    res.status(500).json({
      success: false,
      message: "環境檢查失敗",
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

export async function POST(req: Request, res: Response) {
  // 如果有需要 POST 方法，可以在這裡實作
  res.status(405).json({
    success: false,
    message: "Method not allowed"
  })
}
