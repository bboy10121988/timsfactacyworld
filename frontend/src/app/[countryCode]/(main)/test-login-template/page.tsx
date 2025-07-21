"use client"

import LoginTemplate from "@modules/account/templates/login-template"

export default function TestLoginTemplatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          登入/註冊模板測試
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg">
          <LoginTemplate />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">測試說明：</h2>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Google 登入按鈕現在在頂部，不會因為切換而重新渲染</li>
            <li>點擊「立即加入」和「立即登入」來回切換</li>
            <li>觀察 Google 按鈕是否保持不變（不會閃爍或重新載入）</li>
            <li>確認切換時只有表單部分在變化</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
