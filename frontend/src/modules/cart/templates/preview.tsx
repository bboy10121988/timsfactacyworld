import { Heading } from "@medusajs/ui"
import Item from "@modules/cart/components/item"
import { HttpTypes } from "@medusajs/types"

type ItemsPreviewTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsPreviewTemplateProps) => {
  const hasOverflow = cart?.items && cart.items.length > 4

  return (
    <div>
      <div className="flex items-center pb-3">
        <Heading className="text-[2rem] leading-[2.75rem]">
          In your Cart
        </Heading>
      </div>
      <div className="flex flex-col gap-y-4">
        {cart?.items
          ?.slice(0, 4)
          .sort((a, b) => {
            return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
          })
          ?.map((item) => (
            <Item
              key={item.id}
              item={item}
              type="preview"
              currencyCode={cart.region?.currency_code || 'TWD'}
            />
          ))}
        {hasOverflow && (
          <span className="text-small-regular text-ui-fg-base">
            + {(cart.items?.length || 0) - 4} more
          </span>
        )}
      </div>
    </div>
  )
}

export default ItemsPreviewTemplate
