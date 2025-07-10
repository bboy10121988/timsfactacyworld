"use client"

import { RadioGroup } from "@headlessui/react"
import { useState, useEffect } from "react"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import StoreSelector from "../store-selector"

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
  
  // 檢查是否選擇了超商配送
  const isConvenienceStoreDelivery = cart?.shipping_methods?.some(
    (method: any) => method.shipping_option?.name?.includes("超商") || 
                     method.shipping_option?.name?.includes("便利商店")
  )

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
    <div className="space-y-6">
      <div>
        <Heading level="h3" className="text-base font-medium mb-4">
          選擇付款方式
        </Heading>
        
        <RadioGroup 
          value={selectedPaymentMethod} 
          onChange={onPaymentMethodChange}
          className="space-y-3"
        >
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
        </RadioGroup>
      </div>

      {/* 如果選擇超商付款且是超商配送，顯示門市選擇 */}
      {selectedPaymentMethod === "ecpay_store_payment" && isConvenienceStoreDelivery && (
        <div>
          <Text className="text-sm font-medium mb-3 text-gray-700">
            取貨付款門市
          </Text>
          <StoreSelector 
            onStoreSelect={setSelectedStore}
            selectedStore={selectedStore}
          />
        </div>
      )}

      {/* 信用卡付款說明 */}
      {selectedPaymentMethod === "ecpay_credit_card" && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text className="text-sm text-blue-800">
            <strong>付款流程：</strong><br />
            1. 點擊「確認訂單」後，將跳轉至綠界安全付款頁面<br />
            2. 輸入信用卡資訊完成付款<br />
            3. 付款成功後返回訂單確認頁面
          </Text>
        </div>
      )}

      {/* 超商付款說明 */}
      {selectedPaymentMethod === "ecpay_store_payment" && (
        <div className="bg-green-50 p-4 rounded-lg">
          <Text className="text-sm text-green-800">
            <strong>取貨付款流程：</strong><br />
            1. 訂單成立後，我們會將商品送至您選擇的門市<br />
            2. 商品到店後，您會收到取貨通知<br />
            3. 請在指定時間內攜帶證件到門市取貨並付款<br />
            4. 付款方式：現金
          </Text>
        </div>
      )}
    </div>
  )
}

export default EcpayPayment
