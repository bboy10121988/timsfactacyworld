'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 記錄錯誤到控制台或錯誤追蹤服務
    console.error('Global error:', error)
    console.error('Error digest:', error.digest)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">出現了一些問題</h2>
            <p className="text-gray-600 mb-6">
              應用程序遇到了意外錯誤。我們已經記錄了這個問題，請稍後再試。
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  技術詳情 (開發模式)
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
            <button
              onClick={reset}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              重新嘗試
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
