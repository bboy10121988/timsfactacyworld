'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface LogisticsCallbackData {
  RtnCode?: number
  RtnMsg?: string
  TempLogisticsID?: string
  LogisticsType?: string
  LogisticsSubType?: string
  ReceiverName?: string
  ReceiverPhone?: string
  ReceiverCellPhone?: string
  ReceiverAddress?: string
  ReceiverZipCode?: string
  ReceiverStoreID?: string
  ReceiverStoreName?: string
  ScheduledDeliveryDate?: string
  ScheduledDeliveryTime?: string
}

export default function LogisticsCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [callbackData, setCallbackData] = useState<LogisticsCallbackData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 處理ECPay物流選擇回調
    const handleCallback = async () => {
      try {
        // 從URL參數或POST data中獲取回調資料
        const data: LogisticsCallbackData = {}
        
        // 檢查URL參數
        if (searchParams) {
          searchParams.forEach((value, key) => {
            (data as any)[key] = value
          })
        }

        console.log('ECPay物流選擇回調資料:', data)
        setCallbackData(data)

        if (data.RtnCode === 1) {
          // 成功選擇物流
          toast.success('物流選擇成功！')
          
          // 將物流資訊儲存到 localStorage 或發送到後端
          if (data.TempLogisticsID) {
            localStorage.setItem('ecpay_logistics_data', JSON.stringify(data))
          }

          // 回到結帳頁面
          setTimeout(() => {
            router.push('/checkout?step=address')
          }, 2000)
          
        } else {
          // 物流選擇失敗或取消
          toast.error(data.RtnMsg || '物流選擇失敗')
          
          setTimeout(() => {
            router.push('/checkout')
          }, 2000)
        }

      } catch (error) {
        console.error('處理ECPay物流回調失敗:', error)
        toast.error('處理物流選擇結果失敗')
        router.push('/checkout')
      } finally {
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">處理物流選擇結果中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {callbackData?.RtnCode === 1 ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">物流選擇成功</h2>
              <p className="text-gray-600 mb-4">您的物流配送方式已確認</p>
              
              {callbackData.LogisticsType && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <h3 className="font-medium text-gray-900 mb-2">配送資訊</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">物流類型:</span> {callbackData.LogisticsType}</p>
                    <p><span className="font-medium">子類型:</span> {callbackData.LogisticsSubType}</p>
                    {callbackData.ReceiverStoreName && (
                      <p><span className="font-medium">取貨門市:</span> {callbackData.ReceiverStoreName}</p>
                    )}
                    {callbackData.ReceiverAddress && (
                      <p><span className="font-medium">配送地址:</span> {callbackData.ReceiverAddress}</p>
                    )}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">正在返回結帳頁面...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">物流選擇失敗</h2>
              <p className="text-gray-600 mb-4">
                {callbackData?.RtnMsg || '物流選擇過程中發生錯誤'}
              </p>
              <p className="text-sm text-gray-500">正在返回結帳頁面...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
