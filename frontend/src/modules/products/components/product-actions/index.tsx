"use client"

import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { isEqual } from "lodash"
import { useIntersection } from "@lib/hooks/use-in-view"
import { useProductActions } from "@lib/context/product-context"
import Divider from "@modules/common/components/divider"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { toast } from "react-hot-toast"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const {
    addToCart,
    inStock,
    isAdding,
    options,
    setOptions,
    selectedVariant,
  } = useProductActions()

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // 在元件初始化時列印產品結構
  useEffect(() => {
    console.log("🚀 ProductActions 初始化")
    console.log("📦 完整產品數據:", JSON.stringify(product, null, 2))
    
    console.log("📋 產品基本資訊:", {
      id: product.id,
      title: product.title,
      handle: product.handle,
      hasOptions: !!product.options?.length,
      optionCount: product.options?.length || 0,
      variantCount: product.variants?.length || 0
    })
    
    // 列印產品選項詳情
    if (product.options && product.options.length > 0) {
      console.log("✅ 產品有選項:")
      product.options.forEach((option, idx) => {
        console.log(`  選項 ${idx+1}: ${option.title} (ID: ${option.id})`)
        if (option.values && option.values.length > 0) {
          const values = option.values.map(v => v.value).join(', ')
          console.log(`    值: ${values}`)
        } else {
          console.warn(`    ⚠️ 選項 ${option.title} 沒有值！`)
        }
      })
    } else {
      console.warn("❌ 警告：產品缺少選項定義！")
      console.log("🔍 product.options:", product.options)
    }
    
    // 列印產品變體
    if (product.variants && product.variants.length > 0) {
      console.log(`📊 變體數量: ${product.variants.length}`)
      product.variants.forEach((variant, idx) => {
        console.log(`  變體 ${idx+1}: ${variant.title} (ID: ${variant.id})`)
        if (variant.options && variant.options.length > 0) {
          const optionInfo = variant.options.map(o => 
            `${o.option?.title || '未知選項'}: ${o.value}`
          ).join(', ')
          console.log(`    選項組合: ${optionInfo}`)
        } else {
          console.warn(`    ⚠️ 變體 ${variant.title} 沒有選項組合!`)
        }
      })
    } else {
      console.warn("❌ 警告：產品缺少變體定義！")
    }
  }, [product])

  // 定義一個更完整的調試函數，在控制台中打印詳細信息
  const debugProductStructure = (product: HttpTypes.StoreProduct) => {
    console.log("===== 產品結構詳細分析 =====")
    console.log(`產品: ${product.title} (${product.id})`)
    
    // 分析選項
    if (product.options && product.options.length > 0) {
      console.log(`\n選項數量: ${product.options.length}`)
      product.options.forEach((option, idx) => {
        const values = option.values?.map(v => v.value).join(', ') || '無值'
        console.log(`選項 ${idx+1}: ${option.title} (ID: ${option.id})`)
        console.log(`  值: ${values}`)
      })
    } else {
      console.warn("⚠️ 產品沒有選項定義!")
    }
    
    // 分析變體
    if (product.variants && product.variants.length > 0) {
      console.log(`\n變體數量: ${product.variants.length}`)
      product.variants.forEach((variant, idx) => {
        console.log(`變體 ${idx+1}: ${variant.title} (ID: ${variant.id})`)
        
        if (variant.options && variant.options.length > 0) {
          console.log(`  選項組合:`)
          variant.options.forEach(opt => {
            const optionTitle = opt.option?.title || '未知選項'
            console.log(`    ${optionTitle}: ${opt.value} (選項ID: ${opt.option_id})`)
          })
        } else {
          console.warn(`  ⚠️ 變體 ${variant.title} 沒有選項組合!`)
        }
      })
    } else {
      console.warn("⚠️ 產品沒有變體定義!")
    }
    
    console.log("===== 產品結構分析結束 =====")
  }

  // 監聽選項變化
  useEffect(() => {
    console.log("🔔 選項狀態變化:", options)
  }, [options])

  // 在組件初始化時調用詳細分析函數
  useEffect(() => {
    debugProductStructure(product)
  }, [product])

  // 如果只有一個變體，預先選擇選項
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants, setOptions])

  // 自動選擇只有單一值的選項
  useEffect(() => {
    if (!product.options || product.options.length === 0) return

    console.log("🔍 檢查是否有單一值選項需要自動選擇...")
    
    const autoSelectedOptions: Record<string, string> = {}
    let hasAutoSelection = false

    product.options.forEach(option => {
      console.log(`  檢查選項 "${option.title}": ${option.values?.length || 0} 個值`)
      
      // 如果某個選項只有一個值，自動選擇它
      if (option.values && option.values.length === 1) {
        autoSelectedOptions[option.id] = option.values[0].value
        hasAutoSelection = true
        console.log(`  🎯 自動選擇選項 "${option.title}": ${option.values[0].value}`)
      }
    })

    // 只在有自動選擇的選項時更新狀態
    if (hasAutoSelection) {
      console.log("📝 更新自動選擇的選項:", autoSelectedOptions)
      setOptions(prev => {
        const newOptions = {
          ...prev,
          ...autoSelectedOptions
        }
        console.log("📊 合併後的選項狀態:", newOptions)
        return newOptions
      })
    } else {
      console.log("  ℹ️ 沒有需要自動選擇的單一值選項")
    }
  }, [product.options, setOptions])

  const selectedVariantMemo = useMemo(() => {
    console.log("🔍 計算 selectedVariantMemo:")
    console.log("  當前選項:", options)
    
    if (!product.variants || product.variants.length === 0) {
      console.log("  ❌ 沒有變體")
      return
    }
    
    const foundVariant = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      console.log(`  檢查變體 ${v.title}:`, { variantOptions, currentOptions: options })
      const matches = isEqual(variantOptions, options)
      console.log(`  匹配結果:`, matches)
      return matches
    })
    
    console.log("  🎯 找到的變體:", foundVariant ? { id: foundVariant.id, title: foundVariant.title } : "無")
    return foundVariant
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    console.log("🔄 設置選項值:", { optionId, value })
    setOptions((prev) => {
      const newOptions = {
        ...prev,
        [optionId]: value,
      }
      console.log("📊 新選項狀態:", newOptions)
      return newOptions
    })
  }

  const isValidVariant = useMemo(() => {
    console.log("🔍 計算 isValidVariant:")
    const result = product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      const matches = isEqual(variantOptions, options)
      console.log(`  變體 ${v.title} 匹配:`, matches)
      return matches
    })
    console.log("  🎯 isValidVariant 結果:", result)
    return result
  }, [product.variants, options])

  // 監聽變體選擇變化
  useEffect(() => {
    console.log("🔔 當前選擇的變體:", selectedVariantMemo ? { id: selectedVariantMemo.id, title: selectedVariantMemo.title } : "無")
    console.log("🔔 變體是否有效:", isValidVariant)
    if (selectedVariantMemo) {
      console.log("🔔 變體庫存信息:", {
        manage_inventory: selectedVariantMemo.manage_inventory,
        allow_backorder: selectedVariantMemo.allow_backorder,
        inventory_items: (selectedVariantMemo as any).inventory_items
      })
    }
  }, [selectedVariantMemo, isValidVariant])

  // 計算變體的可用庫存
  const getVariantAvailableQuantity = (variant: any): number => {
    if (!variant?.inventory_items || variant.inventory_items.length === 0) {
      console.log("📦 沒有庫存項目數據")
      return 0
    }

    // 計算所有庫存項目的總可用數量
    const totalAvailable = variant.inventory_items.reduce((total: number, item: any) => {
      if (item.location_levels && item.location_levels.length > 0) {
        // 使用第一個location level的可用數量
        const availableQty = item.location_levels[0].available_quantity || 0
        console.log(`📦 庫存項目 ${item.id}: 可用數量 = ${availableQty}`)
        return total + availableQty
      }
      return total
    }, 0)

    console.log(`📦 變體 ${variant.title} 總可用庫存: ${totalAvailable}`)
    return totalAvailable
  }

  const inStockMemo = useMemo(() => {
    console.log("🔍 計算庫存狀態...")
    
    if (!selectedVariantMemo) {
      console.log("📦 沒有選擇變體，庫存狀態: false")
      return false
    }

    // 如果不管理庫存，視為有庫存
    if (!selectedVariantMemo.manage_inventory) {
      console.log("📦 不管理庫存，庫存狀態: true")
      return true
    }

    // 如果允許預購，視為有庫存
    if (selectedVariantMemo.allow_backorder) {
      console.log("📦 允許預購，庫存狀態: true")
      return true
    }

    // 檢查實際庫存數量 - 與 ProductPreview 保持一致的邏輯
    const hasStock = selectedVariantMemo.inventory_quantity !== undefined && selectedVariantMemo.inventory_quantity > 0
    console.log("📦 管理庫存且不允許預購，庫存數量:", selectedVariantMemo.inventory_quantity, "有庫存:", hasStock)
    return hasStock
  }, [selectedVariantMemo])

  // 計算選中變體的庫存狀態
  const variantStockStatus = useMemo(() => {
    if (!selectedVariantMemo) {
      return { hasStock: false, canPreorder: false, isSoldOut: false }
    }

    // 如果不管理庫存，永遠有庫存
    if (!selectedVariantMemo.manage_inventory) {
      return { hasStock: true, canPreorder: false, isSoldOut: false }
    }

    // 檢查庫存數量
    const hasStock = selectedVariantMemo.inventory_quantity !== undefined && selectedVariantMemo.inventory_quantity > 0

    if (hasStock) {
      return { hasStock: true, canPreorder: false, isSoldOut: false }
    } else {
      // 沒有庫存
      if (selectedVariantMemo.allow_backorder) {
        return { hasStock: false, canPreorder: true, isSoldOut: false }
      } else {
        return { hasStock: false, canPreorder: false, isSoldOut: true }
      }
    }
  }, [selectedVariantMemo])

  const handleAddToCart = async () => {
    if (!selectedVariantMemo?.id) {
      console.log("❌ 無法加入購物車：沒有選擇變體")
      return null
    }
    
    // 檢查變體是否有價格
    const hasPrice = selectedVariantMemo.calculated_price && 
                    selectedVariantMemo.calculated_price.calculated_amount && 
                    selectedVariantMemo.calculated_price.calculated_amount > 0
    
    if (!hasPrice) {
      console.log("❌ 無法加入購物車：變體沒有價格")
      toast.error("此商品尚未設定價格，請聯繫管理員")
      return null
    }
    
    console.log("🛒 ProductActions 開始加入購物車:", {
      variantId: selectedVariantMemo.id,
      variantTitle: selectedVariantMemo.title,
      quantity: 1,
      countryCode: "tw"
    })
    
    try {
      await addToCart({
        variantId: selectedVariantMemo.id,
        quantity: 1,
        countryCode: "tw",
      })
      console.log("✅ ProductActions 成功加入購物車!")
      toast.success("已加入購物車")
    } catch (error) {
      console.error("❌ ProductActions 加入購物車失敗:", error)
      // 顯示更友好的錯誤信息
      if (error instanceof Error && error.message.includes("do not have a price")) {
        toast.error("此商品尚未設定價格，請聯繫管理員")
      } else {
        toast.error("加入購物車失敗，請稍後再試")
      }
    }
  }

  const handleBuyNow = async () => {
    if (!selectedVariantMemo?.id) {
      console.log("❌ 無法立即購買：沒有選擇變體")
      return null
    }
    
    // 檢查變體是否有價格
    const hasPrice = selectedVariantMemo.calculated_price && 
                    selectedVariantMemo.calculated_price.calculated_amount && 
                    selectedVariantMemo.calculated_price.calculated_amount > 0
    
    if (!hasPrice) {
      console.log("❌ 無法立即購買：變體沒有價格")
      toast.error("此商品尚未設定價格，請聯繫管理員")
      return null
    }
    
    console.log("🚀 ProductActions 開始立即購買:", {
      variantId: selectedVariantMemo.id,
      variantTitle: selectedVariantMemo.title,
      quantity: 1,
      countryCode: "tw"
    })
    
    try {
      await addToCart({
        variantId: selectedVariantMemo.id,
        quantity: 1,
        countryCode: "tw",
      })
      console.log("✅ ProductActions 成功加入購物車，跳轉到購物車頁面")
      router.push("/tw/cart")
    } catch (error) {
      console.error("❌ ProductActions 立即購買失敗:", error)
      // 顯示更友好的錯誤信息
      if (error instanceof Error && error.message.includes("do not have a price")) {
        toast.error("此商品尚未設定價格，請聯繫管理員")
      } else {
        toast.error("立即購買失敗，請稍後再試")
      }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        <div>
          {/* 修改條件：只要有選項就顯示，不管變體數量 */}
          {(product.options?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-y-6">
              {(product.options || [])
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
                .map((option) => {
                // 獲取選項的所有可能值
                const optionValues = option.values?.map(v => v.value) || []
                console.log(`渲染選項 ${option.title}，值:`, optionValues)
                console.log('ProductActions 選項順序:', (product.options || []).slice().sort((a, b) => {
                  const getOptionPriority = (title: string) => {
                    const lowerTitle = title.toLowerCase()
                    if (lowerTitle.includes('尺寸') || lowerTitle.includes('size')) return 1
                    if (lowerTitle.includes('顏色') || lowerTitle.includes('color')) return 2
                    return 3
                  }
                  return getOptionPriority(a.title) - getOptionPriority(b.title)
                }).map(opt => opt.title))
                
                return (
                  <div key={option.id} className="mb-2">
                    <h3 className="uppercase text-xs tracking-wider mb-3 font-medium">
                      {option.title}
                      {!options[option.id] && (
                        <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                          請選擇
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {optionValues.map((value) => {
                        const isSelected = options[option.id] === value
                        
                        return (
                          <button
                            key={`${option.id}_${value}`}
                            onClick={() => setOptionValue(option.id, value)}
                            className={`
                              border h-12 text-sm flex items-center justify-center transition-all duration-200 rounded-md font-medium
                              ${isSelected 
                                ? 'border-black bg-black text-white' 
                                : 'border-gray-300 bg-white text-gray-800 hover:border-gray-600 hover:bg-gray-50'}
                              ${disabled || isAdding ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            disabled={disabled || isAdding}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <Divider className="my-2" />
            </div>
          )}
        </div>
        
        <ProductPrice product={product} variant={selectedVariantMemo} />
        
        {/* 庫存狀態顯示 */}
        <div className="text-sm">
          {selectedVariantMemo ? (
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${
                variantStockStatus.hasStock ? 'bg-green-500' : 
                variantStockStatus.canPreorder ? 'bg-orange-500' : 'bg-red-500'
              }`}></span>
              <span className={
                variantStockStatus.hasStock ? 'text-green-600' : 
                variantStockStatus.canPreorder ? 'text-orange-600' : 'text-red-600'
              }>
                {variantStockStatus.hasStock ? '有庫存' :
                 variantStockStatus.canPreorder ? '可預訂' : '售完'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
              <span className="text-gray-500">請選擇商品規格</span>
            </div>
          )}
        </div>

        {/* 只有選擇了有效變體後才顯示購買按鈕 */}
        {selectedVariantMemo && isValidVariant && (
          <div className="flex flex-col gap-3 mt-4">
            {/* 加入購物車按鈕 - 放在上面 */}
            <Button
              onClick={handleAddToCart}
              variant="secondary"
              className="w-full h-12 uppercase tracking-wide text-sm font-light border border-black hover:bg-gray-100"
              disabled={variantStockStatus.isSoldOut || !!disabled || isAdding}
              isLoading={isAdding}
            >
              {isAdding ? '處理中...' : 
               variantStockStatus.canPreorder ? '預訂' : '加入購物車'}
            </Button>
            
            {/* 立即購買按鈕 - 放在下面 */}
            <Button
              onClick={handleBuyNow}
              variant="primary"
              className="w-full h-12 uppercase tracking-wide text-sm font-light bg-gray-900 hover:bg-gray-800"
              disabled={variantStockStatus.isSoldOut || !!disabled || isAdding}
              isLoading={isAdding}
              data-testid="add-product-button"
            >
              {isAdding ? '處理中...' : 
               variantStockStatus.canPreorder ? '立即預訂' : '立即購買'}
            </Button>
          </div>
        )}
        
        <MobileActions
          product={product}
          show={!inView}
          variantStockStatus={variantStockStatus}
        />
      </div>
    </>
  )
}