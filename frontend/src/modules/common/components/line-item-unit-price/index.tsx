import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  className?: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
  className,
}: LineItemUnitPriceProps) => {
  const { total, original_total } = item
  const hasReducedPrice = total < original_total

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center">
      {hasReducedPrice && (
        <span
          className="line-through text-xs"
          data-testid="product-unit-original-price"
        >
          {convertToLocale({
            amount: original_total / item.quantity,
            currency_code: currencyCode,
          })}
        </span>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        }, className)}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: total / item.quantity,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
