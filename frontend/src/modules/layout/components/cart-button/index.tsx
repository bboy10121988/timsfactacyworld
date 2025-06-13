"use client"

import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"
import { ShoppingCart } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

export default function CartButton() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // 獨立的獲取購物車函數
  const fetchCart = useCallback(async () => {
    const cartData = await retrieveCart().catch(() => null)
    setCart(cartData)
  }, [])

  useEffect(() => {
    fetchCart()

    // 添加全局事件監聽器來更新購物車
    window.addEventListener('cartUpdate', fetchCart)
    return () => {
      window.removeEventListener('cartUpdate', fetchCart)
    }
  }, [fetchCart])

  const totalItems = cart?.items?.reduce((acc: number, item: any) => {
    return acc + item.quantity
  }, 0) || 0

  return (
    <div className="hidden small:block">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex items-center gap-2 hover:text-gray-700"
        aria-label="購物車"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-gray-900">
          <CartDropdown cart={cart} />
        </div>
      )}
    </div>
  )
}
