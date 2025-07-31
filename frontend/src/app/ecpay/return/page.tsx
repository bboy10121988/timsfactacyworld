"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button, Heading, Text } from "@medusajs/ui"
import LoadingSpinner from "@/components/ui/loading-spinner"

function ECPayReturnPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading')
  const [message, setMessage] = useState('')
  const [orderInfo, setOrderInfo] = useState<any>(null)

  useEffect(() => {
    const processReturn = async () => {
      try {
        if (!searchParams) {
          setStatus('error')
          setMessage('無法取得付款資訊，請聯繫客服。')
          return
        }
        const rtnCode = searchParams.get('RtnCode')
        const merchantTradeNo = searchParams.get('MerchantTradeNo')
        const tradeNo = searchParams.get('TradeNo')
        const tradeAmt = searchParams.get('TradeAmt')
        const paymentDate = searchParams.get('PaymentDate')
        const paymentType = searchParams.get('PaymentType')
        const rtnMsg = searchParams.get('RtnMsg')
        console.log('🔍 ECPay 回傳參數:', {
          rtnCode,
          merchantTradeNo,
          tradeNo,
          tradeAmt,
          paymentDate,
          paymentType,
          rtnMsg
        })
        if (!merchantTradeNo) {
          setStatus('error')
          setMessage('缺少交易資訊，請聯繫客服。')
          return
        }
        setOrderInfo({
          merchantTradeNo,
          tradeNo,
          tradeAmt,
          paymentDate,
          paymentType,
          rtnMsg
        })
        if (rtnCode === '1') {
          setStatus('processing')
          setMessage('付款成功！正在處理您的訂單...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          setStatus('success')
          setMessage('訂單處理完成！感謝您的購買。')
          setTimeout(() => {
            router.push('/account/orders')
          }, 5000)
        } else {
          setStatus('error')
          setMessage(`付款失敗：${rtnMsg || '未知錯誤'}`)
        }
      } catch (error) {
        console.error('💥 處理付款回傳時發生錯誤:', error)
        setStatus('error')
        setMessage('處理付款資訊時發生錯誤，請聯繫客服。')
      }
    }
    processReturn()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner />
              <Heading level="h1" className="mt-6 text-3xl font-extrabold text-gray-900">
                處理中...
              </Heading>
              <Text className="mt-2 text-gray-600">
                正在處理您的付款資訊
              </Text>
            </>
          )}
          {status === 'processing' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <Heading level="h1" className="mt-6 text-3xl font-extrabold text-gray-900">
                處理訂單中
              </Heading>
              <Text className="mt-2 text-gray-600">
                {message}
              </Text>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <Heading level="h1" className="mt-6 text-3xl font-extrabold text-gray-900">
                付款成功！
              </Heading>
              <Text className="mt-2 text-gray-600">
                {message}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                5秒後將自動跳轉到訂單頁面
              </Text>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <Heading level="h1" className="mt-6 text-3xl font-extrabold text-gray-900">
                付款失敗
              </Heading>
              <Text className="mt-2 text-red-600">
                {message}
              </Text>
            </>
          )}
          {orderInfo && (
            <div className="mt-6 bg-gray-100 rounded-lg p-4 text-left">
              <Text className="font-medium text-gray-900 mb-2">交易資訊：</Text>
              <div className="space-y-1 text-sm text-gray-600">
                {orderInfo.merchantTradeNo && (
                  <div>訂單編號：{orderInfo.merchantTradeNo}</div>
                )}
                {orderInfo.tradeNo && (
                  <div>綠界交易號：{orderInfo.tradeNo}</div>
                )}
                {orderInfo.tradeAmt && (
                  <div>交易金額：NT$ {orderInfo.tradeAmt}</div>
                )}
                {orderInfo.paymentDate && (
                  <div>付款時間：{orderInfo.paymentDate}</div>
                )}
                {orderInfo.paymentType && (
                  <div>付款方式：{orderInfo.paymentType}</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          {status === 'success' && (
            <>
              <Button onClick={() => router.push('/account/orders')} className="flex-1">
                查看訂單
              </Button>
              <Button variant="secondary" onClick={() => router.push('/')} className="flex-1">
                返回首頁
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <Button variant="secondary" onClick={() => router.push('/')} className="flex-1">
                返回首頁
              </Button>
              <Button 
                onClick={() => router.push('/checkout')} 
                className="flex-1"
              >
                重新結帳
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default function ECPayReturnPage() {
  return (
    <Suspense>
      <ECPayReturnPageInner />
    </Suspense>
  )
}
// ...existing code...
