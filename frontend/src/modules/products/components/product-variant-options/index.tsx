"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import { isEqual } from "lodash"
import ProductOptions from "../product-options"
import VariantSelector from "../variant-selector"

type ProductVariantOptionsProps = {
  product: HttpTypes.StoreProduct
  onVariantChange?: (variant: HttpTypes.StoreProductVariant | undefined) => void
}

const ProductVariantOptions = ({ 
  product, 
  onVariantChange 
}: ProductVariantOptionsProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | undefined>()

  // 將變體選項轉換為映射結構
  const optionsAsKeymap = (
    variantOptions: HttpTypes.StoreProductVariant["options"]
  ) => {
    return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
      acc[varopt.option_id] = varopt.value
      return acc
    }, {})
  }

  // 初始化選擇第一個變體（如果存在）
  useEffect(() => {
    if (product.variants && product.variants.length > 0 && Object.keys(selectedOptions).length === 0) {
      // 找到一個有庫存的變體作為默認選擇（考慮三種情況）
      const inStockVariant = product.variants.find(v => 
        !v.manage_inventory || 
        v.allow_backorder || 
        (v.inventory_quantity !== undefined && v.inventory_quantity > 0)
      );
      
      // 如果有庫存的變體，選擇它，否則選擇第一個變體
      const defaultVariant = inStockVariant || product.variants[0];
      
      if (defaultVariant) {
        const variantOptions = optionsAsKeymap(defaultVariant.options);
        setSelectedOptions(variantOptions || {});
      }
    }
  }, [product.variants, selectedOptions]);

  // 根據選項查找相應的變體
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) return;
    
    // 僅在有選項被選中時嘗試查找變體
    if (Object.keys(selectedOptions).length > 0) {
      const matchingVariant = product.variants.find(variant => {
        const variantOptions = optionsAsKeymap(variant.options);
        return isEqual(variantOptions, selectedOptions);
      });
      
      setSelectedVariant(matchingVariant);
      
      // 如果找到匹配的變體並且提供了回調，則調用它
      if (onVariantChange) {
        onVariantChange(matchingVariant);
      }
    }
  }, [selectedOptions, product.variants, onVariantChange]);

  // 當選項變更時
  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  }

  // 當變體變更時
  const handleVariantChange = (variant: HttpTypes.StoreProductVariant) => {
    // 更新選項狀態
    const variantOptions = optionsAsKeymap(variant.options);
    setSelectedOptions(variantOptions || {});
  }

  // 檢查產品是否有變體和選項
  if (!product.variants || product.variants.length === 0 || !product.options || product.options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 產品選項選擇器 */}
      <ProductOptions 
        product={product} 
        selectedOptions={selectedOptions}
        onOptionChange={handleOptionChange}
      />
      
      {/* 庫存信息 */}
      {selectedVariant && (
        <div className="flex items-center text-sm mt-4 border-t pt-4 border-gray-200">
          <span className="mr-2 font-medium">庫存狀態:</span>
          {!selectedVariant.manage_inventory || 
           selectedVariant.allow_backorder || 
           (selectedVariant.inventory_quantity !== undefined && selectedVariant.inventory_quantity > 0) ? (
            <span className="text-green-700">
              有庫存
            </span>
          ) : (
            <span className="text-red-600">
              目前缺貨
            </span>
          )}
          
          {selectedVariant.sku && (
            <span className="ml-4 text-gray-500">
              SKU: <span className="text-gray-700">{selectedVariant.sku}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductVariantOptions
