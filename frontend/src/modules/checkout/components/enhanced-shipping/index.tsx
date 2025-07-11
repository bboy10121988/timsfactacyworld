"use client"

import { RadioGroup } from "@headlessui/react"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import { CheckCircleSolid, TruckFast } from "@medusajs/icons"
import { ReactNode } from "react"

type ShippingOption = {
  id: string
  name: string
  description: string
  price: number
  type: 'home_delivery' | 'convenience_store'
}

type EnhancedShippingProps = {
  cart: any
  onShippingMethodChange?: (methodId: string) => void
  selectedShippingMethod?: string
}

const EnhancedShipping = ({
  cart,
  onShippingMethodChange,
  selectedShippingMethod = ""
}: EnhancedShippingProps): ReactNode => {

  // 模擬配送選項 - 實際會從 Medusa API 取得
  const shippingOptions: ShippingOption[] = [
    {
      id: "home_delivery",
      name: "宅配到府",
      description: "1-3個工作天送達",
      price: 100,
      type: "home_delivery"
    },
    {
      id: "convenience_store_pickup",
      name: "超商取貨",
      description: "3-5個工作天到店，7天內取貨",
      price: 60,
      type: "convenience_store"
    }
  ]

  const getShippingIcon = (type: string) => {
    switch (type) {
      case "home_delivery":
        return <TruckFast className="w-5 h-5" />
      case "convenience_store":
        return <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">超</div>
      default:
        return <TruckFast className="w-5 h-5" />
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "免費" : `NT$${price}`
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading level="h3" className="text-base font-medium mb-4">
          選擇配送方式
        </Heading>
        
        <RadioGroup 
          value={selectedShippingMethod} 
          onChange={onShippingMethodChange}
          className="space-y-3"
        >
          {shippingOptions.map((option) => (
            <RadioGroup.Option
              key={option.id}
              value={option.id}
              className={({ checked }) =>
                clx(
                  "relative flex cursor-pointer rounded-lg p-4 focus:outline-none transition-all",
                  {
                    "bg-blue-50 border-2 border-blue-500 shadow-md": checked,
                    "border border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm": !checked,
                  }
                )
              }
            >
              {({ checked }) => (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center text-gray-700">
                      {getShippingIcon(option.type)}
                    </div>
                    <div>
                      <Text className="font-medium text-gray-900">
                        {option.name}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text className="font-medium text-gray-900">
                      {formatPrice(option.price)}
                    </Text>
                    {checked && (
                      <CheckCircleSolid className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>

        {/* 選擇提示 */}
        {selectedShippingMethod && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-sm text-blue-800">
              ✓ 已選擇配送方式，請點擊下方「確認選擇」按鈕繼續
            </Text>
          </div>
        )}
      </div>

      {/* 宅配地址提醒 */}
      {selectedShippingMethod === "home_delivery" && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text className="text-sm text-blue-800">
            <strong>宅配說明：</strong><br />
            • 配送時間：週一至週五 09:00-18:00<br />
            • 請確保配送地址正確且有人收件<br />
            • 如無人收件將安排重新配送
          </Text>
        </div>
      )}

      {/* 超商取貨說明 */}
      {selectedShippingMethod === "convenience_store_pickup" && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text className="text-sm text-blue-800">
            <strong>超商取貨說明：</strong><br />
            • 配送時間：3-5個工作天到店<br />
            • 取貨期限：商品到店後7天內<br />
            • 請攜帶身分證件及取貨簡訊
          </Text>
        </div>
      )}
    </div>
  )
}

export default EnhancedShipping
