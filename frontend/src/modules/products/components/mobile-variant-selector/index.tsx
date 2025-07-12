"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { Button } from "@medusajs/ui"
import XIcon from "@modules/common/icons/x"
import { Text } from "@medusajs/ui"
import {
  ProductOption,
  ProductVariant,
} from "@medusajs/medusa"

type Props = {
  product: {
    options: ProductOption[]
    variants: ProductVariant[]
  }
  isOpen: boolean
  onClose: () => void
  countryCode?: string
}

export default function MobileVariantSelector({
  product,
  isOpen,
  onClose,
  countryCode = "tw"
}: Props) {
  if (!isOpen) {
    return null
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <Text className="text-xl font-bold">選擇規格</Text>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XIcon size={20} />
                  </button>
                </Dialog.Title>
                
                <div className="mt-4">
                  {product.options?.map((option) => (
                    <div key={option.id} className="mb-6">
                      <Text className="text-base mb-2">{option.title}</Text>
                      <div className="flex flex-wrap gap-2">
                        {option.values?.map((value) => (
                          <Button
                            key={value.id}
                            variant="secondary"
                            className="min-w-[80px]"
                            onClick={() => {}}
                          >
                            {value.value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={onClose} variant="primary">
                    完成選擇
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
