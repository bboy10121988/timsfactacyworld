"use client"

import { useState } from "react"
import { loginWithGoogle } from "@lib/data/google-auth"

export default function TestGoogleLogin() {
  const [status, setStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTestLogin = async () => {
    try {
      setIsLoading(true)
      setStatus("正在啟動 Google 登入...")
      await loginWithGoogle()
    } catch (error: any) {
      setStatus(`錯誤: ${error.message}`)
      setIsLoading(false)
    }
  }

  const testBackendConnection = async () => {
    try {
      setStatus("測試後端連接...")
      const response = await fetch("http://localhost:9000/auth/google")
      const data = await response.json()
      setStatus(`後端回應: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setStatus(`後端連接錯誤: ${error.message}`)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Google 登入測試</h1>
      
      <div className="space-y-2">
        <button
          onClick={testBackendConnection}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          測試後端連接
        </button>
        
        <button
          onClick={handleTestLogin}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "處理中..." : "測試 Google 登入"}
        </button>
      </div>
      
      {status && (
        <div className="p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap text-sm">{status}</pre>
        </div>
      )}
    </div>
  )
}
