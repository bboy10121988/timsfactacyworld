"use client"

import React, { useState } from 'react'
import LogisticsSelection from '../../../components/ecpay/logistics-selection'

export default function LogisticsTestPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = (data: any) => {
    console.log('✅ 物流選擇成功:', data)
    setResult(data)
    setError(null)
    
    // 如果有暫存物流訂單編號，顯示成功訊息
    if (data.tempLogisticsID) {
      alert(`物流選擇完成！\n暫存訂單編號：${data.tempLogisticsID}\n物流類型：${data.logisticsType}\n物流子類型：${data.logisticsSubType}`)
    }
  }

  const handleError = (errorMessage: string) => {
    console.error('❌ 物流選擇錯誤:', errorMessage)
    setError(errorMessage)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ECPay 物流選擇測試</h1>
          <p className="text-gray-600">測試綠界科技物流選擇頁面功能</p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤訊息</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* 成功結果 */}
        {result && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-500 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">操作成功</h3>
                <div className="mt-1 text-sm text-green-700">
                  {result.tempLogisticsID ? (
                    <div>
                      <p><strong>暫存物流訂單編號：</strong>{result.tempLogisticsID}</p>
                      <p><strong>物流類型：</strong>{result.logisticsType}</p>
                      <p><strong>物流子類型：</strong>{result.logisticsSubType}</p>
                      {result.receiverName && <p><strong>收件人：</strong>{result.receiverName}</p>}
                      {result.receiverStoreID && <p><strong>取貨門市：</strong>{result.receiverStoreName} ({result.receiverStoreID})</p>}
                      {result.receiverAddress && <p><strong>收件地址：</strong>{result.receiverAddress}</p>}
                    </div>
                  ) : (
                    <p>{result.message || '物流選擇頁面已開啟'}</p>
                  )}
                </div>
                {result.tempLogisticsID && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 請保存暫存物流訂單編號，用於後續建立正式物流訂單
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 物流選擇表單 */}
        <LogisticsSelection onSuccess={handleSuccess} onError={handleError} />

        {/* 使用說明 */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 使用說明</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. 填寫基本資訊：</strong>商品金額、名稱等必要資訊</p>
            <p><strong>2. 設定寄件人：</strong>提供寄件人姓名、地址、郵遞區號</p>
            <p><strong>3. 選擇物流設定：</strong>溫層、規格、取件時段等</p>
            <p><strong>4. 預填收件資訊：</strong>可選擇性預填收件人資料</p>
            <p><strong>5. 開啟選擇頁面：</strong>點擊按鈕將開啟綠界物流選擇頁面</p>
            <p><strong>6. 完成選擇：</strong>在新視窗中完成物流選擇，結果會自動回傳</p>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 注意事項：</strong>
            </p>
            <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc space-y-1">
              <li>請確保瀏覽器允許彈出視窗</li>
              <li>冷藏/冷凍商品不可選擇 150cm 規格</li>
              <li>手機號碼須為 09 開頭的 10 位數字</li>
              <li>姓名須為 4-10 個字元且不可包含數字和特殊符號</li>
              <li>商品名稱不可包含特殊符號</li>
            </ul>
          </div>
        </div>

        {/* 測試資料說明 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-md font-semibold text-gray-800 mb-2">🧪 測試環境說明</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 使用綠界測試環境，不會產生實際物流訂單</p>
            <p>• 測試商店代號：2000132</p>
            <p>• 可以測試各種物流方式：7-ELEVEN、全家、萊爾富、OK超商、宅配等</p>
            <p>• 完成選擇後會取得暫存物流訂單編號，可用於後續 API 操作</p>
          </div>
        </div>
      </div>
    </div>
  )
}
