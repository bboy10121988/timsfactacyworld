"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import ProductVariantOptions from "../product-variant-options"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type ProductSelectionWrapperProps = {
  product: HttpTypes.StoreProduct
  actionsComponent: React.ReactNode
}

const ProductSelectionWrapper = ({ 
  product, 
  actionsComponent 
}: ProductSelectionWrapperProps) => {
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | undefined>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 從URL參數中獲取變體ID（如果有）
  useEffect(() => {
    const variantId = searchParams.get("variant")
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId)
      if (variant) {
        setSelectedVariant(variant)
      }
    } else if (product.variants && product.variants.length === 1) {
      // 如果只有一個變體，自動選擇它
      setSelectedVariant(product.variants[0])
    }
  }, [searchParams, product.variants])
  
  // 當選中的變體改變時更新URL
  const handleVariantChange = (variant: HttpTypes.StoreProductVariant | undefined) => {
    setSelectedVariant(variant)
    
    // 更新URL以反映選中的變體
    if (variant) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("variant", variant.id)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("variant")
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  return (
    <div className="space-y-8">
      {/* 產品資訊區域 */}
      {selectedVariant && (
        <div className="text-sm text-gray-500">
          產品編號: <span className="text-gray-700">{selectedVariant.sku || '無'}</span>
        </div>
      )}
      
      {/* 產品變體和選項選擇 */}
      <ProductVariantOptions 
        product={product} 
        onVariantChange={handleVariantChange}
      />
      
      {/* 加入購物車按鈕區塊 */}
      <div className="border-t border-gray-200 pt-6">
        {actionsComponent}
      </div>
    </div>
  )
}

export default ProductSelectionWrapper
