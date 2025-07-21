"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import EnhancedShipping from "@modules/checkout/components/enhanced-shipping"
import EcpayStoreMap from "@modules/checkout/components/ecpay-store-map"
import DeliveryAddressForm from "@modules/checkout/components/delivery-address-form"
import { toast } from "react-hot-toast"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { setShippingMethod, retrieveCart } from "@lib/data/cart"
import { listCartOptions } from "@lib/data/cart"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"

type ConvenienceStore = {
  id: string
  name: string
  address: string
  distance: number
  type: '7-11' | '全家' | 'OK' | '萊爾富'
}

export default function CheckoutForm({
  cart: initialCart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(initialCart)
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingType, setSelectedShippingType] = useState<'home_delivery' | 'convenience_store' | 'pickup' | null>(null)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedStore, setSelectedStore] = useState<ConvenienceStore | null>(null)
  const [addressData, setAddressData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // fetch shipping options on mount or when cart.id changes
  useEffect(() => {
    async function fetchOptions() {
      if (cart && cart.id) {
        const result = await listCartOptions()
        const originalOptions = result?.shipping_options || []
        
        // 過濾和合併超商取貨選項
        const processedOptions = processShippingOptions(originalOptions)
        setShippingOptions(processedOptions)
      }
    }
    fetchOptions()
  }, [cart?.id])

  // 處理配送選項：將 7-11 和全家合併為「超商取貨」
  const processShippingOptions = (options: any[]) => {
    const convenienceStoreOptions = options.filter(option => {
      const name = option.name.toLowerCase()
      return name.includes('7-11') || name.includes('全家') || name.includes('超商') || name.includes('便利商店')
    })
    
    const otherOptions = options.filter(option => {
      const name = option.name.toLowerCase()
      return !name.includes('7-11') && !name.includes('全家') && !name.includes('超商') && !name.includes('便利商店')
    })

    // 如果有超商選項，創建一個合併的超商取貨選項
    const processedOptions = [...otherOptions]
    
    if (convenienceStoreOptions.length > 0) {
      // 使用第一個超商選項作為基礎，但修改名稱和描述
      const mergedOption = {
        ...convenienceStoreOptions[0],
        name: '超商取貨',
        description: '7-11、全家、萊爾富等便利商店取貨',
        metadata: {
          ...convenienceStoreOptions[0].metadata,
          type: 'convenience_store',
          originalOptions: convenienceStoreOptions
        }
      }
      processedOptions.push(mergedOption)
    }

    return processedOptions
  }

  // 追蹤狀態變化
  useEffect(() => {
    console.log('addressData 變化:', addressData)
    console.log('selectedShippingType:', selectedShippingType)
  }, [addressData, selectedShippingType])

  if (!cart) {
    return null
  }

  // handleShippingMethodSelect now stores Medusa option.id
  const handleShippingMethodSelect = (methodId: string, type?: string) => {
    setSelectedShippingMethod(methodId)
    setError(null)
    let finalType: 'home_delivery' | 'convenience_store' | 'pickup' = 'home_delivery'
    if (type === 'home_delivery' || type === 'convenience_store' || type === 'pickup') {
      finalType = type
    } else {
      const option = shippingOptions.find(opt => opt.id === methodId)
      if (option?.id?.includes('store')) finalType = 'convenience_store'
      else if (option?.id?.includes('pickup')) finalType = 'pickup'
      else if (option?.id?.includes('home')) finalType = 'home_delivery'
      else if (option?.name?.includes('超商')) finalType = 'convenience_store'
      else if (option?.name?.includes('自取')) finalType = 'pickup'
      else if (option?.name?.includes('宅配')) finalType = 'home_delivery'
      else {
        console.warn('無法判斷 shipping type，預設 home_delivery', option)
      }
    }
    setSelectedShippingType(finalType)
    console.log('handleShippingMethodSelect: selectedShippingType =', finalType)
  }

  // handleConfirmShipping 用正確的 option.id
  const handleConfirmShipping = async () => {
    if (!selectedShippingMethod) {
      setError("請選擇配送方式")
      return
    }
    setError(null)
    if (cart && cart.id) {
      try {
        await setShippingMethod({ cartId: cart.id, shippingMethodId: selectedShippingMethod })
        const updatedCart = await retrieveCart(cart.id)
        setCart(updatedCart)
      } catch (err) {
        setError("設定運送方式失敗，請重試")
        return
      }
    }
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
    // 新增：patch shipping_address 和 email 到 Medusa cart
    if (cart && cart.id) {
      try {
        await fetch(`/store/carts/${cart.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customer?.email,
            shipping_address: formData
          })
        })
      } catch (err) {
        toast.error('同步收件資訊到 Medusa 失敗，但不影響付款流程')
      }
    }
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
      
      // 檢查是否有錯誤
      if (data.error) {
        console.error('付款 API 錯誤:', data.error)
        throw new Error(data.error)
      }
      
      if (!data.html) {
        console.error('未收到付款表單 HTML，後端回傳:', data)
        
        // 如果有詳細錯誤信息，顯示它
        if (data.details || data.timestamp) {
          console.error('錯誤詳情:', {
            details: data.details,
            timestamp: data.timestamp
          })
        }
        
        throw new Error('未收到付款表單 HTML - 請檢查後端服務')
      }
      
      console.log('✅ 付款表單 HTML 驗證通過，長度:', data.html.length)

      // 新開視窗寫入 ECPay 表單，避免 CSP 問題
      const win = window.open('', '_blank')
      if (win) {
        console.log('準備寫入 ECPay 表單到新視窗...')
        win.document.write(data.html)
        win.document.close()
        console.log('已寫入表單並關閉 document')
      } else {
        console.error('無法開啟新視窗，請檢查瀏覽器彈窗設定')
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
      <div className="p-6 border border-gray-200 bg-white shadow-sm rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              currentStep >= 1 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>1</div>
            <span className={`${currentStep >= 1 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              選擇物流
            </span>
          </div>
          <div className={`w-16 h-px ${
            currentStep >= 2 ? 'bg-gray-400' : 'bg-gray-200'
          }`}></div>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              currentStep >= 2 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>2</div>
            <span className={`${currentStep >= 2 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {selectedShippingType === 'convenience_store' ? '選擇門市' : 
               selectedShippingType === 'pickup' ? '確認門市' : '填寫地址'}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: 選擇物流 */}
      <div className="border border-gray-200 bg-white shadow-sm overflow-hidden rounded-lg">
        <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold mb-0 text-gray-900">步驟 1：選擇物流方式</h3>
        </div>
        <div className="p-8">
          <EnhancedShipping 
            cart={cart} 
            shippingOptions={shippingOptions}
            selectedShippingMethod={selectedShippingMethod}
            onShippingMethodChange={handleShippingMethodSelect}
          />
          
          {error && (
            <div className="mt-4 p-4 rounded-lg border border-red-300 bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* 確認選擇按鈕 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={handleConfirmShipping}
              disabled={!selectedShippingMethod}
              className="w-full"
              size="large"
            >
              確認選擇
              {selectedShippingMethod && (
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Step 2: 填寫資料 - 根據物流方式顯示不同內容 */}
      {selectedShippingType && currentStep >= 2 && (
        <div className="border border-gray-200 bg-white shadow-sm overflow-hidden rounded-lg">
          <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-0 text-gray-900">
              步驟 2：
              {selectedShippingType === 'convenience_store' && '選擇超商門市'}
              {selectedShippingType === 'pickup' && '確認取貨門市'}
              {selectedShippingType === 'home_delivery' && '填寫收件地址'}
            </h3>
            <p className="text-sm mt-1 text-gray-600">
              {selectedShippingType === 'convenience_store' && '請選擇您要取貨的超商門市'}
              {selectedShippingType === 'pickup' && '請確認門市資訊與聯絡方式'}
              {selectedShippingType === 'home_delivery' && '請填寫完整的收件資訊'}
            </p>
          </div>
          <div className="p-8">
            {selectedShippingType === 'convenience_store' && (
              <EcpayStoreMap 
                cart={cart}
                onStoreSelected={(storeInfo) => {
                  console.log('選擇的門市:', storeInfo)
                  // 處理門市選擇完成
                }}
              />
            )}
            {selectedShippingType === 'pickup' && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-gray-900">門市資訊</h4>
                <p className="text-sm text-gray-900">台北旗艦店</p>
                <p className="text-sm text-gray-600">台北市大安區忠孝東路四段1號</p>
                <p className="text-sm text-gray-600">營業時間：週一至週日 10:00-22:00</p>
                <p className="text-sm text-gray-600">聯絡電話：(02) 1234-5678</p>
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
                <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <Button 
                type="button"
                onClick={handleProceedToPayment}
                disabled={
                  isSubmitting || 
                  (selectedShippingType === 'home_delivery' && !addressData) ||
                  (selectedShippingType === 'convenience_store' && !selectedStore)
                }
                className="w-full"
                size="large"
                variant={
                  (!isSubmitting && 
                  ((selectedShippingType === 'home_delivery' && addressData) || 
                   (selectedShippingType === 'convenience_store' && selectedStore) ||
                   (selectedShippingType === 'pickup'))) ? "primary" : "secondary"
                }
              >
                {isSubmitting ? <LoadingSpinner /> : '前往付款'}
                {!isSubmitting && (
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 不再渲染 CheckoutSummary，右欄會自動顯示最新 cart */}
    </div>
  )
}
