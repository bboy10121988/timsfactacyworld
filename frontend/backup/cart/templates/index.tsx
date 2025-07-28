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
      {/* Header Section - Maison Kitsuné Style */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-lg font-light text-gray-900 tracking-wider uppercase">
            Cart ({cart?.items?.length || 0} Articles)
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="cart-content">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items - 2/3 width */}
            <div className="lg:col-span-2 space-y-6" data-testid="cart-items">
              <ItemsTemplate cart={cart} />
            </div>
            
            {/* Checkout Summary - 1/3 width */}
            <div className="lg:col-span-1" data-testid="cart-summary">
              <div className="sticky top-8">
                <div className="bg-gray-50 p-6 space-y-6">
                  <h2 className="text-lg font-light text-gray-900 tracking-wider uppercase">
                    Checkout Summary
                  </h2>
                  
                  {!customer && <SignInPrompt />}
                  <Summary cart={cart as any} />
                  
                  {/* Delivery Info */}
                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <div className="flex justify-between mb-2">
                      <span>Delivery within 1 to 3 working days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return within 30 days</span>
                    </div>
                  </div>
                  
                  {/* Help Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span>Need help?</span>
                      <a href="tel:+886" className="ml-2 text-gray-900 underline">
                        +886 (0)1 4629 4463
                      </a>
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
        
        {/* You Might Also Like Section */}
        {cart?.items?.length && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <CartRecommendations cart={cart} />
          </div>
        )}
        
        {/* Security & Service Info - Bottom */}
        {cart?.items?.length && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  🔒
                </div>
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Secure Payment
                </h3>
                <p className="text-xs text-gray-600">
                  Visa, Mastercard, ApplePay, CB, Paypal
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  🚚
                </div>
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Delivery
                </h3>
                <p className="text-xs text-gray-600">
                  by DHL
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  ↩️
                </div>
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Return
                </h3>
                <p className="text-xs text-gray-600">
                  within 30 days
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  📞
                </div>
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Customer Service
                </h3>
                <p className="text-xs text-gray-600">
                  E-mail, phone, live chat, WhatsApp
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
