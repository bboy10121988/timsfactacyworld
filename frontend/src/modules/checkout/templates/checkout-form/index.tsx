"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import EnhancedShipping from "@modules/checkout/components/enhanced-shipping"
import StoreSelector from "@modules/checkout/components/store-selector"
import DeliveryAddressForm from "@modules/checkout/components/delivery-address-form"
import { toast } from "react-hot-toast"
import LoadingSpinner from "@/components/ui/loading-spinner"

type ConvenienceStore = {
  id: string
  name: string
  address: string
  distance: number
  type: '7-11' | '全家' | 'OK' | '萊爾富'
}

export default function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const [selectedShippingType, setSelectedShippingType] = useState<'home_delivery' | 'convenience_store' | 'pickup' | null>(null)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedStore, setSelectedStore] = useState<ConvenienceStore | null>(null)
  const [addressData, setAddressData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 追蹤狀態變化
  useEffect(() => {
    console.log('addressData 變化:', addressData)
    console.log('selectedShippingType:', selectedShippingType)
  }, [addressData, selectedShippingType])

  if (!cart) {
    return null
  }

  const handleShippingMethodSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId)
    setError(null)
    
    if (methodId === "convenience_store") {
      setSelectedShippingType("convenience_store")
    } else if (methodId === "pickup") {
      setSelectedShippingType("pickup")
    } else if (methodId === "home_delivery") {
      setSelectedShippingType("home_delivery")
    } else {
      setSelectedShippingType(null)
    }
  }

  // 確認配送選擇並進入下一步
  const handleConfirmShipping = () => {
    if (!selectedShippingMethod) {
      setError("請選擇配送方式")
      return
    }

    setError(null)
    setCurrentStep(2)
  }

  // 處理超商門市選擇
  const handleStoreSelect = (store: ConvenienceStore) => {
    setSelectedStore(store)
    setAddressData({
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
      address_1: store.address,
      city: '超商取貨',
      postal_code: '',
      country_code: 'TW'
    })
  }

  // 處理地址表單提交
  const handleAddressSubmit = async (formData: any) => {
    console.log('收到地址資料:', formData)
    setAddressData(formData)
    console.log('設定後的 addressData:', formData)
    toast.success('收件資訊已確認，現在可以進行付款')
  }

  // 處理前往付款
  const handleProceedToPayment = async (e?: React.MouseEvent) => {
    // 阻止任何默認行為
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // 驗證必要資料
    if (!cart) {
      toast.error('購物車資訊不存在')
      return
    }
    
    // 驗證收件資料是否已確認
    if (selectedShippingType === 'home_delivery' && !addressData) {
      toast.error('請先確認收件資訊')
      return
    }
    
    if (selectedShippingType === 'convenience_store' && !selectedStore) {
      toast.error('請選擇取貨門市')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('開始處理付款流程...')
      
      const response = await fetch('/api/ecpay/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customer,
          shippingAddress: addressData,
          shippingMethod: selectedShippingMethod,
          selectedStore
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '建立付款資訊時發生錯誤')
      }

      const data = await response.json()
      console.log('收到付款表單資料:', data)
      
      if (!data.html) {
        throw new Error('未收到付款表單 HTML')
      }

      // 新開視窗寫入 ECPay 表單，避免 CSP 問題
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(data.html)
        win.document.close()
      } else {
        throw new Error('無法開啟新視窗，請檢查瀏覽器彈窗設定')
      }
      // 表單會自動 submit（後端已加 script），或你可在 html 裡加 <script> 自動 submit
      return
      
    } catch (error) {
      console.error('付款處理錯誤:', error)
      setError(error instanceof Error ? error.message : '建立付款資訊時發生錯誤')
      toast.error(error instanceof Error ? error.message : '建立付款資訊時發生錯誤')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 移除重複的 handlePayment 函數

  const handleShippingTypeChange = (type: string) => {
    switch (type) {
      case "pickup":
        setSelectedShippingType("pickup")
        break
      case "home_delivery":
        setSelectedShippingType("home_delivery")
        break
      default:
        setSelectedShippingType(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* 2-step progress */}
      <div className="bg-white p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>1</div>
            <span className={`${currentStep >= 1 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>選擇物流</span>
          </div>
          <div className={`w-16 h-px ${currentStep >= 2 ? 'bg-blue-300' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>2</div>
            <span className={`${currentStep >= 2 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {selectedShippingType === 'convenience_store' ? '選擇門市' : 
               selectedShippingType === 'pickup' ? '確認門市' : '填寫地址'}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: 選擇物流 */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-0">步驟 1：選擇物流方式</h3>
        </div>
        <div className="p-8">
          <EnhancedShipping 
            cart={cart} 
            selectedShippingMethod={selectedShippingMethod}
            onShippingMethodChange={handleShippingMethodSelect}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}
          
          {/* 確認選擇按鈕 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleConfirmShipping}
              disabled={!selectedShippingMethod}
              className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                selectedShippingMethod
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              確認選擇
              {selectedShippingMethod && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: 填寫資料 - 根據物流方式顯示不同內容 */}
      {selectedShippingType && currentStep >= 2 && (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-0">
              步驟 2：
              {selectedShippingType === 'convenience_store' && '選擇超商門市'}
              {selectedShippingType === 'pickup' && '確認取貨門市'}
              {selectedShippingType === 'home_delivery' && '填寫收件地址'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedShippingType === 'convenience_store' && '請選擇您要取貨的超商門市'}
              {selectedShippingType === 'pickup' && '請確認門市資訊與聯絡方式'}
              {selectedShippingType === 'home_delivery' && '請填寫完整的收件資訊'}
            </p>
          </div>
          <div className="p-8">
            {selectedShippingType === 'convenience_store' && (
              <StoreSelector 
                onStoreSelect={handleStoreSelect}
                selectedStore={selectedStore}
              />
            )}
            {selectedShippingType === 'pickup' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">門市資訊</h4>
                <p className="text-sm text-blue-800">台北旗艦店</p>
                <p className="text-sm text-blue-700">台北市大安區忠孝東路四段1號</p>
                <p className="text-sm text-blue-700">營業時間：週一至週日 10:00-22:00</p>
                <p className="text-sm text-blue-700">聯絡電話：(02) 1234-5678</p>
              </div>
            )}
            {selectedShippingType === 'home_delivery' && (
              <DeliveryAddressForm 
                onSubmit={handleAddressSubmit}
                isSubmitting={isSubmitting}
                initialData={addressData}
              />
            )}
            {/* 統一的付款按鈕，只渲染一次 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {error && (
                <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-sm text-rose-800">{error}</p>
                </div>
              )}
              <button 
                type="button"
                onClick={handleProceedToPayment}
                disabled={
                  isSubmitting || 
                  (selectedShippingType === 'home_delivery' && !addressData) ||
                  (selectedShippingType === 'convenience_store' && !selectedStore)
                }
                className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  !isSubmitting && 
                  ((selectedShippingType === 'home_delivery' && addressData) || 
                   (selectedShippingType === 'convenience_store' && selectedStore) ||
                   (selectedShippingType === 'pickup'))
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? <LoadingSpinner /> : '前往付款'}
                {!isSubmitting && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
