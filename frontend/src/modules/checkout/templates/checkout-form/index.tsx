"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import EnhancedShipping from "@modules/checkout/components/enhanced-shipping"
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
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)
  const [addressData, setAddressData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // fetch shipping options on mount or when cart.id changes
  useEffect(() => {
    async function fetchOptions() {
      if (cart && cart.id) {
        try {
          const result = await listCartOptions()
          const originalOptions = result?.shipping_options || []
          
          // 如果資料庫沒有運輸選項，提供一個預設選項
          if (originalOptions.length === 0) {
            const defaultOption = {
              id: 'default_shipping',
              name: '預設配送',
              description: '宅配到府服務',
              amount: 80, // 從資料庫獲取的實際運費
              metadata: { type: 'home_delivery' }
            }
            setShippingOptions([defaultOption])
          } else {
            // 直接使用資料庫中的運輸選項
            const processedOptions = processShippingOptions(originalOptions)
            setShippingOptions(processedOptions)
          }
        } catch (error) {
          console.error('載入運輸選項失敗:', error)
          // 提供備用的預設選項
          const defaultOption = {
            id: 'default_shipping',
            name: '預設配送',
            description: '宅配到府服務',
            amount: 80, // 從資料庫獲取的實際運費
            metadata: { type: 'home_delivery' }
          }
          setShippingOptions([defaultOption])
        }
      }
    }
    fetchOptions()
  }, [cart?.id])

  // 處理配送選項：直接使用資料庫中的運輸選項
  const processShippingOptions = (options: any[]) => {
    // 直接返回資料庫中的運輸選項，不進行任何處理
    return options || []
  }

  // 追蹤狀態變化
  useEffect(() => {
    console.log('addressData 變化:', addressData)
  }, [addressData])

  if (!cart) {
    return null
  }

  // handleShippingMethodSelect 簡化邏輯
  const handleShippingMethodSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId)
    setError(null)
  }

  // 處理地址提交
  const handleAddressSubmit = (data: any) => {
    setAddressData(data)
  }

  // handleConfirmShipping 簡化邏輯
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
    
    // 直接進入下一步，不需要複雜的ECPay判斷
    setCurrentStep(2)
  }

  // 處理前往付款
  const handleProceedToPayment = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // 驗證必要資料
    if (!cart) {
      toast.error('購物車資訊不存在')
      return
    }
    
    // 驗證收件資料是否已確認 - 只有宅配一種方式
    if (!addressData) {
      toast.error('請先確認收件資訊')
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
          shippingMethod: selectedShippingMethod
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '建立付款資訊時發生錯誤')
      }

      const data = await response.json()
      console.log('收到付款表單資料:', data)
      
      if (data.error) {
        console.error('付款 API 錯誤:', data.error)
        throw new Error(data.error)
      }
      
      if (!data.html) {
        console.error('未收到付款表單 HTML，後端回傳:', data)
        throw new Error('未收到付款表單 HTML - 請檢查後端服務')
      }
      
      console.log('✅ 付款表單 HTML 驗證通過，長度:', data.html.length)

      // 新開視窗寫入 ECPay 表單
      const win = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
      if (win) {
        console.log('準備寫入 ECPay 表單到新視窗...')
        win.document.write(data.html)
        win.document.close()
        console.log('已寫入表單並關閉 document')
        
        // 監聽付款視窗關閉，檢查付款狀態
        const checkPaymentStatus = setInterval(() => {
          if (win.closed) {
            console.log('💳 付款視窗已關閉，檢查付款狀態...')
            clearInterval(checkPaymentStatus)
            
            setTimeout(async () => {
              try {
                const statusResponse = await fetch(`/store/carts/order-by-trade-no/${cart.metadata?.ecpay_trade_no || cart.id}`, {
                  headers: {
                    'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
                  }
                })
                
                if (statusResponse.ok) {
                  const orderData = await statusResponse.json()
                  if (orderData.order && orderData.order.id) {
                    console.log('✅ 訂單創建成功，跳轉到訂單完成頁面')
                    toast.success('付款成功！正在跳轉到訂單詳情頁面...')
                    setTimeout(() => {
                      window.location.href = `/order/confirmed/${orderData.order.id}`
                    }, 2000)
                    return
                  }
                }
                
                console.log('⚠️ 暫未找到對應訂單，可能還在處理中')
                toast('付款處理中，請稍後查看訂單狀態', { 
                  duration: 5000,
                  icon: '⏳' 
                })
                
              } catch (error) {
                console.error('❌ 檢查付款狀態時發生錯誤:', error)
                toast('付款狀態檢查失敗，請稍後查看訂單狀態', { 
                  duration: 5000,
                  icon: '⚠️' 
                })
              }
            }, 3000)
          }
        }, 1000)
        
      } else {
        console.error('無法開啟新視窗，請檢查瀏覽器彈窗設定')
        throw new Error('無法開啟新視窗，請檢查瀏覽器彈窗設定')
      }
      return
      
    } catch (error) {
      console.error('付款處理錯誤:', error)
      setError(error instanceof Error ? error.message : '建立付款資訊時發生錯誤')
      toast.error(error instanceof Error ? error.message : '建立付款資訊時發生錯誤')
    } finally {
      setIsSubmitting(false)
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
              填寫地址
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

      {/* Step 2: 填寫收件地址 */}
      {currentStep >= 2 && (
        <div className="border border-gray-200 bg-white shadow-sm overflow-hidden rounded-lg">
          <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-0 text-gray-900">
              步驟 2：填寫收件地址
            </h3>
            <p className="text-sm mt-1 text-gray-600">
              請填寫完整的收件資訊
            </p>
          </div>
          <div className="p-8">
            <DeliveryAddressForm 
              onSubmit={handleAddressSubmit}
              isSubmitting={isSubmitting}
              initialData={addressData}
            />
            
            {/* 付款按鈕 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {error && (
                <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <Button 
                type="button"
                onClick={handleProceedToPayment}
                disabled={isSubmitting || !addressData}
                className="w-full"
                size="large"
                variant={(!isSubmitting && addressData) ? "primary" : "secondary"}
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
    </div>
  )
}
