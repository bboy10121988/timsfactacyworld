import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import CartRecommendations from "../components/cart-recommendations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="min-h-screen bg-white" data-testid="cart-container">
      {/* Header Section */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-light text-gray-900 tracking-wide uppercase">
            Shopping Bag
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="cart-content">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items - 2/3 width */}
            <div className="lg:col-span-2 space-y-8" data-testid="cart-items">
              <ItemsTemplate cart={cart} />
              
              {/* Continue Shopping */}
              <div className="pt-8 border-t border-gray-100">
                <LocalizedClientLink 
                  href="/"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors inline-flex items-center gap-2 uppercase tracking-wide"
                >
                  <span>←</span>
                  Continue Shopping
                </LocalizedClientLink>
              </div>
            </div>
            
            {/* Order Summary - 1/3 width */}
            <div className="lg:col-span-1" data-testid="cart-summary">
              <div className="sticky top-8 space-y-8">
                {!customer && <SignInPrompt />}
                <Summary cart={cart as any} />
                
                {/* Security badges */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 uppercase tracking-wide">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Secure Payment</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Visa, Mastercard, ApplePay, JCB, PayPal
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 uppercase tracking-wide">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🚚</span>
                      </div>
                      <span>Free Delivery over NT$1,500</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 uppercase tracking-wide">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">↩</span>
                      </div>
                      <span>30 Days Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div data-testid="cart-empty">
            <EmptyCartMessage />
          </div>
        )}
        
        {/* Recommendations Section - You Might Also Like */}
        {cart?.items?.length && (
          <div className="mt-20 pt-16 border-t border-gray-100">
            <CartRecommendations cart={cart} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
