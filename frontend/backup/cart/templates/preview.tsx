"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

import CheckoutItem from "@modules/checkout/components/checkout-item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  return (
    <div className="space-y-4">
      <div
        className={clx("space-y-4", {
          "max-h-[480px] overflow-y-auto pr-2": hasOverflow,
        })}
      >
        {items
          ? items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              })
              .map((item, index) => (
                <div 
                  key={item.id}
                  className={clx(
                    "border-b border-gray-100 last:border-b-0 pb-4 last:pb-0",
                    { "pt-4": index > 0 }
                  )}
                >
                  <CheckoutItem
                    item={item}
                    currencyCode={cart.currency_code}
                  />
                </div>
              ))
          : repeat(3).map((i) => (
              <div key={i} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                <SkeletonLineItem />
              </div>
            ))}
      </div>
    </div>
  )
}

export default ItemsPreviewTemplate
