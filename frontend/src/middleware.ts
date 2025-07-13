import { NextRequest, NextResponse } from "next/server"

/**
 * 簡化版的 middleware，只做基本重定向
 * 避免複雜的區域處理邏輯和API調用
 */
export async function middleware(request: NextRequest) {
  try {
    // 直接使用 "tw" 作為預設區域
    const countryCode = "tw"
    
    // 排除特殊路徑（CMS, API 等）
    const excludedPaths = ['/cms', '/cms-info', '/integration-test', '/api', '/_next', '/favicon.ico']
    const isExcludedPath = excludedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )
    
    if (isExcludedPath) {
      return NextResponse.next()
    }
    
    // 檢查 URL 中是否已經包含國家代碼
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
    const validCountryCodes = ["tw", "us"] // 支持的國家代碼
    
    // 如果 URL 路徑已包含有效的國家代碼，直接繼續
    if (validCountryCodes.includes(urlCountryCode)) {
      return NextResponse.next()
    }
    
    // 如果是靜態資源，直接處理
    if (request.nextUrl.pathname.includes(".")) {
      return NextResponse.next()
    }
    
    // 如果 URL 不包含國家代碼，重定向到帶有國家代碼的 URL
    const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
    const queryString = request.nextUrl.search ? request.nextUrl.search : ""
    
    // 構建重定向 URL
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    
    // 執行重定向
    return NextResponse.redirect(redirectUrl, 307)
  } catch (error) {
    console.error("Middleware 處理時發生錯誤:", error)
    // 發生任何錯誤時，都允許請求繼續而不中斷
    return NextResponse.next()
  }
}

// 定義 middleware 應用的路徑 - 排除 CMS 相關路徑
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp|cms|cms-info|integration-test).*)",
  ],
}
