"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { HttpTypes } from "@medusajs/types"

type CartActionsProps = {
  cart: HttpTypes.StoreCart
}

const CartActions = ({ cart }: CartActionsProps) => {
  const [isSaving, setIsSaving] = useState(false)
  
  const hasItems = cart?.items && cart.items.length > 0

  const handleSaveCart = async () => {
    if (!hasItems) {
      toast.error("無法儲存空購物車")
      return
    }

    setIsSaving(true)
    
    try {
      // 將購物車資訊儲存到 localStorage
      const cartData = {
        id: cart.id,
        items: cart.items?.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          title: item.title,
          thumbnail: item.thumbnail
        })),
        total: cart.total,
        created_at: new Date().toISOString()
      }
      
      localStorage.setItem(`saved_cart_${cart.id}`, JSON.stringify(cartData))
      
      toast.success("購物車已儲存！")
    } catch (error) {
      console.error("儲存購物車失敗:", error)
      toast.error("儲存失敗，請重試")
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareCart = async () => {
    if (!hasItems) {
      toast.error("無法分享空購物車")
      return
    }

    try {
      // 創建分享內容
      const shareText = `我在 Tim's 購物車中加入了 ${cart.items?.length} 個商品，總計 ${cart.currency_code} ${(cart.total || 0) / 100}`
      const shareUrl = window.location.href
      
      if (navigator.share) {
        // 使用原生分享 API
        await navigator.share({
          title: "我的購物車 - Tim's Fantasy World",
          text: shareText,
          url: shareUrl
        })
        toast.success("分享成功！")
      } else {
        // 備用：複製到剪貼板
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        toast.success("分享連結已複製到剪貼板！")
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error("分享失敗:", error)
        toast.error("分享失敗，請重試")
      }
    }
  }

  const handleClearCart = async () => {
    if (!hasItems) {
      toast.error("購物車已經是空的")
      return
    }

    const confirmed = window.confirm("確定要清空購物車嗎？此操作無法復原。")
    if (!confirmed) return

    try {
      // 這裡需要調用清空購物車的 API
      toast.loading("正在清空購物車...", { id: "clear-cart" })
      
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 重新載入頁面或更新狀態
      window.location.reload()
      
    } catch (error) {
      console.error("清空購物車失敗:", error)
      toast.error("清空失敗，請重試")
    } finally {
      toast.dismiss("clear-cart")
    }
  }

  const handlePrintCart = () => {
    if (!hasItems) {
      toast.error("無法列印空購物車")
      return
    }

    // 創建列印友好的頁面
    const printContent = `
      <html>
        <head>
          <title>購物車清單 - Tim's Fantasy World</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>購物車清單</h1>
            <p>列印時間：${new Date().toLocaleString()}</p>
          </div>
          ${cart.items?.map(item => `
            <div class="item">
              <h3>${item.title}</h3>
              <p>數量：${item.quantity}</p>
              <p>單價：${cart.currency_code} ${(item.unit_price || 0) / 100}</p>
              <p>小計：${cart.currency_code} ${(item.total || 0) / 100}</p>
            </div>
          `).join('')}
          <div class="total">
            總計：${cart.currency_code} ${(cart.total || 0) / 100}
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
  }

  if (!hasItems) {
    return null
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600 text-center mb-3">
        購物車管理
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {/* 儲存購物車 */}
        <button
          onClick={handleSaveCart}
          disabled={isSaving}
          className="flex items-center justify-center space-x-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors border border-blue-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2.586l-1.293-1.293a1 1 0 00-1.414 1.414L16 10.414V18a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span>{isSaving ? "儲存中" : "儲存"}</span>
        </button>

        {/* 分享購物車 */}
        <button
          onClick={handleShareCart}
          className="flex items-center justify-center space-x-1 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg transition-colors border border-green-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          <span>分享</span>
        </button>

        {/* 列印購物車 */}
        <button
          onClick={handlePrintCart}
          className="flex items-center justify-center space-x-1 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          <span>列印</span>
        </button>

        {/* 清空購物車 */}
        <button
          onClick={handleClearCart}
          className="flex items-center justify-center space-x-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors border border-red-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 004 0V7a2 2 0 00-2-2z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 9v8a2 2 0 002 2h8a2 2 0 002-2V9H4z" clipRule="evenodd" />
          </svg>
          <span>清空</span>
        </button>
      </div>
    </div>
  )
}

export default CartActions
