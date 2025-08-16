"use client"

import { useState, useEffect } from 'react'
import { sdk } from '@lib/config'

export default function ShippingTestPage() {
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [cartId, setCartId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // 創建測試購物車
  const createTestCart = async () => {
    setLoading(true)
    setError("")
    
    try {
      console.log("🛒 創建測試購物車...")
      const response = await sdk.store.cart.create({
        region_id: "reg_01K17DQ7711FDNPXRATFT04HW3"
      })
      
      console.log("✅ 購物車創建成功:", response)
      
      if (response && response.id) {
        setCartId(response.id)
        await loadShippingOptions(response.id)
      } else {
        setError("無法創建購物車")
      }
    } catch (error: any) {
      console.error("❌ 創建購物車失敗:", error)
      setError(`創建購物車失敗: ${error.message}`)
    }
    
    setLoading(false)
  }

  // 載入配送選項
  const loadShippingOptions = async (testCartId: string) => {
    try {
      console.log("📦 載入配送選項，cartId:", testCartId)
      
      // 嘗試獲取配送選項
      const response = await sdk.store.fulfillment.listCartOptions({ 
        cart_id: testCartId 
      })
      
      console.log("✅ 配送選項回應:", response)
      
      if (response && response.shipping_options) {
        setShippingOptions(response.shipping_options)
      } else {
        setError("沒有可用的配送選項")
      }
    } catch (error: any) {
      console.error("❌ 載入配送選項失敗:", error)
      setError(`載入配送選項失敗: ${error.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🚚 配送選項測試頁面</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-4">測試說明</h2>
        <p>此頁面用於測試台灣配送選項是否正確顯示：</p>
        <ul className="list-disc ml-6 mt-2">
          <li>標準宅配 - $80，3-5個工作天</li>
          <li>快速宅配 - $100，1-2個工作天</li>
        </ul>
      </div>

      <div className="space-y-4">
        <button
          onClick={createTestCart}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "載入中..." : "創建測試購物車並載入配送選項"}
        </button>

        {cartId && (
          <div className="bg-green-50 p-4 rounded">
            <p>✅ 購物車 ID: <code className="bg-gray-200 px-2 py-1 rounded">{cartId}</code></p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-600">❌ 錯誤: {error}</p>
          </div>
        )}

        {shippingOptions.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <h3 className="text-xl font-semibold mb-4">🎉 配送選項載入成功！</h3>
            <div className="space-y-4">
              {shippingOptions.map((option, index) => (
                <div key={option.id} className="bg-white p-4 border rounded">
                  <h4 className="font-semibold text-lg">{index + 1}. {option.name}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>ID:</strong> {option.id}</p>
                    <p><strong>價格類型:</strong> {option.price_type}</p>
                    <p><strong>金額:</strong> {option.amount ? `$${(option.amount / 100)} TWD` : 'N/A'}</p>
                    <p><strong>描述:</strong> {option.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">調試資訊</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ cartId, shippingOptions, error }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
