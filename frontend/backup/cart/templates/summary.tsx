"use client"

import React from "react"
import { Button, Heading } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

// 檢查購物車是否準備好結帳的輔助函數
function getCheckoutReadiness(cart: HttpTypes.StoreCart) {
  const hasItems = cart?.items && cart.items.length > 0
  const hasValidItems = cart?.items?.every(item => 
    item.quantity > 0 && 
    item.variant_id && 
    (!item.variant?.inventory_quantity || item.variant.inventory_quantity > 0)
  )
  
  return {
    isReady: hasItems && hasValidItems,
    issues: [
      !hasItems && "購物車是空的",
      hasItems && !hasValidItems && "某些商品已售完或數量無效"
    ].filter(Boolean)
  }
}

// 獲取結帳步驟的中文描述
function getStepDescription(step: string) {
  switch (step) {
    case "address":
      return "填寫收件資訊"
    case "delivery":
      return "選擇運送方式"
    case "payment":
      return "選擇付款方式"
    default:
      return "前往結帳"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const router = useRouter()
  const params = useParams()
  const [isNavigating, setIsNavigating] = useState(false)
  
  const step = getCheckoutStep(cart)
  const { isReady, issues } = getCheckoutReadiness(cart)
  const stepDescription = getStepDescription(step)
  
  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 檢查購物車準備情況
    if (!isReady) {
      toast.error(issues[0] || "購物車尚未準備好結帳")
      return
    }
    
    setIsNavigating(true)
    
    try {
      // 預載入結帳頁面資源
      router.prefetch(`/${params.countryCode}/checkout?step=${step}`)
      
      // 顯示載入提示
      toast.loading("準備結帳頁面...", { id: "checkout-loading" })
      
      // 延遲一點讓用戶看到反饋
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 跳轉到結帳頁面
      router.push(`/${params.countryCode}/checkout?step=${step}`)
      
      // 清除載入提示
      toast.dismiss("checkout-loading")
      toast.success(`正在${stepDescription}`)
      
    } catch (error) {
      console.error("跳轉結帳頁失敗:", error)
      toast.error("跳轉失敗，請重試")
    } finally {
      setIsNavigating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Discount Code */}
      <DiscountCode cart={cart} />
      
      {/* Price Breakdown */}
      <div className="space-y-4">
        <CartTotals totals={cart} />
      </div>
      
      {/* Checkout Button */}
      <div className="space-y-3">
        <button
          onClick={handleCheckout}
          disabled={!isReady || isNavigating}
          data-testid="checkout-button"
          className={`
            w-full h-12 rounded-lg font-medium text-base transition-all duration-200
            ${isReady 
              ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isNavigating ? 'opacity-75 cursor-wait' : ''}
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            {isNavigating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>準備中...</span>
              </>
            ) : (
              <>
                <span>{isReady ? `前往結帳 - ${stepDescription}` : (issues[0] || "無法結帳")}</span>
                {isReady && (
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </>
            )}
          </div>
        </button>
        
        {/* 安全與快速提示 */}
        {isReady && (
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
              </svg>
              <span>安全結帳</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>快速結帳</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Summary
