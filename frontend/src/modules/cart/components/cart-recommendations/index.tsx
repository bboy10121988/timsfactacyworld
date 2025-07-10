import React from "react"
import { HttpTypes } from "@medusajs/types"
import { getFeaturedProducts } from "@lib/data/recommendations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type CartRecommendationsProps = {
  cart: HttpTypes.StoreCart
}

const CartRecommendations = async ({ cart }: CartRecommendationsProps) => {
  // 獲取購物車中的商品 ID，過濾掉 undefined
  const cartProductIds = cart.items?.map(item => item.product_id).filter((id): id is string => Boolean(id)) || []
  
  // 獲取精選商品（從後端設定的精選商品中取得）
  const featuredProducts = await getFeaturedProducts(8)
  
  // 過濾掉購物車中已有的商品，並限制為 4 個商品
  const recommendations = featuredProducts
    .filter((product: HttpTypes.StoreProduct) => !cartProductIds.includes(product.id))
    .slice(0, 4)
  
  if (!recommendations.length) return null

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-light text-gray-900 tracking-wide uppercase mb-2">
          You Might Also Like
        </h2>
        <p className="text-sm text-gray-600">
          Complete your look with these carefully selected items
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <LocalizedClientLink
            key={product.id}
            href={`/products/${product.handle}`}
            className="group"
          >
            <div className="space-y-4">
              {/* Product Image */}
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                <Thumbnail
                  thumbnail={product.thumbnail}
                  images={product.images}
                  size="full"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Product Info */}
              <div className="space-y-2 text-center">
                <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide group-hover:text-gray-600 transition-colors">
                  {product.title}
                </h3>
                
                <div className="text-sm font-medium text-gray-900">
                  從 NT$299 起
                </div>
                
                {/* Buy X Get Y Label if applicable */}
                {product.metadata?.buyXGetY && typeof product.metadata.buyXGetY === 'string' && (
                  <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded uppercase tracking-wide">
                    {product.metadata.buyXGetY}
                  </div>
                )}
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
      
      {/* View All Products Link */}
      <div className="text-center">
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors uppercase tracking-wide border-b border-gray-300 hover:border-gray-600"
        >
          View All Products
          <span>→</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default CartRecommendations
