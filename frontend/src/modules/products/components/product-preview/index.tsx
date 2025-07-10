"use client"

import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { useState, useMemo, useEffect } from "react"
import { addToCart } from "@lib/data/cart"
import { getActivePromotionLabels, PromotionLabel } from "@lib/simple-promotion-utils"

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

  // 載入促銷標籤
  useEffect(() => {
    const loadPromotionLabels = async () => {
      setIsLoadingPromotions(true)
      try {
        // 只使用 Medusa API 獲取促銷標籤
        const labels = await getActivePromotionLabels(product, 'reg_01JW1S1F7GB4ZP322G2DMETETH')
        setPromotionLabels(labels)
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`【${product.title}】Medusa API 促銷標籤:`, labels)
          console.log(`【${product.title}】標籤數量:`, labels.length)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load Medusa API promotion labels:', error)
        }
        // 如果 Medusa API 失敗，不顯示任何標籤
        setPromotionLabels([])
      } finally {
        setIsLoadingPromotions(false)
      }
    }

    loadPromotionLabels()
  }, [product]) // 使用整個 product 物件作為依賴

  // 簡化的庫存狀態檢查
  const productStockStatus = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { isSoldOut: false, canPreorder: false }
    }

    const allVariantsOutOfStock = product.variants.every(variant => {
      return variant.manage_inventory && (variant.inventory_quantity || 0) === 0
    })

    const canPreorder = product.variants.some(variant => {
      return variant.allow_backorder === true
    })

    return {
      isSoldOut: allVariantsOutOfStock && !canPreorder,
      canPreorder: allVariantsOutOfStock && canPreorder
    }
  }, [product])

  // 為了向後相容，保留 isProductSoldOut
  const isProductSoldOut = productStockStatus.isSoldOut

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [promotionLabels, setPromotionLabels] = useState<any[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true)
  const [isImageTransitioning, setIsImageTransitioning] = useState(false)

  // 獲取所有可用圖片
  const allImages = useMemo(() => {
    const images = []
    if (product.thumbnail) {
      images.push(product.thumbnail)
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.url && img.url !== product.thumbnail) {
          images.push(img.url)
        }
      })
    }
    return images
  }, [product.thumbnail, product.images])

  // 切換圖片的通用函數，帶淡出淡入效果
  const changeImage = (newIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (allImages.length > 1 && newIndex !== currentImageIndex) {
      setIsImageTransitioning(true)
      setTimeout(() => {
        setCurrentImageIndex(newIndex)
        setIsImageTransitioning(false)
      }, 150) // 淡出時間
    }
  }

  // 切換到下一張圖片
  const nextImage = (e: React.MouseEvent) => {
    const newIndex = (currentImageIndex + 1) % allImages.length
    changeImage(newIndex, e)
  }

  // 切換到上一張圖片
  const prevImage = (e: React.MouseEvent) => {
    const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length
    changeImage(newIndex, e)
  }
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

  // 根據選擇的選項找到對應的變體
  const findVariantId = (selectedOpts: SelectedOptions): string | undefined => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }

    // 如果商品沒有選項，直接返回第一個變體
    if (productOptions.length === 0) {
      return product.variants[0]?.id
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

  // 手機版按鈕點擊處理
  const handleMobileButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 檢查是否需要選擇選項
    const hasMultipleOptions = productOptions.filter(option => option.values.length > 1).length > 0
    const variantId = findVariantId(selectedOptions)

    if (hasMultipleOptions && !variantId) {
      // 如果有多個選項且沒有選擇，跳轉到商品詳細頁面
      window.location.href = `/products/${product.handle}`
      return
    }

    // 否則直接加入購物車
    handleAddToCart(e)
  }

  return (
    <div className={`product-preview relative group w-full ${isFeatured ? 'featured-product-card' : ''}`}>
      {/* 成功提示彈窗 */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 animate-fade-in-down">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs">Item Added to Cart</span>
        </div>
      )}
      
      <div className="relative">
        <div 
          className="relative w-full pb-[133.33%] overflow-hidden bg-gray-50"
          onMouseEnter={() => {
            setIsHovered(true)
            // 如果有多張圖片，hover時使用淡出淡入切換到第二張圖片
            if (allImages.length > 1) {
              changeImage(1)
            }
          }}
          onMouseLeave={() => {
            setIsHovered(false)
            // 離開hover時使用淡出淡入恢復到主圖
            changeImage(0)
          }}
        >
          {/* 商品圖片區塊 */}
          <LocalizedClientLink href={`/products/${product.handle}`} className="block absolute inset-0">
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isImageTransitioning ? 'opacity-0' : 'opacity-100'
            } ${isFeatured ? 'product-image' : ''}`}>
              <Thumbnail 
                thumbnail={allImages[currentImageIndex]} 
                images={allImages.map(url => ({ url }))}
                size="full"
              />
            </div>
            
            {/* 圖片切換箭頭 - 只在有多張圖片時顯示 */}
            {allImages.length > 1 && (
              <>
                {/* 左箭頭 */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-40 text-black hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 drop-shadow-lg"
                  aria-label="上一張圖片"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* 右箭頭 */}
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-40 text-black hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 drop-shadow-lg"
                  aria-label="下一張圖片"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* 圖片指示器 */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 shadow-md ${
                        index === currentImageIndex ? 'bg-white border border-gray-300' : 'bg-white/60 border border-white/20'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* 左上角促銷標籤區域 - 僅在商品未售完時顯示 */}
            {!isProductSoldOut && (
              <div className="absolute top-2 left-2 z-30 flex flex-col gap-1">
                {/* 顯示促銷折扣標籤，優先顯示有折扣的標籤 */}
                {promotionLabels
                  .filter(label => label.type !== 'sold-out' && label.type !== 'preorder')
                  .map((label, index) => (
                  <div 
                    key={`${label.type}-${index}`} 
                    className={label.className || 'gold-badge-circle'}
                  >
                    {label.text}
                  </div>
                ))}
              </div>
            )}
            
            {/* 右上角庫存狀態標籤區域 */}
            <div className="absolute top-2 right-2 z-30">
              {(isProductSoldOut || productStockStatus.canPreorder) && (
                <div className={`px-2 py-1 text-xs font-semibold rounded-md shadow-md border
                  ${isProductSoldOut 
                    ? 'bg-gray-600 text-white border-gray-700' 
                    : 'bg-blue-600 text-white border-blue-700'
                  }`}>
                  {isProductSoldOut ? '售完' : '預訂'}
                </div>
              )}
            </div>
            
            {/* 售完狀態 - 只顯示反灰層 */}
            {isProductSoldOut && (
              <div className="absolute inset-0 bg-black/50 z-20 pointer-events-none">
              </div>
            )}
          </LocalizedClientLink>

          {/* 手機版錯誤提示 */}
          {error && (
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-2 z-20">
              {error}
            </div>
          )}

          {/* 手機版 - 浮動加入購物車按鈕 (黑底正方形) */}
          {!isProductSoldOut && (
            <button
              onClick={handleMobileButtonClick}
              disabled={isAdding}
              className="md:hidden absolute bottom-3 right-3 z-30 w-10 h-10 bg-black text-white rounded shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed group/btn"
              aria-label={
                (() => {
                  if (isAdding) return "處理中..."
                  const hasMultipleOptions = productOptions.filter(option => option.values.length > 1).length > 0
                  const variantId = findVariantId(selectedOptions)
                  if (hasMultipleOptions && !variantId) return "選擇選項"
                  return productStockStatus.canPreorder ? "預訂" : "加入購物車"
                })()
              }
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                (() => {
                  const hasMultipleOptions = productOptions.filter(option => option.values.length > 1).length > 0
                  const variantId = findVariantId(selectedOptions)
                  
                  if (hasMultipleOptions && !variantId) {
                    // 顯示選項圖標
                    return (
                      <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    )
                  } else {
                    // 顯示購物車圖標
                    return (
                      <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd"/>
                      </svg>
                    )
                  }
                })()
              )}
            </button>
          )}

          {/* 桌機版 - 選項和加入購物車區塊 (hover 顯示) */}
          {!isProductSoldOut && (
            <div className="hidden md:block absolute bottom-0 left-0 right-0 
                          opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out transform translate-y-full group-hover:translate-y-0">
              <div className="w-full bg-white/95 backdrop-blur-[2px]">
                {productOptions
                  .filter(option => option.values.length > 1) // 只顯示有多個選擇的選項
                  .map((option, index) => (
                  <div key={index} className="flex flex-col border-t first:border-t-0 border-black/[0.06]">
                    <div className="text-xs text-black/60 px-2 md:px-8 py-1 border-b border-black/[0.06]">
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
                          className={`w-full py-3 border border-black text-sm transition-colors min-h-[40px]
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
                
                {/* 桌機版購物車按鈕 */}
                <div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || (productOptions.filter(option => option.values.length > 1).length > 0 && !findVariantId(selectedOptions))}
                    className="w-full px-4 py-3 border border-black text-sm hover:bg-black hover:text-white transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-200 min-h-[40px]"
                  >
                    {isAdding ? "處理中..." : 
                     productStockStatus.canPreorder ? "預訂" : "加入購物車"}
                  </button>
                </div>
                {error && (
                  <div className="text-red-500 text-xs text-center p-2">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 商品資訊區塊 */}
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <div className="px-2 md:px-8 py-3 mt-2">
            <h3 className="text-xs" data-testid="product-title">
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="mt-0.5">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
