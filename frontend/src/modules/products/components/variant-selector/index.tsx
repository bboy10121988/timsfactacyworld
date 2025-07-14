"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import { isEqual } from "lodash"

type VariantSelectorProps = {
  variants: HttpTypes.StoreProductVariant[]
  onVariantChange?: (variant: HttpTypes.StoreProductVariant) => void
  onOptionsChange?: (optionId: string, value: string) => void
  selectedOptions?: Record<string, string>
}

const VariantSelector = ({ 
  variants, 
  onVariantChange,
  onOptionsChange,
  selectedOptions = {} 
}: VariantSelectorProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // 將變體選項轉換為映射結構
  const optionsAsKeymap = (
    variantOptions: HttpTypes.StoreProductVariant["options"]
  ) => {
    return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
      acc[varopt.option_id] = varopt.value
      return acc
    }, {})
  }

  // 當selectedOptions改變時，查找相應的變體並更新選中狀態
  useEffect(() => {
    if (Object.keys(selectedOptions).length > 0) {
      const matchingVariant = variants.find(variant => {
        const variantOptions = optionsAsKeymap(variant.options)
        return isEqual(variantOptions, selectedOptions)
      })
      
      if (matchingVariant) {
        setSelectedVariantId(matchingVariant.id)
      }
    }
  }, [selectedOptions, variants])

  // 當點擊變體時
  const handleVariantClick = (variant: HttpTypes.StoreProductVariant) => {
    setSelectedVariantId(variant.id)
    
    // 如果提供了變體變更回調，則調用它
    if (onVariantChange) {
      onVariantChange(variant)
    }
    
    // 獲取變體的選項
    const variantOptions = variant.options || []
    
    // 如果提供了選項變更回調，則為每個選項調用它
    if (onOptionsChange) {
      variantOptions.forEach(option => {
        onOptionsChange(option.option_id, option.value)
      })
    }
  }

  // 將所有變體選項分組為按選項類型
  const groupOptionsByType = () => {
    // 儲存所有選項類型和它們的可能值
    const optionGroups: Record<string, { 
      id: string, 
      title: string, 
      values: { value: string, variantIds: string[], hasInStock: boolean }[]
    }> = {};

    // 遍歷所有變體來收集選項
    variants.forEach(variant => {
      // 更新庫存邏輯，考慮三種情況：不管理庫存、允許缺貨訂購、有庫存
      const isInStock = !variant.manage_inventory || 
                       variant.allow_backorder || 
                       (variant.inventory_quantity !== undefined && variant.inventory_quantity > 0);
      
      variant.options?.forEach(option => {
        // 如果這個選項類型還沒在結果中
        if (!optionGroups[option.option_id]) {
          optionGroups[option.option_id] = {
            id: option.option_id,
            title: option.option_name || '選項',
            values: []
          };
        }
        
        // 檢查這個值是否已存在於該選項類型的值列表中
        let existingValue = optionGroups[option.option_id].values.find(v => v.value === option.value);
        
        if (!existingValue) {
          // 如果值不存在，添加它
          optionGroups[option.option_id].values.push({
            value: option.value,
            variantIds: [variant.id],
            hasInStock: isInStock
          });
        } else {
          // 如果值已存在，更新它
          existingValue.variantIds.push(variant.id);
          // 如果當前變體有庫存，標記此選項值為有庫存
          if (isInStock) {
            existingValue.hasInStock = true;
          }
        }
      });
    });
    
    return Object.values(optionGroups);
  };

  // 獲取分組後的選項
  const optionGroups = groupOptionsByType();

  // 當選擇一個選項值時
  const handleOptionValueClick = (optionId: string, value: string) => {
    // 如果提供了選項變更回調，則調用它
    if (onOptionsChange) {
      onOptionsChange(optionId, value);
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {optionGroups.map(group => (
        <div key={group.id} className="space-y-3">
          <h3 className="text-sm uppercase font-medium tracking-wider">
            {group.title}: {selectedOptions[group.id] && <span className="font-normal text-gray-700">{selectedOptions[group.id]}</span>}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {group.values.map(valueData => {
              const isSelected = selectedOptions[group.id] === valueData.value;
              
              return (
                <button 
                  key={`${group.id}-${valueData.value}`} 
                  disabled={!valueData.hasInStock}
                  className={`
                    px-4 py-2 border text-sm transition-colors duration-200 flex items-center justify-between
                    ${isSelected
                      ? 'border-black bg-black text-white'
                      : valueData.hasInStock 
                        ? 'border-gray-300 bg-white text-black hover:border-gray-900' 
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  onClick={() => valueData.hasInStock && handleOptionValueClick(group.id, valueData.value)}
                  aria-label={`選擇${group.title}: ${valueData.value}`}
                >
                  <span>{valueData.value}</span>
                  {!valueData.hasInStock && <span className="text-xs ml-1">(缺貨)</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* 顯示當前選中的變體名稱（如有需要） */}
      {selectedVariantId && variants.find(v => v.id === selectedVariantId) && (
        <div className="text-sm text-gray-500">
          已選擇: <span className="font-medium text-gray-700">{variants.find(v => v.id === selectedVariantId)?.title}</span>
        </div>
      )}
    </div>
  )
}

export default VariantSelector
