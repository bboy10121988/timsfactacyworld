'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
    console.error('Error digest:', error.digest)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">頁面載入失敗</h2>
        <p className="text-gray-600 mb-6">
          抱歉，此頁面暫時無法載入。請重新整理頁面或稍後再試。
        </p>
        {process.env.NODE_ENV === 'development' && error.digest && (
          <p className="text-xs text-gray-400 mb-4">
            錯誤 ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors"
        >
          重新載入
        </button>
      </div>
    </div>
  )
}
