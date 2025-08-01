import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import ProductTabs from "@modules/products/components/product-tabs"
import ProductInfoTab from "@modules/products/components/product-info-tab"
import LiveInventory from "@modules/products/components/live-inventory"
import ReturnPolicyAccordion from "@modules/products/components/return-policy-accordion"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { ProductActionProvider } from "@lib/context/product-context"
import { HttpTypes } from "@medusajs/types"
import StoreName from "@modules/products/components/store-name"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-white">
      {/* 麵包屑導航 - 簡潔風格 */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-6 pb-4">
        <nav className="flex text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li key="home" className="inline-flex items-center">
              <a href="/" className="text-sm text-gray-500 hover:text-black uppercase tracking-wide">
                首頁
              </a>
            </li>
            {product.collection && (
              <li key={`collection-${product.collection.id}`}>
                <div className="flex items-center">
                  <span className="mx-2 text-sm text-gray-400">/</span>
                  <a href={`/collections/${product.collection.handle}`} className="text-sm text-gray-500 hover:text-black uppercase tracking-wide">
                    {product.collection.title}
                  </a>
                </div>
              </li>
            )}
            <li key={`product-${product.id}`}>
              <div className="flex items-center">
                <span className="mx-2 text-sm text-gray-400">/</span>
                <span className="text-sm text-gray-800 uppercase tracking-wide" aria-current="page">
                  {product.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* 主要商品區塊 - 優化配置 */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-6" data-testid="product-container">
        {/* 左側：圖片區塊 */}
        <div className="md:sticky md:top-24 self-start">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* 右側：商品資訊區塊 */}
        <div className="flex flex-col gap-y-6">
          {/* 品牌名稱 */}
          <StoreName />
          
          {/* 產品標題 */}
          <h1 className="text-2xl font-light uppercase tracking-wide">{product.title}</h1>
          
          {/* 產品副標題 */}
          {product.subtitle && (
            <p className="text-base text-gray-600 mt-1">{product.subtitle}</p>
          )}
          
          {/* 產品行動區塊 - 購買選項 */}
          <ProductActionProvider>
            <Suspense
              fallback={
                <div className="py-4 h-[40px] animate-pulse bg-gray-100 rounded"></div>
              }
            >
              <ProductActions product={product} />
            </Suspense>
          </ProductActionProvider>

          {/* 產品資訊 - 直接顯示，不需要展開 */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <ProductInfoTab product={product} />
          </div>

          {/* 其他產品標籤 - 保持展開收合功能 */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* 相關商品 */}
      <div className="bg-gray-50 py-12">
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto" data-testid="related-products-container">
          <h2 className="text-xl font-medium mb-6 text-center">你可能也會喜歡</h2>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
