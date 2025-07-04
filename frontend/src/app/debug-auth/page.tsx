"use client"

import { useEffect, useState } from "react"

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [cookies, setCookies] = useState<string>("")
  const [customerInfo, setCustomerInfo] = useState<any>(null)

  useEffect(() => {
    // 檢查 cookies
    setCookies(document.cookie)

    // 測試直接呼叫 Medusa API
    const testAuth = async () => {
      try {
        const response = await fetch('/api/auth/test-session', {
          method: 'GET',
        })
        const data = await response.json()
        setAuthState(data)
      } catch (error) {
        setAuthState({ error: error.message })
      }
    }

    // 測試取得用戶資料
    const testCustomer = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`, {
          method: 'GET',
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setCustomerInfo(data)
        } else {
          setCustomerInfo({ error: `HTTP ${response.status}` })
        }
      } catch (error) {
        setCustomerInfo({ error: error.message })
      }
    }

    testAuth()
    testCustomer()
  }, [])

  const testGoogleSignin = async () => {
    try {
      const response = await fetch('/api/auth/test-google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      console.log('測試 Google signin 回應:', response.status)
      const data = response.ok ? await response.json() : await response.text()
      console.log('回應資料:', data)
      
      if (response.ok) {
        // 登入成功後重新載入頁面以更新狀態
        window.location.reload()
      }
    } catch (error) {
      console.error('測試錯誤:', error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">認證狀態除錯</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">瀏覽器 Cookies:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {cookies || "(無 cookies)"}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">認證狀態:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">用戶資料:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(customerInfo, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">環境變數:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify({
              NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
              NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
              NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            }, null, 2)}
          </pre>
        </div>

        <button 
          onClick={testGoogleSignin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          測試 Google 登入 API
        </button>
      </div>
    </div>
  )
}
