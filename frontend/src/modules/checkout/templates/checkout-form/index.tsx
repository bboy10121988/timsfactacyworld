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
    
    // 檢查是否選擇了需要ECPay物流選擇的配送方式
    const selectedMethod = cart?.shipping_methods?.find(m => m.id === selectedShippingMethod) || 
                           shippingOptions?.find(opt => opt.id === selectedShippingMethod)
    
    // 只有超商取貨需要串接綠界物流選擇，宅配直接進入下一步
    const isEcpayLogistics = selectedMethod?.name?.includes('超商') || 
                            selectedShippingType === 'convenience_store'
    
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

    // 如果是ECPay物流，跳轉到綠界物流選擇頁面
    if (isEcpayLogistics && cart) {
      try {
        console.log('🚚 準備跳轉到綠界物流選擇頁面...')
        
        // 準備ECPay物流選擇所需參數
        const logisticsParams = {
          tempLogisticsID: "0", // 新建訂單
          goodsAmount: Math.round(cart.total || 0), // 商品金額
          goodsName: cart.items?.map(item => item.title).join(',').substring(0, 50) || "商品", // 商品名稱
          senderName: "雷特先生", // 寄件人姓名 - 可從環境變數或設定取得
          senderZipCode: "100", // 寄件人郵遞區號 - 可從環境變數或設定取得  
          senderAddress: "台北市中正區重慶南路一段122號", // 寄件人地址 - 可從環境變數或設定取得
          serverReplyURL: `${window.location.origin}/api/ecpay/logistics/callback`, // Server回調URL
          clientReplyURL: `${window.location.origin}/checkout/logistics-callback`, // Client回調URL
          remark: `訂單編號: ${cart.id}`,
          receiverName: customer?.first_name && customer?.last_name ? 
                       `${customer.first_name}${customer.last_name}` : "",
          receiverCellPhone: customer?.phone || "",
          temperature: "0001", // 常溫
          specification: "0001", // 60cm
          isCollection: "N", // 不代收貨款
          enableSelectDeliveryTime: "Y" // 允許選擇送達時間
        }

        // 呼叫前端代理API建立ECPay物流選擇頁面
        const response = await fetch('/api/ecpay/logistics-selection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logisticsParams)
        })

        if (!response.ok) {
          throw new Error(`API回應錯誤: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          // JSON回應 - 可能包含錯誤或成功訊息
          const result = await response.json()
          console.log('ECPay物流選擇API回應:', result)
          
          if (!result.success) {
            throw new Error(result.message || '建立物流選擇頁面失敗')
          }
          
          // 如果有回傳URL，則跳轉
          if (result.redirectUrl) {
            window.location.href = result.redirectUrl
            return
          }
        } else {
          // HTML回應 - 直接顯示ECPay跳轉頁面
          const htmlContent = await response.text()
          console.log('收到ECPay跳轉頁面，準備顯示...')
          
          // 在新視窗中開啟ECPay物流選擇頁面
          const newWindow = window.open('', '_blank', 'width=800,height=600')
          if (newWindow) {
            newWindow.document.write(htmlContent)
            newWindow.document.close()
          } else {
            // 如果無法開啟新視窗，則在當前頁面顯示
            document.write(htmlContent)
            document.close()
          }
          return
        }
        
      } catch (err: any) {
        console.error('跳轉到ECPay物流選擇頁面失敗:', err)
        setError(`跳轉到綠界物流選擇頁面失敗: ${err.message}`)
        return
      }
    }
    
    // 非ECPay物流或跳轉失敗，繼續原本流程
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
            
            // 檢查訂單狀態
            setTimeout(async () => {
              try {
                console.log('🔍 檢查購物車是否已轉換為訂單...')
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
                
                // 如果沒有找到訂單，顯示提示
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
            }, 3000) // 等待 3 秒讓 callback 處理完成
          }
        }, 1000) // 每秒檢查一次視窗狀態
        
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
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-gray-900">超商取貨</h4>
                <p className="text-sm text-gray-600">請使用物流選擇頁面來選擇取貨門市</p>
                <p className="text-sm text-gray-600">系統將引導您到 ECPay 物流選擇頁面完成門市選擇</p>
              </div>
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
