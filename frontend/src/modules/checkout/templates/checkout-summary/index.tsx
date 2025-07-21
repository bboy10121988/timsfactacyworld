import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="shadow-sm border overflow-hidden" style={{ 
      backgroundColor: "var(--bg-primary)", 
      borderColor: "var(--border-primary)" 
    }}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ 
        background: "linear-gradient(to right, var(--bg-secondary), var(--bg-primary))", 
        borderColor: "var(--border-primary)" 
      }}>
        <Heading
          level="h2"
          className="text-xl font-medium tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          訂單摘要
        </Heading>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          {cart.items?.length || 0} 件商品
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-8">
        {/* Items */}
        <div>
          <ItemsPreviewTemplate cart={cart} />
        </div>

        {/* Discount Code */}
        <div className="border-t pt-6" style={{ borderColor: "var(--border-primary)" }}>
          <DiscountCode cart={cart} />
        </div>

        {/* Order Totals */}
        <div className="border-t pt-6" style={{ borderColor: "var(--border-primary)" }}>
          <CartTotals totals={cart} />
        </div>

        {/* Security badges */}
        <div className="border-t pt-6" style={{ borderColor: "var(--border-primary)" }}>
          <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>SSL 安全加密</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>安全付款</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
