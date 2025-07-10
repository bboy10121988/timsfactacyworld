import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items || []
  
  return (
    <div className="space-y-6">
      {items.length > 0
        ? items
            .sort((a, b) => {
              return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            })
            .map((item) => {
              return (
                <div key={item.id} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <Item
                    item={item}
                    currencyCode={cart?.currency_code || "TWD"}
                  />
                </div>
              )
            })
        : repeat(3).map((i) => {
            return (
              <div key={i} className="bg-white border border-gray-200 p-6">
                <SkeletonLineItem />
              </div>
            )
          })}
    </div>
  )
}

export default ItemsTemplate
