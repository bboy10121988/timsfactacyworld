"use client"

import { useState, useEffect } from "react"
import GoogleLoginButton from "@modules/account/components/google-login-button"

export default function TestGoogleButtonPage() {
  const [logMessages, setLogMessages] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // 監聽 console.log
    const originalLog = console.log
    const originalError = console.error
    
    console.log = (...args) => {
      addLog(`LOG: ${args.join(' ')}`)
      originalLog(...args)
    }
    
    console.error = (...args) => {
      addLog(`ERROR: ${args.join(' ')}`)
      originalError(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Google 登入按鈕測試</h1>
      
      <div className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Google 登入按鈕</h2>
        <div className="max-w-md">
          <GoogleLoginButton />
        </div>
      </div>

      <div className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">環境變數檢查</h2>
        <div className="space-y-2 text-sm">
          <div>NEXT_PUBLIC_GOOGLE_CLIENT_ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '未設定'}</div>
          <div>當前域名: {typeof window !== 'undefined' ? window.location.origin : '伺服器端'}</div>
          <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : '伺服器端'}</div>
        </div>
      </div>

      <div className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">控制台日誌</h2>
        <div className="bg-gray-100 p-3 rounded max-h-96 overflow-y-auto">
          {logMessages.length === 0 ? (
            <div className="text-gray-500">等待日誌訊息...</div>
          ) : (
            logMessages.map((message, index) => (
              <div key={index} className="text-xs font-mono mb-1">
                {message}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">手動測試</h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.google) {
                addLog('window.google 存在')
                if (window.google.accounts) {
                  addLog('window.google.accounts 存在')
                } else {
                  addLog('window.google.accounts 不存在')
                }
              } else {
                addLog('window.google 不存在')
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            檢查 Google API
          </button>
          
          <button
            onClick={() => {
              const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
              if (script) {
                addLog('Google Script 已載入到 DOM')
              } else {
                addLog('Google Script 未找到在 DOM 中')
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            檢查 Script 載入
          </button>
        </div>
      </div>
    </div>
  )
}
