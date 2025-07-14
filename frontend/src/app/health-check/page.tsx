"use client"

import { Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

export default function HealthCheck() {
  const [health, setHealth] = useState<{
    status: string;
    message: string;
    medusaStatus?: number;
    medusaHealth?: any;
    medusaUrl?: string;
    error?: string;
    timestamp?: string;
  } | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [variantTest, setVariantTest] = useState<any>(null)
  const [variantLoading, setVariantLoading] = useState(false)
  
  const checkHealth = async () => {
    setLoading(true)
    setHealth(null)
    
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      setHealth({
        ...data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setHealth({
        status: 'error',
        message: 'Failed to check health',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }
  
  const testVariantApi = async () => {
    setVariantLoading(true)
    setVariantTest(null)
    
    // 測試用的變體ID - 這裡使用一個測試ID，實際使用時需要替換
    const testVariantId = "variant_01HXXX" // 請替換為實際存在的變體ID
    
    try {
      const response = await fetch(`/api/variants/${testVariantId}`)
      const data = await response.json()
      
      setVariantTest({
        status: response.ok ? 'success' : 'error',
        data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setVariantTest({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setVariantLoading(false)
    }
  }
  
  useEffect(() => {
    checkHealth()
  }, [])
  
  return (
    <div className="bg-white min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">系統健康狀態檢查</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Medusa 後端連接狀態</h2>
        <Button 
          onClick={checkHealth}
          variant="secondary"
          isLoading={loading}
          className="mb-4"
        >
          重新檢查
        </Button>
        
        {health ? (
          <div className={`p-4 rounded-md ${health.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${health.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${health.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {health.status === 'success' ? '連接正常' : '連接異常'}
              </span>
              {health.timestamp && (
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(health.timestamp).toLocaleString('zh-TW')}
                </span>
              )}
            </div>
            
            <div className="text-sm mb-2">{health.message}</div>
            
            {health.medusaUrl && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Medusa URL:</span> {health.medusaUrl}
              </div>
            )}
            
            {health.medusaStatus && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">狀態碼:</span> {health.medusaStatus}
              </div>
            )}
            
            {health.error && (
              <div className="text-sm text-red-600 mt-2">
                <span className="font-medium">錯誤:</span> {health.error}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="text-gray-500">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></span>
            正在檢查...
          </div>
        ) : (
          <div className="text-gray-500">尚未檢查</div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">變體 API 測試</h2>
        <p className="text-sm text-gray-600 mb-4">
          測試變體API是否正常運作，請在程式碼中替換有效的變體ID
        </p>
        
        <Button 
          onClick={testVariantApi}
          variant="secondary"
          isLoading={variantLoading}
          className="mb-4"
        >
          測試變體 API
        </Button>
        
        {variantTest ? (
          <div className={`p-4 rounded-md ${variantTest.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${variantTest.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${variantTest.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {variantTest.status === 'success' ? 'API 正常' : 'API 異常'}
              </span>
              {variantTest.timestamp && (
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(variantTest.timestamp).toLocaleString('zh-TW')}
                </span>
              )}
            </div>
            
            {variantTest.error && (
              <div className="text-sm text-red-600 mt-2">
                <span className="font-medium">錯誤:</span> {variantTest.error}
              </div>
            )}
            
            {variantTest.data && (
              <div className="mt-4">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">查看回應數據</summary>
                  <pre className="mt-2 p-4 bg-gray-100 overflow-auto rounded-md text-xs">
                    {JSON.stringify(variantTest.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ) : variantLoading ? (
          <div className="text-gray-500">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></span>
            正在測試...
          </div>
        ) : (
          <div className="text-gray-500">尚未測試</div>
        )}
      </div>
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-2">疑難排解指南</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>確認 Medusa 後端服務是否正在運行</li>
          <li>檢查 <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> 檔案中的 <code className="bg-gray-100 px-1 py-0.5 rounded">MEDUSA_BACKEND_URL</code> 設定是否正確</li>
          <li>確認網絡連接和防火牆設定</li>
          <li>如果使用 Docker，確認容器間網絡設定正確</li>
          <li>檢查 Medusa 後端日誌是否有錯誤訊息</li>
        </ul>
      </div>
    </div>
  )
}
