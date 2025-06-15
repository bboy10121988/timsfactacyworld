"use client"

import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { useState, useMemo, useEffect } from "react"
import { addToCart } from "@lib/data/cart"

type ProductOption = {
  title: string
  values: string[]
}

type SelectedOptions = {
  [key: string]: string | null
}

export default function ProductPreview({
  product,
  isFeatured,
  countryCode = "tw",
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  countryCode?: string
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  console.log('Product details:', {
    id: product.id,
    title: product.title,
    imagesCount: product.images?.length,
    images: product.images,
    thumbnail: product.thumbnail
  })

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 使用 useMemo 優化產品選項的計算
  const productOptions = useMemo(() => {
    if (!product.options?.length) return []

    // 直接使用產品的 options 結構，並按照特定順序排序
    return product.options
      .slice() // 創建副本避免修改原始數據
      .sort((a, b) => {
        // 確保特定選項的順序：尺寸 -> 顏色 -> 其他
        const getOptionPriority = (title: string) => {
          const lowerTitle = title.toLowerCase()
          if (lowerTitle.includes('尺寸') || lowerTitle.includes('size')) return 1
          if (lowerTitle.includes('顏色') || lowerTitle.includes('color')) return 2
          return 3
        }
        
        const priorityA = getOptionPriority(a.title)
        const priorityB = getOptionPriority(b.title)
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        
        // 如果優先級相同，按照創建時間排序
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeA - timeB
      })
      .map(option => ({
        title: option.title,
        values: option.values?.map(v => v.value) || []
      }))
  }, [product.options])

  // 自動選擇單一選項值
  const autoSelectSingleOptions = useMemo(() => {
    const autoSelected: SelectedOptions = {}
    
    productOptions.forEach(option => {
      if (option.values.length === 1) {
        autoSelected[option.title] = option.values[0]
      }
    })
    
    return autoSelected
  }, [productOptions])

  // 在組件載入時自動選擇單一選項值
  useEffect(() => {
    if (Object.keys(autoSelectSingleOptions).length > 0) {
      setSelectedOptions(prev => ({
        ...autoSelectSingleOptions,
        ...prev
      }))
    }
  }, [autoSelectSingleOptions])

  console.log('產品選項:', productOptions)
  console.log('產品選項順序:', productOptions.map(opt => opt.title))

  // 根據選擇的選項找到對應的變體
  const findVariantId = (selectedOpts: SelectedOptions): string | undefined => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }

    // 檢查是否有選擇的選項
    const selectedEntries = Object.entries(selectedOpts).filter(([_, value]) => value !== null)
    
    // 如果沒有選擇任何選項，返回 undefined
    if (selectedEntries.length === 0) return undefined
    
    // 如果選項數量不完整，也返回 undefined
    if (selectedEntries.length < productOptions.length) return undefined

    // 尋找匹配的變體
    const matchedVariant = product.variants.find(variant => {
      if (!variant.options) return false
      
      // 檢查變體的選項是否與選擇的選項匹配
      return selectedEntries.every(([optionTitle, selectedValue]) => {
        return variant.options?.some(variantOption => 
          variantOption.option?.title === optionTitle && 
          variantOption.value === selectedValue
        )
      }) && variant.options.length === selectedEntries.length
    })

    return matchedVariant?.id
  }

  const handleOptionSelect = async (optionTitle: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionTitle]: value
    }))
  }

  const handleAddToCart = async (e?: React.MouseEvent) => {
    // 如果有傳入事件物件，則阻止預設行為
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // 防止重複點擊
    if (isAdding) {
      console.log("⚠️ 正在添加中，忽略重複點擊")
      return
    }

    console.log("🔍 ProductPreview 加入購物車檢查:", {
      productTitle: product.title,
      selectedOptions,
      productOptions
    })

    const variantId = findVariantId(selectedOptions)
    console.log("🔍 找到的變體 ID:", variantId)
    
    if (!variantId) {
      console.log("❌ 沒有找到匹配的變體")
      setError("請選擇所有必要的選項")
      return
    }

    try {
      setError(null)
      setIsAdding(true)
      console.log("🛒 ProductPreview 開始加入購物車:", {
        variantId,
        quantity: 1,
        countryCode
      })
      
      await addToCart({
        variantId,
        quantity: 1,
        countryCode
      })
      
      console.log("✅ ProductPreview 成功加入購物車!")
      // 不要清空選項，因為用戶可能想繼續購買相同的變體
      // setSelectedOptions({})
      setError(null)
      // 只觸發購物車更新事件
      window.dispatchEvent(new Event('cartUpdate'))
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error) {
      console.error("❌ ProductPreview 添加到購物車失敗:", error)
      setError("添加到購物車失敗，請稍後再試")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="relative group w-full mb-8">
      {/* 成功提示彈窗 */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 animate-fade-in-down">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-body-small">Item Added to Cart</span>
        </div>
      )}
      
      <div className="relative">
        <div 
          className="relative w-full pb-[133.33%] overflow-hidden bg-gray-50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 商品圖片區塊 */}
          <LocalizedClientLink href={`/products/${product.handle}`} className="block absolute inset-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <Thumbnail 
                thumbnail={product.thumbnail} 
                images={product.images || []}
                size="full"
              />
            </div>
          </LocalizedClientLink>

          {/* 選項和加入購物車區塊 - 在 Link 外面 */}
          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out transform translate-y-1 group-hover:translate-y-0">
            <div className="w-full bg-white/95 backdrop-blur-[2px]">
              {productOptions.map((option, index) => (
                <div key={index} className="flex flex-col border-t first:border-t-0 border-black/[0.06]">
                  <div className="text-body-small text-black/60 px-2 md:px-8 py-1 border-b border-black/[0.06]">
                    {option.title}
                  </div>
                  <div 
                    className="grid"
                    style={{ 
                      gridTemplateColumns: `repeat(${option.values.length}, minmax(0, 1fr))`
                    }}
                  >
                    {option.values.map((value, valueIndex) => (
                      <button
                        key={valueIndex}
                        onClick={(e) => {
                          e.preventDefault()
                          handleOptionSelect(option.title, value)
                        }}
                        className={`w-full py-3 border border-black h4 transition-colors
                          ${selectedOptions[option.title] === value 
                            ? 'bg-black text-white' 
                            : 'text-black hover:bg-black hover:text-white'}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {productOptions.length > 0 && (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !findVariantId(selectedOptions)}
                    className="w-full py-3 border border-black h4 hover:bg-black hover:text-white transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-200"
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </button>
                  {error && (
                    <div className="text-red-500 text-xs text-center py-1 px-2 md:px-8">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 商品資訊區塊 */}
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <div className="px-2 md:px-8 mt-4">
            <h3 className="text-body-small" data-testid="product-title">
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="mt-1">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
