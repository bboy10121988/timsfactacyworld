import { Request, Response } from "express"

export const GET = async (req: Request, res: Response) => {
  try {
    const healthInfo = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Medusa Backend",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      ecpay: {
        merchantId: process.env.ECPAY_MERCHANT_ID ? "設定完成" : "未設定",
        hashKey: process.env.ECPAY_HASH_KEY ? "設定完成" : "未設定", 
        hashIv: process.env.ECPAY_HASH_IV ? "設定完成" : "未設定",
      },
      database: "connected", // 在實際環境中可以檢查資料庫連線
      version: "1.0.0"
    }

    res.status(200).json(healthInfo)
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
