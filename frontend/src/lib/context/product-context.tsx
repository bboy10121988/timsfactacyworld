"use client"

import { HttpTypes } from "@medusajs/types"
import { createContext, useContext, useState, useCallback } from "react"
import { addToCart as addToCartAction } from "@lib/data/cart"

interface ProductActionContext {
  addToCart: (input: { variantId: string; quantity: number; countryCode: string }) => Promise<void>
  inStock: boolean
  isAdding: boolean
  options: Record<string, string>
  setOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
  selectedVariant: HttpTypes.StoreProductVariant | undefined
  setSelectedVariant: React.Dispatch<React.SetStateAction<HttpTypes.StoreProductVariant | undefined>>
}

const ProductActionContext = createContext<ProductActionContext | undefined>(undefined)

export function ProductActionProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant>()
  const [isAdding, setIsAdding] = useState(false)
  const [inStock, setInStock] = useState(true)

  const addToCart = useCallback(async (input: { variantId: string; quantity: number; countryCode: string }) => {
    setIsAdding(true)
    try {
      await addToCartAction(input)
      // 觸發全局購物車更新事件
      window.dispatchEvent(new Event('cartUpdate'))
    } catch (error) {
      console.error("加入購物車失敗:", error)
      throw error
    } finally {
      setIsAdding(false)
    }
  }, [])

  return (
    <ProductActionContext.Provider
      value={{
        addToCart,
        inStock,
        isAdding,
        options,
        setOptions,
        selectedVariant,
        setSelectedVariant,
      }}
    >
      {children}
    </ProductActionContext.Provider>
  )
}

export function useProductActions() {
  const context = useContext(ProductActionContext)
  if (!context) {
    throw new Error("useProductActions must be used within a ProductActionProvider")
  }
  return context
}
