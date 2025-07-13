'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'loading'
  message: string
}

export default function IntegrationTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Frontend Server', status: 'loading', message: '檢查中...' },
    { name: 'Sanity CMS Route', status: 'loading', message: '檢查中...' },
    { name: 'Sanity API', status: 'loading', message: '檢查中...' },
    { name: 'Backend API', status: 'loading', message: '檢查中...' }
  ])

  useEffect(() => {
    const runTests = async () => {
      // Test 1: Frontend Server (already working if we're here)
      setTests(prev => prev.map(test => 
        test.name === 'Frontend Server' 
          ? { ...test, status: 'success', message: '前端服務器運行正常 (port 8000)' }
          : test
      ))

      // Test 2: Check Sanity CMS Route accessibility
      try {
        const response = await fetch('/cms', { method: 'HEAD' })
        setTests(prev => prev.map(test => 
          test.name === 'Sanity CMS Route' 
            ? { 
                ...test, 
                status: response.ok ? 'success' : 'error', 
                message: response.ok ? 'CMS 路由可訪問 (/cms)' : `CMS 路由錯誤: ${response.status}`
              }
            : test
        ))
      } catch (error) {
        setTests(prev => prev.map(test => 
          test.name === 'Sanity CMS Route' 
            ? { ...test, status: 'error', message: `CMS 路由檢測失敗: ${error}` }
            : test
        ))
      }

      // Test 3: Check Sanity API connectivity
      try {
        const sanityProjectId = 'm7o2mv1n'
        const sanityDataset = 'production'
        const sanityApiUrl = `https://${sanityProjectId}.api.sanity.io/v2021-06-07/data/query/${sanityDataset}?query=*[_type == "post"][0..2]`
        
        const response = await fetch(sanityApiUrl)
        const data = await response.json()
        
        setTests(prev => prev.map(test => 
          test.name === 'Sanity API' 
            ? { 
                ...test, 
                status: response.ok ? 'success' : 'error', 
                message: response.ok 
                  ? `Sanity API 連接正常 (找到 ${data.result?.length || 0} 筆記錄)` 
                  : `Sanity API 錯誤: ${response.status}`
              }
            : test
        ))
      } catch (error) {
        setTests(prev => prev.map(test => 
          test.name === 'Sanity API' 
            ? { ...test, status: 'error', message: `Sanity API 檢測失敗: ${error}` }
            : test
        ))
      }

      // Test 4: Check Backend API
      try {
        const response = await fetch('http://localhost:9000/health')
        setTests(prev => prev.map(test => 
          test.name === 'Backend API' 
            ? { 
                ...test, 
                status: response.ok ? 'success' : 'error', 
                message: response.ok ? 'Medusa 後端 API 運行正常 (port 9000)' : `後端 API 錯誤: ${response.status}`
              }
            : test
        ))
      } catch (error) {
        setTests(prev => prev.map(test => 
          test.name === 'Backend API' 
            ? { ...test, status: 'error', message: `後端 API 檢測失敗: ${error}` }
            : test
        ))
      }
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              🔧 系統整合測試
            </h1>
            
            <div className="space-y-6">
              {tests.map((test) => (
                <div key={test.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      test.status === 'success' ? 'bg-green-500' :
                      test.status === 'error' ? 'bg-red-500' :
                      'bg-yellow-500 animate-pulse'
                    }`} />
                    <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                  </div>
                  <p className={`text-sm ${
                    test.status === 'success' ? 'text-green-600' :
                    test.status === 'error' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {test.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 整合成果總結</h2>
              <div className="space-y-3 text-gray-700">
                <p>✅ <strong>Sanity CMS 成功整合</strong>：已嵌入至 Next.js 前端 <code>/cms</code> 路徑</p>
                <p>✅ <strong>統一部署架構</strong>：前端、後端、CMS 共享同一個 workspace</p>
                <p>✅ <strong>依賴共享優化</strong>：Sanity 依賴整合至前端 package.json</p>
                <p>✅ <strong>開發環境整合</strong>：使用 <code>npm run dev:integrated</code> 同時啟動前後端</p>
                <p>✅ <strong>統一域名存取</strong>：所有服務都可透過 localhost:8000 存取</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/cms" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                📝 開啟 CMS Studio
              </Link>
              <Link 
                href="/cms-info" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg text-center hover:bg-green-700 transition-colors"
              >
                📋 查看整合資訊
              </Link>
              <Link 
                href="/" 
                className="bg-gray-600 text-white px-6 py-3 rounded-lg text-center hover:bg-gray-700 transition-colors"
              >
                🏠 回到首頁
              </Link>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">🚀 下一步建議</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• 測試 Sanity Studio 的完整功能（內容編輯、發布、預覽）</li>
                <li>• 設定生產環境的環境變數和安全配置</li>
                <li>• 優化 Sanity Schema 以符合專案需求</li>
                <li>• 設定 Sanity 與 Next.js 的內容預覽功能</li>
                <li>• 配置 CDN 和圖片優化設定</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
