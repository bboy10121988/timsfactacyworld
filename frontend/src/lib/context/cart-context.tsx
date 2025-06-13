"use client"

import { Cart } from "@medusajs/medusa"
import { createContext, useContext, useState } from "react"

interface CartItem {
  variantId: string
  quantity: number
}

interface CartActionContext {
  cart: Cart | null
  addToCart: (item: { variantId: string; quantity: number }) => Promise<void>
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartActionContext | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToCart = async (item: CartItem) => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Implement cart functionality with server actions
      await new Promise(resolve => setTimeout(resolve, 500))
      setCart(prevCart => ({
        ...prevCart,
        items: [...(prevCart?.items || []), item],
      } as Cart))
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入購物車失敗")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, isLoading, error }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
