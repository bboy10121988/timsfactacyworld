import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const CategoriesAndTagsTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        {/* 分類 */}
        <div>
          <h3 className="text-base font-semibold mb-4">商品分類</h3>
          <div className="grid grid-cols-1 gap-y-2">
            {product.collection ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{product.collection.title}</span>
              </div>
            ) : (
              <span className="text-gray-500">此商品尚未分類</span>
            )}
          </div>
        </div>

        {/* 標籤 */}
        <div>
          <h3 className="text-base font-semibold mb-4">商品標籤</h3>
          <div className="flex flex-wrap gap-2">
            {product.tags && product.tags.length > 0 ? (
              product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag.value}
                </span>
              ))
            ) : (
              <span className="text-gray-500">此商品尚未設定標籤</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesAndTagsTab
