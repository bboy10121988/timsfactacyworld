"use client"

import { RadioGroup } from "@headlessui/react"
import { useState } from "react"
import { Heading, Text, clx } from "@medusajs/ui"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"

type ConvenienceStore = {
  id: string
  name: string
  address: string
  distance: number
  type: '7-11' | '全家' | 'OK' | '萊爾富'
}

type EcpayPaymentProps = {
  cart: any
  onPaymentMethodChange: (method: string) => void
  selectedPaymentMethod: string
}

const EcpayPayment: React.FC<EcpayPaymentProps> = ({
  cart,
  onPaymentMethodChange,
  selectedPaymentMethod
}) => {
  const [selectedStore, setSelectedStore] = useState<ConvenienceStore | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // 檢查是否選擇了超商配送
  const isConvenienceStoreDelivery = cart?.shipping_methods?.some(
    (method: any) => method.shipping_option?.name?.includes("超商") || 
                     method.shipping_option?.name?.includes("便利商店")
  )

  // 處理支付方式變更
  const handlePaymentMethodChange = (method: string) => {
    setError(null)
    
    try {
      // 驗證選擇
      if (method === 'ecpay_store_payment' && !isConvenienceStoreDelivery) {
        throw new Error('超商取貨付款僅適用於超商取貨')
      }
      
      onPaymentMethodChange(method)
    } catch (err: any) {
      setError(err.message)
      console.error('支付方式變更錯誤:', err)
    }
  }

  const paymentOptions = [
    {
      id: "ecpay_credit_card",
      name: "線上刷卡",
      description: "信用卡 / 金融卡 (VISA、Mastercard、JCB)",
      icon: <CreditCard className="w-5 h-5" />,
      available: true
    },
    {
      id: "ecpay_atm",
      name: "ATM 轉帳",
      description: "虛擬帳號轉帳 (3天內完成轉帳)",
      icon: <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">ATM</div>,
      available: true
    },
    {
      id: "ecpay_barcode",
      name: "超商代碼繳費",
      description: "7-11、全家、萊爾富、OK超商 (3天內繳費)",
      icon: <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">超</div>,
      available: true
    },
    {
      id: "ecpay_linepay",
      name: "LINE Pay",
      description: "使用 LINE Pay 付款",
      icon: <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">L</div>,
      available: true
    },
    {
      id: "ecpay_jkopay",
      name: "街口支付",
      description: "使用街口支付付款",
      icon: <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">街</div>,
      available: true
    },
    {
      id: "ecpay_store_payment", 
      name: "超商付款",
      description: "到超商取貨時付款 (僅限超商取貨)",
      icon: <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">付</div>,
      available: isConvenienceStoreDelivery
    }
  ]

  return (
    <div className="mb-6">
      <Heading level="h3" className="text-base font-medium mb-4">
        綠界支付
      </Heading>
      <div className="grid grid-cols-1 gap-3">
        <RadioGroup 
          value={selectedPaymentMethod} 
          onChange={handlePaymentMethodChange}
        >
          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <RadioGroup.Option
                key={option.id}
                value={option.id}
                disabled={!option.available}
                className={({ checked, disabled }) => 
                  clx(
                    "relative flex cursor-pointer rounded-lg p-4 focus:outline-none",
                    {
                      "bg-blue-50 border-2 border-blue-500": checked && !disabled,
                      "border border-gray-300 bg-white": !checked && !disabled,
                      "border border-gray-200 bg-gray-50 cursor-not-allowed opacity-50": disabled,
                    }
                  )
                }
              >
                {({ checked, disabled }) => (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={clx(
                        "flex items-center justify-center",
                        disabled ? "text-gray-400" : "text-gray-700"
                      )}>
                        {option.icon}
                      </div>
                      <div>
                        <Text className={clx(
                          "font-medium",
                          disabled ? "text-gray-400" : "text-gray-900"
                        )}>
                          {option.name}
                        </Text>
                        <Text className={clx(
                          "text-sm mt-1",
                          disabled ? "text-gray-400" : "text-gray-600"
                        )}>
                          {option.description}
                        </Text>
                        {!option.available && option.id === "ecpay_store_payment" && (
                          <Text className="text-xs text-orange-600 mt-1">
                            ※ 請先選擇超商取貨配送方式
                          </Text>
                        )}
                      </div>
                    </div>
                    {checked && !disabled && (
                      <CheckCircleSolid className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* 如果選擇超商付款且是超商配送，顯示門市選擇 */}
      {selectedPaymentMethod === "ecpay_store_payment" && isConvenienceStoreDelivery && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Text className="text-sm mb-2">請確認您選擇的便利商店與收件門市相同</Text>
        </div>
      )}
      
      {/* 信用卡說明 */}
      {selectedPaymentMethod === "ecpay_credit_card" && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Text className="text-sm mb-2">信用卡付款說明：</Text>
          <Text className="text-xs text-gray-600">
            訂單成立後，系統將帶您前往綠界支付頁面完成付款程序。
          </Text>
        </div>
      )}
      
      {/* 超商付款說明 */}
      {selectedPaymentMethod === "ecpay_store_payment" && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Text className="text-sm mb-2">超商付款說明：</Text>
          <Text className="text-xs text-gray-600">
            訂單成立後，系統將產生付款代碼，請於繳費期限內至超商繳款。
            超商付款需支付額外手續費。
          </Text>
        </div>
      )}
    </div>
  )
}

export default EcpayPayment
