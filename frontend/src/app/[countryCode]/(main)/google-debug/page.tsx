"use client"

import { useState, useEffect } from "react"

export default function GoogleDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  useEffect(() => {
    // 收集調試信息
    const info = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }
    setDebugInfo(info)

    // 檢查 Google API 是否載入
    const checkGoogle = () => {
      if (window.google) {
        setIsGoogleLoaded(true)
        console.log('Google API 已載入')
      } else {
        console.log('Google API 未載入')
      }
    }

    // 載入 Google 腳本
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = checkGoogle
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const testGoogleInitialization = () => {
    if (!window.google) {
      alert('Google API 未載入')
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '21147467753-jfjp5g559a1s61s416bu4ko41mq6no5g.apps.googleusercontent.com',
        callback: (response: any) => {
          console.log('測試回調成功:', response)
          alert('Google 初始化成功！')
        },
        auto_select: false,
      })
      alert('Google Sign-In 初始化成功')
    } catch (error) {
      console.error('初始化失敗:', error)
      alert(`初始化失敗: ${error}`)
    }
  }

  const testDirectGoogleAuth = () => {
    // 直接使用 Google OAuth URL 進行測試
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '21147467753-jfjp5g559a1s61s416bu4ko41mq6no5g.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent(`${window.location.origin}/google-test-callback`)
    const scope = encodeURIComponent('openid email profile')
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent`
    
    console.log('測試用 Google OAuth URL:', authUrl)
    window.open(authUrl, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Google 登入調試頁面</h1>
      
      {/* 調試信息 */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">調試信息</h2>
        <pre className="text-sm bg-white p-3 rounded border overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* Google API 狀態 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Google API 狀態</h2>
        <p className={`text-lg ${isGoogleLoaded ? 'text-green-600' : 'text-red-600'}`}>
          {isGoogleLoaded ? '✅ Google API 已載入' : '❌ Google API 未載入'}
        </p>
      </div>

      {/* 測試按鈕 */}
      <div className="space-y-3">
        <button
          onClick={testGoogleInitialization}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          測試 Google Sign-In 初始化
        </button>

        <button
          onClick={testDirectGoogleAuth}
          className="w-full px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          測試直接 Google OAuth 流程
        </button>
      </div>

      {/* 步驟指南 */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">🔧 修正步驟</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <strong>前往 Google Cloud Console：</strong>
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank"
              className="text-blue-600 underline ml-2"
            >
              https://console.cloud.google.com/apis/credentials
            </a>
          </li>
          <li>
            <strong>找到你的 OAuth 2.0 客戶端 ID：</strong>
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">
              {debugInfo.clientId}
            </code>
          </li>
          <li>
            <strong>編輯設定，確保「已授權的 JavaScript 來源」包含：</strong>
            <code className="bg-gray-200 px-2 py-1 rounded text-xs block mt-1">
              {debugInfo.origin}
            </code>
          </li>
          <li>
            <strong>刪除所有「已授權的重新導向 URI」</strong>（GIS 不需要）
          </li>
          <li>保存設定並等待 5-10 分鐘生效</li>
        </ol>
      </div>

      {/* 錯誤排解 */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">❌ 常見錯誤解決</h2>
        <div className="space-y-2 text-sm">
          <p><strong>redirect_uri_mismatch:</strong> Google Cloud Console 設置問題</p>
          <p><strong>invalid_client:</strong> Client ID 錯誤或項目未啟用</p>
          <p><strong>unauthorized_client:</strong> 應用程式類型設置錯誤</p>
        </div>
      </div>
    </div>
  )
}
