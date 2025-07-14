"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)
    setIsAnimating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
        setTimeout(() => setIsAnimating(false), 500)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Table.Row 
      className={clx("group hover:bg-gray-25 transition-colors", {
        "opacity-60 pointer-events-none": updating
      })} 
      data-testid="product-row"
    >
      {/* Product Image */}
      <Table.Cell className="py-6 pr-4">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="block w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="w-full h-full object-cover"
          />
        </LocalizedClientLink>
      </Table.Cell>

      {/* Product Info */}
      <Table.Cell className="py-6 pr-4">
        <div className="space-y-2">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="block hover:text-gray-600 transition-colors"
          >
            <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
              {item.product_title}
            </h3>
          </LocalizedClientLink>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            <LineItemOptions variant={item.variant} />
          </div>
        </div>
      </Table.Cell>

      {/* Quantity & Remove */}
      {type === "full" && (
        <Table.Cell className="py-6 px-4 text-center">
          <div className="space-y-3">
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="mx-auto w-16 text-center border border-gray-300 rounded text-sm"
              disabled={updating}
            >
              {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              ))}
            </CartItemSelect>
            
            <DeleteButton 
              id={item.id}
              className="block mx-auto text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wide"
            >
              Remove
            </DeleteButton>
          </div>
          
          {error && (
            <div className="mt-2 text-xs text-red-500">
              <ErrorMessage error={error} />
            </div>
          )}
        </Table.Cell>
      )}

      {/* Unit Price */}
      {type === "full" && (
        <Table.Cell className="py-6 px-4 text-right hidden lg:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
            className="text-sm font-medium text-gray-900"
          />
        </Table.Cell>
      )}

      {/* Total Price */}
      <Table.Cell className="py-6 text-right">
        <LineItemPrice
          item={item}
          style="tight"
          currencyCode={currencyCode}
          className={clx("text-lg font-semibold text-gray-900", {
            "animate-pulse": isAnimating
          })}
        />
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
