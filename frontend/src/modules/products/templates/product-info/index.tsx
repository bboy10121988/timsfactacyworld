import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  // 從 metadata 獲取產品特點，如果存在的話
  const features = product.metadata && typeof product.metadata.features === 'string' 
    ? product.metadata.features.split(',') 
    : []

  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      {/* 產品描述 - 精簡版 */}
      <div>
        <h3 className="uppercase text-xs tracking-wider mb-2 font-medium">商品描述</h3>
        <Text
          className="text-sm text-gray-800 leading-relaxed whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>

      {/* 產品特點清單 - 只在有特點時顯示 */}
      {features.length > 0 && (
        <div className="mt-3">
          <h3 className="uppercase text-xs tracking-wider mb-2 font-medium">特點</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-1">
            {features.map((feature: string, index: number) => (
              <li key={index} className="text-sm">{feature.trim()}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 顯示產品分類 - 簡化版 */}
      {product.categories && product.categories.length > 0 && (
        <div className="mt-3">
          <h3 className="uppercase text-xs tracking-wider mb-2 font-medium">分類</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {product.categories.map((category) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="text-xs bg-gray-100 px-2 py-1 hover:bg-gray-200 transition-colors uppercase tracking-wide"
              >
                {category.name}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
