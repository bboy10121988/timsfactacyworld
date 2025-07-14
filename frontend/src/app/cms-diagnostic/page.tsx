'use client'

import { useEffect, useState } from 'react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'loading'
  message: string
  details?: any
}

export default function CMSDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([
    { name: 'React Context', status: 'loading', message: 'Checking...' },
    { name: 'Sanity Config', status: 'loading', message: 'Checking...' },
    { name: 'Next Sanity', status: 'loading', message: 'Checking...' },
    { name: 'Schemas', status: 'loading', message: 'Checking...' },
    { name: 'Environment Variables', status: 'loading', message: 'Checking...' },
  ])

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    // Test 1: React Context
    try {
      const React = await import('react')
      if (React.createContext) {
        updateDiagnostic('React Context', 'success', 'React Context available')
      } else {
        updateDiagnostic('React Context', 'error', 'React Context not available')
      }
    } catch (error) {
      updateDiagnostic('React Context', 'error', `React import failed: ${error}`)
    }

    // Test 2: Sanity Config
    try {
      const config = await import('../../../../sanity.config.simple')
      if (config.default) {
        updateDiagnostic('Sanity Config', 'success', `Config loaded: ${config.default.title}`)
      } else {
        updateDiagnostic('Sanity Config', 'error', 'Config default export missing')
      }
    } catch (error) {
      updateDiagnostic('Sanity Config', 'error', `Config import failed: ${error}`)
    }

    // Test 3: Next Sanity
    try {
      const nextSanity = await import('next-sanity/studio')
      if (nextSanity.NextStudio) {
        updateDiagnostic('Next Sanity', 'success', 'NextStudio component available')
      } else {
        updateDiagnostic('Next Sanity', 'error', 'NextStudio component not found')
      }
    } catch (error) {
      updateDiagnostic('Next Sanity', 'error', `next-sanity/studio import failed: ${error}`)
    }

    // Test 4: Schemas
    try {
      const schemas = await import('../../../../schemas')
      if (schemas.schemaTypes && Array.isArray(schemas.schemaTypes)) {
        updateDiagnostic('Schemas', 'success', `${schemas.schemaTypes.length} schemas loaded`)
      } else {
        updateDiagnostic('Schemas', 'error', 'Invalid schemas export')
      }
    } catch (error) {
      updateDiagnostic('Schemas', 'error', `Schemas import failed: ${error}`)
    }

    // Test 5: Environment Variables
    const envVars = {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    }
    
    if (envVars.projectId && envVars.dataset) {
      updateDiagnostic('Environment Variables', 'success', `Project: ${envVars.projectId}, Dataset: ${envVars.dataset}`)
    } else {
      updateDiagnostic('Environment Variables', 'error', 'Missing required environment variables')
    }
  }

  const updateDiagnostic = (name: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setDiagnostics(prev => 
      prev.map(d => 
        d.name === name ? { ...d, status, message, details } : d
      )
    )
  }

  const allPassed = diagnostics.every(d => d.status === 'success')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔧 CMS 診斷工具
          </h1>

          <div className="space-y-4 mb-8">
            {diagnostics.map((diagnostic) => (
              <div key={diagnostic.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    diagnostic.status === 'success' ? 'bg-green-500' :
                    diagnostic.status === 'error' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`} />
                  <h3 className="text-lg font-medium text-gray-900">{diagnostic.name}</h3>
                </div>
                <p className={`text-sm ${
                  diagnostic.status === 'success' ? 'text-green-600' :
                  diagnostic.status === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {diagnostic.message}
                </p>
              </div>
            ))}
          </div>

          <div className={`p-6 rounded-lg ${allPassed ? 'bg-green-50' : 'bg-red-50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${allPassed ? 'text-green-800' : 'text-red-800'}`}>
              {allPassed ? '✅ 所有檢查通過' : '❌ 發現問題'}
            </h2>
            
            {allPassed ? (
              <div>
                <p className="text-green-700 mb-4">
                  CMS 配置正常，可以嘗試訪問：
                </p>
                <div className="space-x-4">
                  <a 
                    href="/cms" 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    訪問 CMS Studio
                  </a>
                  <a 
                    href="/cms-test" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    測試版 CMS
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-700 mb-4">
                  請解決上述問題後重試。常見解決方案：
                </p>
                <ul className="text-red-600 space-y-2 text-sm">
                  <li>• 重新安裝依賴：yarn install</li>
                  <li>• 檢查環境變數配置</li>
                  <li>• 清除 .next 快取：rm -rf .next</li>
                  <li>• 重啟開發服務器</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              重新檢測
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
