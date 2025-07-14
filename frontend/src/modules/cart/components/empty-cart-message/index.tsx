import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div className="text-center py-16 px-4" data-testid="empty-cart-message">
      <div className="max-w-md mx-auto space-y-6">
        {/* Empty cart icon */}
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-light text-gray-900 tracking-wide uppercase">
            Your Bag is Empty
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            You have no items in your shopping cart.<br />
            Click here to continue shopping.
          </p>
        </div>
        
        <div className="pt-4">
          <LocalizedClientLink 
            href="/"
            className="inline-block px-8 py-3 bg-gray-900 text-white text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </LocalizedClientLink>
        </div>
        
        {/* Service features */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 text-xs text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <span>🚚</span>
              <span>Free delivery over NT$1,500</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>↩️</span>
              <span>Free returns within 30 days</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>📞</span>
              <span>Customer service available 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyCartMessage
