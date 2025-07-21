"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircleIcon } from "@heroicons/react/24/solid"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const merchantTradeNo = searchParams.get('MerchantTradeNo')
  const tradeNo = searchParams.get('TradeNo')
  const paymentType = searchParams.get('PaymentType')
  const paymentDate = searchParams.get('PaymentDate')
  
  useEffect(() => {
    async function fetchOrderInfo() {
      if (!merchantTradeNo) {
        setLoading(false)
        return
      }

      try {
        // 嘗試從後端獲取訂單資訊
        const response = await fetch(`/api/orders/by-merchant-trade-no/${merchantTradeNo}`)
        
        if (response.ok) {
          const data = await response.json()
          setOrderInfo({
            ...data,
            merchantTradeNo,
            tradeNo,
            paymentType,
            paymentDate
          })
        } else {
          // 如果找不到訂單，仍然顯示基本資訊
          setOrderInfo({
            merchantTradeNo,
            tradeNo,
            paymentType,
            paymentDate
          })
        }
      } catch (error) {
        console.error('Error fetching order info:', error)
        // 即使出錯也顯示基本資訊
        setOrderInfo({
          merchantTradeNo,
          tradeNo,
          paymentType,
          paymentDate
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrderInfo()
  }, [merchantTradeNo, tradeNo, paymentType, paymentDate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">正在處理您的訂單...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <CheckCircleIcon className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">付款成功！</h1>
            <p className="text-green-100">您的訂單已成功建立</p>
          </div>
          
          {/* Content */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">訂單資訊</h3>
                <div className="space-y-3">
                  {merchantTradeNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">訂單編號：</span>
                      <span className="font-medium text-gray-900">{merchantTradeNo}</span>
                    </div>
                  )}
                  {orderInfo?.id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">系統訂單號：</span>
                      <span className="font-medium text-gray-900">{orderInfo.id}</span>
                    </div>
                  )}
                  {tradeNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">交易編號：</span>
                      <span className="font-medium text-gray-900">{tradeNo}</span>
                    </div>
                  )}
                  {orderInfo?.total && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">訂單金額：</span>
                      <span className="font-medium text-gray-900">
                        ${orderInfo.total} {orderInfo.currency_code || 'TWD'}
                      </span>
                    </div>
                  )}
                  {paymentType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">付款方式：</span>
                      <span className="font-medium text-gray-900">{paymentType}</span>
                    </div>
                  )}
                  {orderInfo?.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">訂單狀態：</span>
                      <span className="font-medium text-gray-900">{orderInfo.status}</span>
                    </div>
                  )}
                  {orderInfo?.payment_status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">付款狀態：</span>
                      <span className="font-medium text-green-600">{orderInfo.payment_status}</span>
                    </div>
                  )}
                  {paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">付款時間：</span>
                      <span className="font-medium text-gray-900">{paymentDate}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">接下來的步驟</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>我們已發送訂單確認信到您的信箱</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>商品將在 1-3 個工作天內安排出貨</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>您可以隨時聯繫客服查詢訂單狀態</span>
                  </li>
                </ul>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/tw"
                  className="flex-1 bg-gray-900 text-white text-center py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  返回首頁
                </Link>
                <Link 
                  href="/tw/account/orders"
                  className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  查看訂單
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="mb-2">如有任何問題，請聯繫我們的客服團隊</p>
          <p>客服電話：(02) 1234-5678 | 客服信箱：support@example.com</p>
        </div>
      </div>
    </div>
  )
}
