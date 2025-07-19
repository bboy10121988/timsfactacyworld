"use client"

import { RadioGroup } from "@headlessui/react"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { useState } from "react"

type ShippingOption = {
  id: string
  name: string
  description?: string
  amount: number
  metadata?: Record<string, any>
}

type EnhancedShippingProps = {
  cart: any
  shippingOptions: ShippingOption[]
  onShippingMethodChange?: (methodId: string, type?: string) => void
  selectedShippingMethod?: string
}

const EnhancedShipping: React.FC<EnhancedShippingProps> = ({
  cart,
  shippingOptions = [],
  onShippingMethodChange,
  selectedShippingMethod = ""
}) => {
  const [internalSelection, setInternalSelection] = useState<string>(selectedShippingMethod)

  const handleOptionChange = (optionId: string) => {
    setInternalSelection(optionId)
    const option = shippingOptions.find(opt => opt.id === optionId)
    // type 優先從 metadata.type，否則 fallback
    const type = option?.metadata?.type || option?.name || undefined
    onShippingMethodChange?.(optionId, type)
  }

  const getShippingIcon = (type: string) => {
    switch (type) {
      case "home_delivery":
        return <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">宅</div>
      case "convenience_store":
        return <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">超</div>
      case "pickup":
        return <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">取</div>
      default:
        return <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">宅</div>
    }
  }

  const formatPrice = (amount: number) => {
    return amount === 0 ? "免費" : `NT$${amount}`
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading level="h3" className="text-base font-medium mb-4">
          選擇配送方式
        </Heading>
        
        <RadioGroup 
          value={internalSelection} 
          onChange={handleOptionChange}
          className="space-y-3"
        >
          <div className="space-y-3">
            {shippingOptions.map((option) => {
              // type 優先從 metadata.type
              const type = option?.metadata?.type || option?.name || "home_delivery"
              return (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  className={({ active, checked }) =>
                    clx(
                      "relative flex cursor-pointer rounded-lg p-4 focus:outline-none",
                      {
                        "bg-blue-50 border-2 border-blue-500": checked,
                        "border border-gray-200 hover:border-blue-200": !checked,
                        "ring-2 ring-blue-200": active
                      }
                    )
                  }
                >
                  {({ checked }) => (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-gray-700">
                          {getShippingIcon(type)}
                        </div>
                        <div>
                          <Text className="font-medium text-gray-900">
                            {option.name}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {option.description}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Text className="font-medium text-gray-900">
                          {formatPrice(option.amount)}
                        </Text>
                        {checked && (
                          <CheckCircleSolid className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  )}
                </RadioGroup.Option>
              )
            })}
          </div>
        </RadioGroup>

        {/* 選擇提示 */}
        {internalSelection && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-sm text-blue-800">
              ✓ 已選擇配送方式，請點擊下方「確認選擇」按鈕繼續
            </Text>
          </div>
        )}

        {/* 配送說明 */}
        {(() => {
          const option = shippingOptions.find(opt => opt.id === internalSelection)
          const type = option?.metadata?.type || option?.name || "home_delivery"
          if (type === "home_delivery") {
            return (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>宅配說明：</strong>
                  <div className="mt-2 space-y-1">
                    <div>• 配送時間：週一至週五 09:00-18:00</div>
                    <div>• 請確保配送地址正確且有人收件</div>
                    <div>• 如無人收件將安排重新配送</div>
                  </div>
                </div>
              </div>
            )
          }
          if (type === "convenience_store") {
            return (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>超商取貨說明：</strong>
                  <div className="mt-2 space-y-1">
                    <div>• 配送時間：3-5個工作天到店</div>
                    <div>• 取貨期限：商品到店後7天內</div>
                    <div>• 請攜帶身分證件及取貨簡訊</div>
                  </div>
                </div>
              </div>
            )
          }
          if (type === "pickup") {
            return (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>門市自取說明：</strong>
                  <div className="mt-2 space-y-1">
                    <div>• 地址：台北市中正區館前路8號1樓</div>
                    <div>• 營業時間：週一至週日 10:00-22:00</div>
                    <div>• 商品備妥後會通知您前來取貨</div>
                  </div>
                </div>
              </div>
            )
          }
          return null
        })()}
      </div>
    </div>
  )
}

export default EnhancedShipping
