"use client"

import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import EnhancedShipping from "@modules/checkout/components/enhanced-shipping"
import StoreSelector from "@modules/checkout/components/store-selector"
import DeliveryAddressForm from "@modules/checkout/components/delivery-address-form"

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

  if (!cart) {
    return null
  }

  // 處理物流方式選擇（僅設定狀態，不自動進入下一步）
  const handleShippingMethodSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId)
    
    // 根據 methodId 決定 shipping type
    if (methodId.includes('convenience')) {
      setSelectedShippingType('convenience_store')
    } else if (methodId.includes('pickup')) {
      setSelectedShippingType('pickup')
    } else {
      setSelectedShippingType('home_delivery')
    }
  }

  // 確認物流選擇並進入下一步
  const handleConfirmShipping = () => {
    if (selectedShippingMethod) {
      setCurrentStep(2)
    }
  }

  // 處理資料填寫完成
  const handleDataComplete = () => {
    setCurrentStep(3) // 進入付款步驟
  }

  // 處理超商門市選擇
  const handleStoreSelect = (store: ConvenienceStore) => {
    setSelectedStore(store)
    // 選擇門市後自動進入下一步
    setTimeout(() => {
      handleDataComplete()
    }, 500) // 稍微延遲讓用戶看到選擇結果
  }

  // 處理地址表單提交
  const handleAddressSubmit = (formData: any) => {
    setAddressData(formData)
    handleDataComplete()
  }

  return (
    <div className="space-y-8">
      {/* 3-step progress */}
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
          <div className={`w-16 h-px ${currentStep >= 3 ? 'bg-blue-300' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>3</div>
            <span className={`${currentStep >= 3 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>選擇付款</span>
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
          
          {/* 確認選擇按鈕 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleConfirmShipping}
              disabled={!selectedShippingMethod}
              className="w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-white bg-gray-900 hover:bg-gray-800"
            >
              <span>確認選擇</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              <div className="space-y-4">
                <StoreSelector 
                  onStoreSelect={handleStoreSelect}
                  selectedStore={selectedStore}
                />
                {selectedStore && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ 已選擇取貨門市：{selectedStore.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      系統將自動進入下一步驟
                    </p>
                  </div>
                )}
              </div>
            )}
            {selectedShippingType === 'pickup' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">門市資訊</h4>
                  <p className="text-sm text-blue-800">台北旗艦店</p>
                  <p className="text-sm text-blue-700">台北市大安區忠孝東路四段1號</p>
                  <p className="text-sm text-blue-700">營業時間：週一至週日 10:00-22:00</p>
                  <p className="text-sm text-blue-700">聯絡電話：(02) 1234-5678</p>
                </div>
                <button 
                  onClick={handleDataComplete}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  確認門市資訊
                </button>
              </div>
            )}
            {selectedShippingType === 'home_delivery' && (
              <div className="space-y-4">
                <DeliveryAddressForm onAddressSubmit={handleAddressSubmit} />
                {addressData && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ 收件資訊已填寫完成
                    </p>
                    <div className="text-xs text-green-600 mt-2 space-y-1">
                      <p>收件人：{addressData.first_name}</p>
                      <p>地址：{addressData.city} {addressData.address_1}</p>
                      <p>電話：{addressData.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: 付款方式 */}
      {currentStep >= 3 && (
        <>
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-0">步驟 3：選擇付款方式</h3>
            </div>
            <Payment cart={cart} availablePaymentMethods={[]} />
          </div>

          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <Review cart={cart} />
          </div>
        </>
      )}
    </div>
  )
}
