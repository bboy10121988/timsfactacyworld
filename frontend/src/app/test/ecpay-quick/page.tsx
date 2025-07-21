"use client"

import { useState } from "react"

export default function ECPayLogisticsQuickTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const testLogistics = async () => {
    setLoading(true)
    setResult("")

    try {
      console.log('🧪 開始測試ECPay物流選擇API...')

      const logisticsParams = {
        goodsAmount: 1500,
        goodsName: "測試商品",
        senderName: "商店名稱",
        senderZipCode: "100",
        senderAddress: "台北市中正區重慶南路一段122號",
        isCollection: "N",
        temperature: "0001",
        specification: "0001",
        scheduledPickupTime: "4",
        enableSelectDeliveryTime: "N",
        remark: "測試訂單",
        eshopMemberID: "",
        serverReplyURL: "http://localhost:9000/store/ecpay/logistics-callback",
        clientReplyURL: "http://localhost:8000/api/ecpay/logistics/callback"
      }

      console.log('📦 發送參數:', logisticsParams)

      const response = await fetch('/api/ecpay/logistics/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logisticsParams)
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text()
        console.log('✅ 收到HTML，長度:', html.length)
        
        // 在新視窗開啟
        const logisticsWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
        
        if (logisticsWindow) {
          logisticsWindow.document.write(html)
          logisticsWindow.document.close()
          setResult("✅ 成功開啟ECPay物流選擇頁面！")
        } else {
          setResult("❌ 無法開啟新視窗，請檢查瀏覽器設定")
        }
      } else {
        const jsonData = await response.json()
        console.log('📄 收到JSON:', jsonData)
        setResult(`📄 JSON回應: ${JSON.stringify(jsonData, null, 2)}`)
      }

    } catch (error: any) {
      console.error('❌ 測試失敗:', error)
      setResult(`❌ 測試失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            ECPay 物流選擇 API 快速測試
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🧪 測試項目</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• 測試API連接</div>
                <div>• 驗證參數格式</div>
                <div>• 檢查ECPay回應</div>
                <div>• 確認跳轉功能</div>
              </div>
            </div>

            <button
              onClick={testLogistics}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {loading ? '測試中...' : '🚀 開始測試'}
            </button>

            {result && (
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-semibold mb-2">測試結果:</h3>
                <pre className="text-sm whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>• 此為測試頁面，使用ECPay測試環境</div>
                <div>• 如果成功會開啟新的ECPay物流選擇頁面</div>
                <div>• 請確保前後端服務都在運行</div>
                <div>• 檢查瀏覽器是否允許彈窗</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
