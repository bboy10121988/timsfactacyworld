"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

import { useProductActions } from "@lib/context/product-context"
import { getProductPrice } from "@lib/util/get-product-price"
import { isSimpleProduct } from "@lib/util/product"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"
import OptionSelect from "./option-select"

import { HttpTypes } from "@medusajs/types"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  show: boolean
  variantStockStatus?: {
    hasStock: boolean
    canPreorder: boolean
    isSoldOut: boolean
  }
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  show,
  variantStockStatus,
}) => {
  const router = useRouter()
  const { state, open, close } = useToggleState()
  const { 
    addToCart, 
    options, 
    setOptions,
    inStock, 
    selectedVariant,
    isAdding 
  } = useProductActions()

  const price = getProductPrice({
    product: product,
    variantId: selectedVariant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price
    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  const updateOptions = (optionId: string, value: string) => {
    setOptions((prev: Record<string, string>) => {
      const updatedOptions = { ...prev }
      updatedOptions[optionId] = value
      return updatedOptions
    })
  }

  const handleAddToCart = async () => {
    try {
      await addToCart({
        variantId: selectedVariant!.id,
        quantity: 1,
        countryCode: "tw"
      })
      // 觸發全局更新事件
      window.dispatchEvent(new Event('cartUpdate'))
      close()
    } catch (error) {
      console.error("加入購物車失敗:", error)
    }
  }

  const handleBuyNow = async () => {
    try {
      await addToCart({
        variantId: selectedVariant!.id,
        quantity: 1,
        countryCode: "tw"
      })
      router.push("/cart")
    } catch (error) {
      console.error("立即購買失敗:", error)
    }
  }

  // 不再需要 canBackorder 邏輯，因為我們使用傳入的 variantStockStatus

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-white flex flex-col gap-y-3 justify-center items-center py-6 px-4 border-t border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-1">
                <span className="text-xl font-semibold">
                  {selectedPrice?.calculated_price}
                </span>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={variantStockStatus?.isSoldOut || !selectedVariant}
                className="w-full"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!selectedVariant
                  ? "選擇款式"
                  : variantStockStatus?.isSoldOut
                  ? "售完"
                  : variantStockStatus?.canPreorder
                  ? "預訂"
                  : "加入購物車"}
              </Button>
            </div>
            <Button
              onClick={handleBuyNow}
              variant="secondary"
              disabled={variantStockStatus?.isSoldOut || !selectedVariant}
              className="w-full border border-black"
            >
              {!selectedVariant
                ? "選擇款式"
                : variantStockStatus?.isSoldOut
                ? "售完"
                : variantStockStatus?.canPreorder
                ? "立即預訂"
                : "立即購買"}
            </Button>
            {!isSimple && (
              <button
                onClick={open}
                className="flex items-center justify-center text-sm font-semibold gap-x-2 py-2 w-full"
              >
                選擇規格
                <ChevronDown className="text-gray-600 h-4 w-4" />
              </button>
            )}
            
            {/* 顯示庫存狀態 */}
            {selectedVariant && (
              <div className="text-xs text-gray-500 text-center mt-1">
                {variantStockStatus?.hasStock
                  ? `庫存: ${selectedVariant.inventory_quantity || '充足'}`
                  : variantStockStatus?.canPreorder
                  ? "可預訂"
                  : variantStockStatus?.isSoldOut
                  ? "售完"
                  : "請選擇規格"}
              </div>
            )}
          </div>
        </Transition>

        <Transition appear show={state} as={Fragment}>
          <Dialog as="div" className="relative z-[75]" onClose={close}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed bottom-0 inset-x-0">
              <div className="flex min-h-full h-full items-end justify-center text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Panel className="flex flex-col w-full h-full transform overflow-hidden bg-white p-4 text-left align-middle transition-all max-h-[75vh]">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">選擇規格</div>
                      <button
                        onClick={close}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between mt-4">
                      <div className="flex flex-col gap-y-6">
                        {(product.variants?.length || 0) > 1 && (
                          <div className="flex flex-col gap-y-6">
                            {(product.options || []).map((option) => {
                              return (
                                <div key={option.id}>
                                  <OptionSelect
                                    option={option}
                                    current={options[option.id]}
                                    updateOption={updateOptions}
                                    title={option.title}
                                    data-testid="mobile-variant-select"
                                    disabled={false}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  )
}

export default MobileActions
