import { NextRequest, NextResponse } from 'next/server'

// 錯誤報告 API 路由
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 記錄錯誤到控制台（在生產環境中可以發送到錯誤追蹤服務）
    console.error('客戶端錯誤報告:', {
      ...body,
      headers: Object.fromEntries(request.headers.entries()),
    })
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('錯誤報告處理失敗:', error)
    return NextResponse.json({ error: '無法處理錯誤報告' }, { status: 500 })
  }
}
