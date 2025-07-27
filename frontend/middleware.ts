import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 建立回應
  const response = NextResponse.next()

  // 添加性能優化 headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // 為靜態資源設定快取
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // 為圖片設定快取
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|avif|ico|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  }

  // 為字體設定快取
  if (request.nextUrl.pathname.match(/\.(woff|woff2|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  // 為 API 路由設定快取控制
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 符合所有請求路徑，除了：
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next/static|_static|favicon.ico).*)',
  ],
}
