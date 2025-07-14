"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect, useMemo } from "react"

type ProductOptionsProps = {
  product: HttpTypes.StoreProduct
  selectedOptions?: Record<string, string>
  onOptionChange?: (optionId: string, value: string) => void
}

const ProductOptions = ({ product, selectedOptions = {}, onOptionChange }: ProductOptionsProps) => {
  const [localOptions, setLocalOptions] = useState<Record<string, string>>(selectedOptions)

  // 當外部選項更新時同步本地狀態
  useEffect(() => {
    setLocalOptions(selectedOptions)
  }, [selectedOptions])

  if (!product.options || product.options.length === 0) {
    return null
  }
  
  // 計算每個選項值對應的庫存狀態
  const optionInventoryMap = useMemo(() => {
    const inventoryMap: Record<string, Record<string, boolean>> = {}
    
    // 初始化map
    if (product.options) {
      product.options.forEach(option => {
        if (option.id) {
          inventoryMap[option.id] = {}
          option.values?.forEach(value => {
            if (value.value) {
              inventoryMap[option.id][value.value] = false
            }
          })
        }
      })
    }
    
    // 遍歷所有變體來填充庫存信息
    product.variants?.forEach(variant => {
      // 檢查該變體是否有庫存，或者不管理庫存，或者允許缺貨銷售
      const hasStock = !variant.manage_inventory || 
                       variant.allow_backorder || 
                       (variant.inventory_quantity !== undefined && variant.inventory_quantity > 0)
      
      if (hasStock) {
        // 將該變體的選項標記為有庫存
        variant.options?.forEach(option => {
          if (option.option_id && option.value && inventoryMap[option.option_id]) {
            inventoryMap[option.option_id][option.value] = true
          }
        })
      }
    })
    
    return inventoryMap
  }, [product.options, product.variants])

  if (!product.options || product.options.length === 0) {
    return null
  }

  const handleOptionChange = (optionId: string, value: string) => {
    // 更新本地狀態
    setLocalOptions(prev => ({
      ...prev,
      [optionId]: value
    }))

    // 調用外部處理器（如果提供）
    if (onOptionChange) {
      onOptionChange(optionId, value)
    }
  }

  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <div key={option.id} className="space-y-3">
          <h3 className="text-sm uppercase font-medium tracking-wider">
            {option.title}: {localOptions[option.id] && <span className="font-normal text-gray-700">{localOptions[option.id]}</span>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => {
              const isSelected = localOptions[option.id] === value.value;
              const hasStock = option.id && value.value && 
                optionInventoryMap[option.id] && 
                optionInventoryMap[option.id][value.value];
              
              return (
                <button
                  key={value.id}
                  type="button"
                  disabled={!hasStock}
                  onClick={() => hasStock && handleOptionChange(option.id, value.value)}
                  className={`px-4 py-2 border text-sm transition-colors duration-200 ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : hasStock
                        ? "border-gray-300 bg-white text-black hover:border-gray-900"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label={`選擇${option.title}: ${value.value}`}
                >
                  <span>{value.value}</span>
                  {!hasStock && <span className="text-xs ml-1">(缺貨)</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductOptions
