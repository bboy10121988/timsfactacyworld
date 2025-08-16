import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import InfiniteScrollProducts from "./infinite-scroll-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  console.log("🏪 StoreTemplate rendered with:", {
    sortBy,
    page,
    countryCode
  })
  
  const sort = sortBy || "created_at"

  return (
    <div className="content-container pt-0 pb-8" data-testid="category-container">
      <div className="mb-12 pt-8 px-4 md:px-8 lg:px-12 text-center">
        <h1 className="h1" data-testid="store-page-title">全部商品</h1>
      </div>
      <Suspense fallback={<SkeletonProductGrid />}>
        <InfiniteScrollProducts
          sortBy={sort}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
