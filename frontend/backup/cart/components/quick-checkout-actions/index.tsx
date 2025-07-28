"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { HttpTypes } from "@medusajs/types"

type QuickCheckoutActionsProps = {
  cart: HttpTypes.StoreCart
}

const QuickCheckoutActions = ({ cart }: QuickCheckoutActionsProps) => {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  const hasItems = !!cart?.items && cart.items.length > 0
  const hasAddress = !!cart?.shipping_address?.address_1 && !!cart.email
  const hasShipping = !!cart?.shipping_methods && cart.shipping_methods.length > 0

  const handleQuickAction = async (action: string) => {
    if (!hasItems) {
      toast.error("購物車是空的")
      return
    }

    setIsLoading(true)
    
    try {
      let targetStep = "address"
      let message = ""

      switch (action) {
        case "express":
          // 快速結帳 - 跳到最後可能的步驟
          if (hasAddress && hasShipping) {
            targetStep = "payment"
            message = "快速前往付款"
          } else if (hasAddress) {
            targetStep = "delivery"
            message = "快速選擇運送方式"
          } else {
            targetStep = "address"
            message = "快速填寫地址"
          }
          break
          
        case "guest":
          // 訪客結帳
          targetStep = "address"
          message = "以訪客身份結帳"
          break
          
        case "saved":
          // 使用儲存的地址
          if (hasAddress) {
            targetStep = "delivery"
            message = "使用已儲存地址"
          } else {
            targetStep = "address"
            message = "請先填寫地址"
          }
          break
      }

      // 預載入頁面
      router.prefetch(`/${params.countryCode}/checkout?step=${targetStep}`)
      
      toast.loading(message, { id: "quick-checkout" })
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      router.push(`/${params.countryCode}/checkout?step=${targetStep}`)
      
      toast.dismiss("quick-checkout")
      toast.success(`${message}成功`)
      
    } catch (error) {
      console.error("快速結帳失敗:", error)
      toast.error("操作失敗，請重試")
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasItems) {
    return (
      <div className="mt-4 text-sm text-gray-500 text-center">購物車是空的，無法快速結帳</div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm text-gray-600 text-center">或選擇快速結帳方式</div>
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => handleQuickAction("express")}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
        >
          <span role="img" aria-label="快速結帳">⚡</span> 快速結帳
        </button>
        <button
          onClick={() => handleQuickAction("guest")}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
        >
          <span role="img" aria-label="訪客結帳">🚪</span> 訪客結帳
        </button>
        {hasAddress && (
          <button
            onClick={() => handleQuickAction("saved")}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <span role="img" aria-label="使用已儲存地址">📍</span> 使用已儲存地址
          </button>
        )}
      </div>
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <span role="img" aria-label="時間">⏱️</span>
        <span>
          預計結帳時間: {
            hasAddress && hasShipping ? "30秒" : 
            hasAddress ? "1分鐘" : 
            "2分鐘"
          }
        </span>
      </div>
    </div>
  )
}

export default QuickCheckoutActions
