"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleGoogleCallback } from "@lib/data/google-auth"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // 從 URL 參數獲取授權碼
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('Google 登入失敗：' + decodeURIComponent(error))
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('未收到 Google 授權碼')
          return
        }

        // 處理登入
        const result = await handleGoogleCallback(code)
        
        if (result.success) {
          setStatus('success')
          setMessage('登入成功！正在重定向...')
          
          // 延遲一下然後重定向到首頁或帳戶頁面
          setTimeout(() => {
            router.push('/tw/account')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('處理登入資訊時發生錯誤：' + (result.error || '未知錯誤'))
        }
      } catch (error: any) {
        console.error('Google 回調處理錯誤:', error)
        setStatus('error')
        setMessage('登入過程中發生錯誤：' + error.message)
      }
    }

    processCallback()
  }, [searchParams, router])

  const handleRetry = () => {
    router.push('/tw/account')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">處理登入中...</h2>
            <p className="text-gray-600">請稍候，我們正在完成您的 Google 登入</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">登入成功！</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">登入失敗</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              返回登入頁面
            </button>
          </>
        )}
      </div>
    </div>
  )
}
