"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="space-y-6">
      {/* Discount Code */}
      <DiscountCode cart={cart} />
      
      {/* Price Breakdown */}
      <div className="space-y-4">
        <CartTotals totals={cart} />
      </div>
      
      {/* Checkout Button */}
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="block"
      >
        <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium uppercase tracking-wide transition-colors">
          Proceed to Checkout
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
