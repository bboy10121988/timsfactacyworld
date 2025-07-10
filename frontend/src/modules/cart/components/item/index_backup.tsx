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
      className={clx("w-full cart-table-row", {
        "cart-updating": updating
      })} 
      data-testid="product-row"
    >
      <Table.Cell className="!pl-0 p-4 w-24" data-label="商品圖片">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex cart-product-image", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left" data-label="商品資訊">
        <div className="cart-product-info">
          <Text
            className="cart-product-title"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          <div className="cart-product-variant">
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
          </div>
        </div>
      </Table.Cell>

      {type === "full" && (
        <Table.Cell data-label="數量">
          <div className="cart-quantity-controls">
            <DeleteButton 
              id={item.id} 
              data-testid="product-delete-button"
              className="cart-delete-button cart-tooltip"
              data-tooltip="移除商品"
            />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className={clx("cart-quantity-select", {
                "updating": updating
              })}
              data-testid="product-select-button"
              disabled={updating}
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner className="cart-spinner ml-2" />}
          </div>
          <div className={error ? "cart-error-message" : ""}>
            <ErrorMessage 
              error={error} 
              data-testid="product-error-message"
            />
          </div>
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell" data-label="單價">
          <div className="cart-price-unit">
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
              className="cart-price-current"
            />
          </div>
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0" data-label="小計">
        <div className="flex justify-end w-full">
          {type === "preview" && (
            <div className="flex flex-col items-end gap-y-1 text-sm min-w-0">
              <div className="flex items-center gap-x-2 whitespace-nowrap">
                <Text className="text-ui-fg-muted text-xs">數量:</Text>
                <Text className="text-ui-fg-base text-xs font-medium">{item.quantity}</Text>
              </div>
              <div className="flex items-center gap-x-2 whitespace-nowrap">
                <Text className="text-ui-fg-muted text-xs">單價:</Text>
                <div className="text-right">
                  <LineItemUnitPrice
                    item={item}
                    style="tight"
                    currencyCode={currencyCode}
                    className="text-xs cart-price-current"
                  />
                </div>
              </div>
              <div className="flex items-center gap-x-2 whitespace-nowrap">
                <Text className="text-ui-fg-muted text-xs">小計:</Text>
                <div className="text-right">
                  <LineItemPrice
                    item={item}
                    style="tight"
                    currencyCode={currencyCode}
                    className="text-xs font-medium cart-price-total"
                  />
                </div>
              </div>
            </div>
          )}
          {type === "full" && (
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
              className={clx("cart-price-total", {
                "updated": isAnimating
              })}
            />
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
