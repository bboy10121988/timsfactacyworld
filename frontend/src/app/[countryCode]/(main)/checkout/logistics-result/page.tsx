"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

interface LogisticsResult {
  RtnCode: number
  RtnMsg: string
  TempLogisticsID: string
  LogisticsType: string
  LogisticsSubType: string
  ReceiverName: string
  ReceiverPhone: string
  ReceiverCellphone: string
  ReceiverAddress: string
  ReceiverZipCode: string
  ScheduledDeliveryDate: string
  ScheduledDeliveryTime: string
  ReceiverStoreID: string
  ReceiverStoreName: string
}

export default function LogisticsResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<LogisticsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // 從 URL 參數中獲取物流選擇結果
      const resultData = searchParams.get('data')
      
      if (resultData) {
        // 解析 Base64 編碼的結果資料
        const decodedData = atob(resultData)
        const parsedResult = JSON.parse(decodedData) as LogisticsResult
        setResult(parsedResult)
        
        console.log('✅ 物流選擇結果:', parsedResult)
        
        // 如果成功，可以將結果存到本地存儲或發送到服務端
        if (parsedResult.RtnCode === 1) {
          // 成功處理
          localStorage.setItem('logistics_selection', JSON.stringify(parsedResult))
        }
      } else {
        setError('未收到物流選擇結果')
      }
    } catch (err: any) {
      console.error('❌ 解析物流選擇結果失敗:', err)
      setError('解析物流選擇結果失敗')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const handleContinueCheckout = () => {
    // 返回結帳頁面，並帶上物流選擇結果
    router.push('/checkout?logistics_selected=true')
  }

  const handleReselect = () => {
    // 重新選擇物流
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">處理物流選擇結果中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-red-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">處理失敗</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleReselect}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              重新選擇
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <p className="text-gray-600">未收到物流選擇結果</p>
            <button
              onClick={handleReselect}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              重新選擇
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isSuccess = result.RtnCode === 1

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {isSuccess ? (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <h1 className={`text-2xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {isSuccess ? '物流選擇成功' : '物流選擇失敗'}
          </h1>
          <p className="text-gray-600 mt-2">{result.RtnMsg}</p>
        </div>

        {isSuccess && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">物流資訊</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">物流類型:</span>
                  <span className="ml-2 font-medium">{result.LogisticsType}</span>
                </div>
                <div>
                  <span className="text-gray-500">物流子類型:</span>
                  <span className="ml-2 font-medium">{result.LogisticsSubType}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">暫存訂單號:</span>
                  <span className="ml-2 font-medium">{result.TempLogisticsID}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">收件資訊</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">收件人:</span>
                  <span className="ml-2 font-medium">{result.ReceiverName}</span>
                </div>
                <div>
                  <span className="text-gray-500">手機:</span>
                  <span className="ml-2 font-medium">{result.ReceiverCellphone}</span>
                </div>
                {result.ReceiverPhone && (
                  <div>
                    <span className="text-gray-500">電話:</span>
                    <span className="ml-2 font-medium">{result.ReceiverPhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">地址:</span>
                  <span className="ml-2 font-medium">{result.ReceiverAddress}</span>
                </div>
                <div>
                  <span className="text-gray-500">郵遞區號:</span>
                  <span className="ml-2 font-medium">{result.ReceiverZipCode}</span>
                </div>
              </div>
            </div>

            {result.ReceiverStoreID && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">門市資訊</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">門市代碼:</span>
                    <span className="ml-2 font-medium">{result.ReceiverStoreID}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">門市名稱:</span>
                    <span className="ml-2 font-medium">{result.ReceiverStoreName}</span>
                  </div>
                </div>
              </div>
            )}

            {(result.ScheduledDeliveryDate || result.ScheduledDeliveryTime) && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">配送時間</h3>
                <div className="space-y-2 text-sm">
                  {result.ScheduledDeliveryDate && (
                    <div>
                      <span className="text-gray-500">預定送達日期:</span>
                      <span className="ml-2 font-medium">{result.ScheduledDeliveryDate}</span>
                    </div>
                  )}
                  {result.ScheduledDeliveryTime && (
                    <div>
                      <span className="text-gray-500">預定送達時段:</span>
                      <span className="ml-2 font-medium">
                        {result.ScheduledDeliveryTime === "1" ? "13前" :
                         result.ScheduledDeliveryTime === "2" ? "14~18" :
                         result.ScheduledDeliveryTime === "4" ? "不限時" :
                         result.ScheduledDeliveryTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-4 mt-6 pt-4 border-t">
          <button
            onClick={handleReselect}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            重新選擇
          </button>
          {isSuccess && (
            <button
              onClick={handleContinueCheckout}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              繼續結帳
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
