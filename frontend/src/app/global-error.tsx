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
    // 記錄錯誤到控制台
    console.error('Global error:', error)
    console.error('Error digest:', error.digest)
    // 已移除自動發送錯誤報告到診斷 API
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">發生錯誤</h2>
            <p className="mb-4">很抱歉，系統發生未預期的錯誤。</p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                技術詳情 (開發模式)
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
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
