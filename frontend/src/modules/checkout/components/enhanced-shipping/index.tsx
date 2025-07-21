"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
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
    // type 優先從 metadata.type，否則根據名稱判斷
    let type = option?.metadata?.type
    if (!type && option) {
      const name = option.name.toLowerCase()
      if (name.includes('超商取貨') || name.includes('超商') || name.includes('便利商店') || name.includes('取貨') || name.includes('7-11') || name.includes('全家')) {
        type = "convenience_store"
      } else if (name.includes('自取') || name.includes('門市') || name.includes('pickup')) {
        type = "pickup"
      } else {
        type = "home_delivery"
      }
    }
    onShippingMethodChange?.(optionId, type)
  }

  const getShippingIcon = (type: string) => {
    const baseClasses = "w-5 h-5 rounded flex items-center justify-center text-xs font-bold bg-gray-900 text-white"
    const successClasses = "w-5 h-5 rounded flex items-center justify-center text-xs font-bold bg-green-600 text-white"
    
    switch (type) {
      case "home_delivery":
        return <div className={baseClasses}>宅</div>
      case "convenience_store":
        return <div className={baseClasses}>超</div>
      case "pickup":
        return <div className={successClasses}>取</div>
      default:
        return <div className={baseClasses}>宅</div>
    }
  }

  const formatPrice = (amount: number) => {
    return amount === 0 ? "免費" : `NT$${amount}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-sans h3-core text-base font-medium mb-4 text-gray-900">
          選擇配送方式
        </h3>
        
        <RadioGroup 
          value={internalSelection} 
          onChange={handleOptionChange}
          className="space-y-3"
        >
          <div className="space-y-3">
            {shippingOptions.map((option) => {
              // type 優先從 metadata.type，否則根據名稱判斷
              let type = option?.metadata?.type
              if (!type) {
                // 根據名稱判斷配送類型
                const name = option.name.toLowerCase()
                if (name.includes('超商取貨') || name.includes('超商') || name.includes('便利商店') || name.includes('取貨') || name.includes('7-11') || name.includes('全家')) {
                  type = "convenience_store"
                } else if (name.includes('自取') || name.includes('門市') || name.includes('pickup')) {
                  type = "pickup"
                } else {
                  type = "home_delivery"
                }
              }
              return (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                                    className={({ active, checked }) => clx(
                    "relative flex cursor-pointer rounded-lg p-4 focus:outline-none border-2 transition-all",
                    {
                      "border-gray-900 bg-gray-50": checked,
                      "border-gray-200 hover:border-gray-400 bg-white": !checked,
                      "ring-2 ring-gray-300 ring-opacity-50": active,
                    }
                  )}
                >
                  {({ checked }) => (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-gray-600">
                          {getShippingIcon(type)}
                        </div>
                        <div>
                          <p className="font-sans txt-medium font-medium text-gray-900">
                            {option.name}
                          </p>
                          <p className="font-normal font-sans txt-medium text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-sans txt-medium font-medium text-gray-900">
                          {formatPrice(option.amount)}
                        </p>
                        {checked && (
                          <CheckCircleSolid className="h-5 w-5 text-gray-900" />
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
          <div className="mt-4 p-3 rounded-lg border border-gray-900 bg-gray-50">
            <p className="font-normal font-sans txt-medium text-sm text-gray-900">
              ✓ 已選擇配送方式，請點擊下方「確認選擇」按鈕繼續
            </p>
          </div>
        )}

        {/* 配送說明 */}
        {(() => {
          const option = shippingOptions.find(opt => opt.id === internalSelection)
          let type = option?.metadata?.type
          if (!type && option) {
            // 根據名稱判斷配送類型
            const name = option.name.toLowerCase()
            if (name.includes('7-11') || name.includes('全家') || name.includes('超商') || name.includes('便利商店')) {
              type = "convenience_store"
            } else if (name.includes('自取') || name.includes('門市') || name.includes('pickup')) {
              type = "pickup"
            } else {
              type = "home_delivery"
            }
          }
          if (type === "home_delivery") {
            return (
              <div 
                className="mt-4 p-4 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>宅配說明：</strong>
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
              <div 
                className="mt-4 p-4 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>超商取貨說明：</strong>
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
              <div 
                className="mt-4 p-4 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>門市自取說明：</strong>
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
