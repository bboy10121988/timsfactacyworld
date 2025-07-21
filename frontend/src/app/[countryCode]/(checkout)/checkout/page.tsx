import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "結帳",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" style={{ background: "var(--bg-secondary)" }}>
      {/* Header with subtle brand accent */}
      <div className="border-b bg-white/80 backdrop-blur-sm" style={{ 
        borderColor: "var(--border-primary)", 
        backgroundColor: "var(--bg-primary)" 
      }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6">
          <h1 className="text-2xl font-light tracking-wide" style={{ color: "var(--text-primary)" }}>
            結帳
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>安全結帳流程</p>
        </div>
      </div>

      {/* Main content with improved spacing */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8">
          {/* Left column - Checkout form */}
          <div className="order-2 lg:order-1">
            <PaymentWrapper cart={cart}>
              <CheckoutForm cart={cart} customer={customer} />
            </PaymentWrapper>
          </div>
          
          {/* Right column - Order summary */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <CheckoutSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
