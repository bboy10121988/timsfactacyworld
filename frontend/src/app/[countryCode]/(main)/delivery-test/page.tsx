// 測試配送選項顯示的範例頁面
"use client"

import { useState, useEffect } from 'react'
import { HttpTypes } from '@medusajs/types'
import { listCartShippingMethods } from '@lib/data/fulfillment'

export default function DeliveryTestPage() {
  const [shippingMethods, setShippingMethods] = useState<HttpTypes.StoreCartShippingOption[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testShippingOptions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 使用測試購物車ID 或創建新的
      const testCartId = "test-cart-id" // 這裡需要實際的購物車ID
      
      const methods = await listCartShippingMethods(testCartId)
      console.log("📦 測試獲取到的配送方式:", methods)
      setShippingMethods(methods)
    } catch (err) {
      console.error("❌ 獲取配送方式失敗:", err)
      setError(err instanceof Error ? err.message : "未知錯誤")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🚚 配送選項測試頁面</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">測試結果</h2>
        
        <div className="mb-4">
          <button 
            onClick={testShippingOptions}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "載入中..." : "測試獲取配送選項"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>錯誤: </strong>{error}
          </div>
        )}

        {shippingMethods && (
          <div className="space-y-4">
            <h3 className="font-semibold">可用的配送方式 ({shippingMethods.length} 個):</h3>
            {shippingMethods.length === 0 ? (
              <p className="text-gray-500">沒有可用的配送方式</p>
            ) : (
              <div className="space-y-3">
                {shippingMethods.map((method, index) => (
                  <div key={method.id} className="border rounded p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-gray-600">ID: {method.id}</p>
                        <p className="text-sm text-gray-600">價格類型: {method.price_type}</p>
                      </div>
                      <div className="text-lg font-semibold">
                        {method.amount ? `$${(method.amount / 100).toFixed(2)}` : '計算中'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">已知的後端配送選項:</h3>
          <ul className="space-y-1 text-sm">
            <li>✅ Standard Shipping (so_01K2K7ABW9THYBX25W456SW0J1)</li>
            <li>✅ Express Shipping (so_01K2K7ABWDMMYAT5NMQ0N49P4Y)</li>
            <li>📍 服務區域: Europe (serzo_01K2K7ABNPPV1WXJ0FWNW7FAGN)</li>
            <li>🚚 提供者: manual_manual</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
