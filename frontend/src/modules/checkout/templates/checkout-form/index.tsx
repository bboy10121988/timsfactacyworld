"use client"

import { listCartShippingMethods } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import EnhancedShipping from "@modules/checkout/components/enhanced-shipping"
import DeliveryAddressForm from "@modules/checkout/components/delivery-address-form"

export default function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const [selectedShippingType, setSelectedShippingType] = useState<'home_delivery' | 'convenience_store' | null>(null)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)
  const [addressData, setAddressData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 載入儲存的收件資訊
  useEffect(() => {
    const storedData = localStorage.getItem("delivery_address_data")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setAddressData(parsedData)
      } catch (e) {
        console.error('無法解析儲存的收件資訊:', e)
      }
    }
  }, [])

  if (!cart) {
    return null
  }

  // 處理物流方式選擇
  const handleShippingMethodSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId)
    setSelectedShippingType(methodId.includes('convenience') ? 'convenience_store' : 'home_delivery')
  }

  // 確認物流選擇並進入下一步
  const handleConfirmShipping = () => {
    if (selectedShippingMethod) {
      setCurrentStep(2)
    }
  }

  // 處理資料提交
  const handleSubmit = async (data: any) => {
    setAddressData(data)
    setIsSubmitting(true)
    
    try {
      // TODO: 實作前往付款邏輯
      console.log('前往付款', {
        cart,
        shippingMethod: selectedShippingMethod,
        addressData: data
      })
    } catch (error) {
      console.error('前往付款失敗:', error)
    } finally {
      setIsSubmitting(false)
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
              填寫資料
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: 選擇物流 */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <EnhancedShipping
            cart={cart}
            selectedShippingMethod={selectedShippingMethod}
            onShippingMethodChange={handleShippingMethodSelect}
          />
          <div className="mt-6">
            <Button
              className="w-full"
              disabled={!selectedShippingMethod}
              onClick={handleConfirmShipping}
            >
              下一步
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: 填寫資料 */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <DeliveryAddressForm 
            onSubmit={handleSubmit}
            initialData={addressData}
          />
          
          {/* 收件資訊確認區塊 */}
          {addressData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">收件資訊確認</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-500 w-24">收件人：</span>
                  <span className="text-gray-900">{addressData.first_name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">聯絡電話：</span>
                  <span className="text-gray-900">{addressData.phone}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">收件地址：</span>
                  <span className="text-gray-900">
                    {addressData.city} {addressData.postal_code}
                    <br />
                    {addressData.address_1}
                    {addressData.address_2 && <span> {addressData.address_2}</span>}
                  </span>
                </div>
              </div>

              {/* 訂單資訊確認區塊 */}
              {cart && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">訂單資訊確認</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">商品小計</span>
                      <span className="text-gray-900">NT$ {cart.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">運費</span>
                      <span className="text-gray-900">NT$ {cart.shipping_total}</span>
                    </div>
                    {cart.discount_total > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>折扣金額</span>
                        <span>- NT$ {cart.discount_total}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-4 border-t border-gray-200">
                      <span className="text-gray-900">應付金額</span>
                      <span className="text-gray-900">NT$ {cart.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button
              className="w-full"
              disabled={isSubmitting}
              onClick={() => addressData && handleSubmit(addressData)}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  處理中...
                </>
              ) : (
                '前往付款'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
