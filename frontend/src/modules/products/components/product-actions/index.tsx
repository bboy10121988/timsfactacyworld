"use client"

import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef } from "react"
import { isEqual } from "lodash"
import { useIntersection } from "@lib/hooks/use-in-view"
import { useProductActions } from "@lib/context/product-context"
import Divider from "@modules/common/components/divider"
import OptionSelect from "./option-select"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

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

  // 如果只有一個變體，預先選擇選項
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants, setOptions])

  const selectedVariantMemo = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const inStockMemo = useMemo(() => {
    if (selectedVariantMemo && !selectedVariantMemo.manage_inventory) {
      return true
    }
    if (selectedVariantMemo?.allow_backorder) {
      return true
    }
    if (
      selectedVariantMemo?.manage_inventory &&
      (selectedVariantMemo?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariantMemo])

  const handleAddToCart = async () => {
    if (!selectedVariantMemo?.id) return null
    await addToCart({
      variantId: selectedVariantMemo.id,
      quantity: 1,
      countryCode: "TW",
    })
  }

  const handleBuyNow = async () => {
    if (!selectedVariantMemo?.id) return null
    await addToCart({
      variantId: selectedVariantMemo.id,
      quantity: 1,
      countryCode: "TW",
    })
    router.push("/cart")
  }

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-6">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id} className="mb-2">
                    <h3 className="uppercase text-xs tracking-wider mb-3 font-medium">
                      {option.title}
                    </h3>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider className="my-2" />
            </div>
          )}
        </div>
        <ProductPrice product={product} variant={selectedVariantMemo} />
        <Button
          onClick={handleBuyNow}
          disabled={
            !inStockMemo ||
            !selectedVariantMemo ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          variant="primary"
          className="w-full h-12 uppercase tracking-wide text-sm font-light bg-black hover:bg-gray-800"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? "選擇款式"
            : !inStockMemo || !isValidVariant
            ? "缺貨中"
            : "立即購買"}
        </Button>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            onClick={handleAddToCart}
            variant="secondary"
            className="h-12 uppercase tracking-wide text-sm font-light border border-black hover:bg-gray-100"
            disabled={!inStockMemo || !selectedVariantMemo || !!disabled || isAdding || !isValidVariant}
          >
            加入購物車
          </Button>
          <Button
            onClick={handleBuyNow}
            variant="secondary"
            className="h-12 uppercase tracking-wide text-sm font-light border border-black hover:bg-gray-100"
            disabled={!inStockMemo || !selectedVariantMemo || !!disabled || isAdding || !isValidVariant}
          >
            立即購買
          </Button>
        </div>
        
        <MobileActions
          product={product}
          show={!inView}
        />
      </div>
    </>
  )
}