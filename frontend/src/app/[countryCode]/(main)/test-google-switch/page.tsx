"use client"

import { useState } from "react"
import GoogleLoginButton from "@modules/account/components/google-login-button"

export default function TestSwitchPage() {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Google 登入切換測試</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setCurrentView('login')}
          className={`px-4 py-2 rounded ${
            currentView === 'login' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          登入頁面
        </button>
        <button
          onClick={() => setCurrentView('register')}
          className={`px-4 py-2 rounded ${
            currentView === 'register' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          註冊頁面
        </button>
      </div>

      <div className="border p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {currentView === 'login' ? '登入頁面' : '註冊頁面'}
        </h2>
        
        <div className="max-w-md">
          <GoogleLoginButton 
            onSuccess={(data) => {
              console.log('Google 登入成功:', data)
              alert(`Google 登入成功！當前在${currentView === 'login' ? '登入' : '註冊'}頁面`)
            }}
            onError={(error) => {
              console.error('Google 登入失敗:', error)
              alert(`Google 登入失敗: ${error}`)
            }}
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>說明：點擊上方按鈕切換頁面，Google 登入按鈕應該能正常工作。</p>
          <p>這個測試模擬了登入頁面和註冊頁面之間的切換。</p>
        </div>
      </div>

      <div className="border p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">測試步驟：</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>確認當前頁面的 Google 登入按鈕能正常載入</li>
          <li>點擊上方按鈕切換到另一個頁面</li>
          <li>確認切換後的 Google 登入按鈕能正常載入（不會一直顯示載入中）</li>
          <li>重複切換測試</li>
        </ol>
      </div>
    </div>
  )
}
