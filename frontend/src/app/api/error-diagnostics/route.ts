import { NextResponse } from "next/server"

/**
 * 錯誤診斷 API - 收集和分析應用程序錯誤
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { error, digest, url, userAgent, timestamp } = body

    // 記錄錯誤信息
    console.error('Client Error Report:', {
      error,
      digest,
      url,
      userAgent,
      timestamp,
      serverTime: new Date().toISOString()
    })

    // 在開發環境提供更多調試信息
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        status: "received",
        debug: {
          error,
          digest,
          url,
          userAgent,
          serverTime: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      status: "received",
      message: "Error report logged successfully"
    })
  } catch (error) {
    console.error("Error processing error report:", error)
    return NextResponse.json({
      status: "error",
      message: "Failed to process error report"
    }, { status: 500 })
  }
}

/**
 * 獲取錯誤統計信息
 */
export async function GET() {
  // 在實際應用中，這裡會從資料庫或錯誤追蹤服務獲取統計信息
  const mockStats = {
    totalErrors: 0,
    recentErrors: [],
    commonDigests: {
      "856306527": {
        count: 1,
        lastSeen: new Date().toISOString(),
        description: "Server Components rendering error"
      }
    }
  }

  return NextResponse.json(mockStats)
}
