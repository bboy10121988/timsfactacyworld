"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const initializeGoogleSignIn = () => {
    if (window.google && buttonRef.current) {
      console.log('初始化 Google Sign-In')
      console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
      console.log('Current origin:', window.location.origin)
      
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '21147467753-jfjp5g559a1s61s416bu4ko41mq6no5g.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: false,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        })

        setIsLoaded(true)
        console.log('Google Sign-In 初始化完成')
      } catch (error) {
        console.error('Google Sign-In 初始化失敗:', error)
        setError(`Google Sign-In 初始化失敗: ${error}`)
      }
    }
  }

  useEffect(() => {
    if (isLoaded && window.google) {
      initializeGoogleSignIn()
    }
  }, [isLoaded])

  return (
    <div className="w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setIsLoaded(true)}
        strategy="lazyOnload"
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
      
      {!isLoaded && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">載入 Google 登入...</span>
        </div>
      )}
    </div>
  )
}

export default GoogleLoginButton
