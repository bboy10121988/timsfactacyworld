"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import GoogleApiManager from "@lib/google-api-manager"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void
  onError?: (error: string) => void
}

const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isRendered, setIsRendered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  const googleManager = GoogleApiManager.getInstance()

  const handleCredentialResponse = async (response: any) => {
    try {
      console.log('收到 Google 憑證:', response)
      
      if (!response.credential) {
        throw new Error('沒有收到 Google 憑證')
      }
      
      // 將 JWT token 發送到後端進行驗證
      const result = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: response.credential 
        }),
      })

      if (!result.ok) {
        let errorData
        try {
          errorData = await result.json()
          console.error('後端驗證失敗 (JSON):', errorData)
        } catch (parseError) {
          errorData = await result.text()
          console.error('後端驗證失敗 (TEXT):', errorData)
        }
        console.error('HTTP 狀態:', result.status, result.statusText)
        console.error('回應 headers:', Object.fromEntries(result.headers.entries()))
        throw new Error(errorData?.error || errorData || `HTTP ${result.status}: Google 登入失敗`)
      }

      const data = await result.json()
      console.log('Google 登入成功:', data)
      
      // 刷新頁面或重定向
      if (onSuccess) {
        onSuccess(data)
      } else {
        window.location.href = '/tw/account'
      }
    } catch (error: any) {
      console.error('Google 登入錯誤:', error)
      const errorMessage = error.message || 'Google 登入失敗，請稍後再試'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  const initializeAndRenderButton = async () => {
    if (!buttonRef.current) return
    
    try {
      setError(null)
      
      // 檢查是否已經初始化
      if (googleManager.isGoogleInitialized()) {
        console.log('Google API 已初始化，直接渲染按鈕')
        googleManager.renderButton(buttonRef.current, handleCredentialResponse, setError)
        setIsRendered(true)
        return
      }

      // 檢查是否正在初始化
      if (googleManager.isGoogleLoading()) {
        console.log('Google API 正在初始化中，等待完成...')
        // 等待初始化完成
        const checkInitialized = () => {
          if (googleManager.isGoogleInitialized()) {
            googleManager.renderButton(buttonRef.current!, handleCredentialResponse, setError)
            setIsRendered(true)
          } else if (!googleManager.isGoogleLoading()) {
            setError('Google API 初始化失敗')
          } else {
            setTimeout(checkInitialized, 100)
          }
        }
        setTimeout(checkInitialized, 100)
        return
      }

      // 需要初始化
      console.log('開始初始化 Google API...')
      await googleManager.initializeGoogle()
      
      if (buttonRef.current) {
        googleManager.renderButton(buttonRef.current, handleCredentialResponse, setError)
        setIsRendered(true)
      }
    } catch (error: any) {
      console.error('Google 按鈕初始化失敗:', error)
      setError(`初始化失敗: ${error.message}`)
    }
  }

  // 當 Script 載入完成後初始化
  useEffect(() => {
    if (isScriptLoaded && !isRendered) {
      initializeAndRenderButton()
    }
  }, [isScriptLoaded, isRendered])

  // 超時處理
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isRendered && isScriptLoaded) {
        setIsTimeout(true)
        setError('Google 登入載入超時，請重新整理頁面再試')
      }
    }, 8000)

    if (isRendered) {
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [isRendered, isScriptLoaded])

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      // 移除當前組件的回調
      googleManager.removeCallback(handleCredentialResponse)
    }
  }, [])

  return (
    <div className="w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          console.log('Google Script 載入完成')
          setIsScriptLoaded(true)
        }}
        onError={(e) => {
          console.error('Google Script 載入失敗:', e)
          setError('Google 登入腳本載入失敗，請檢查網路連接')
        }}
        strategy="afterInteractive"
      />
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div 
        ref={buttonRef} 
        className="w-full"
        style={{ minHeight: '44px' }}
      />
      
      {!isRendered && !isTimeout && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">載入 Google 登入...</span>
        </div>
      )}
      
      {isTimeout && !isRendered && (
        <div className="w-full flex flex-col items-center justify-center gap-3 px-4 py-3 border border-red-300 rounded-md shadow-sm bg-red-50 text-red-700">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span className="text-sm font-medium">Google 登入載入超時</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsTimeout(false)
                setIsRendered(false)
                setError(null)
                if (isScriptLoaded) {
                  initializeAndRenderButton()
                }
              }} 
              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              重試
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
            >
              重新整理
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoogleLoginButton
