import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"
import InfiniteProducts from "@modules/store/components/infinite-products"

const PRODUCT_LIMIT = 12

export default async function InfiniteScrollProducts({
  sortBy,
  countryCode,
}: {
  sortBy: SortOptions
  countryCode: string
}) {
  console.log("🏪 InfiniteScrollProducts called with:", {
    sortBy,
    countryCode
  })

  const region = await getRegion(countryCode)

  if (!region) {
    console.log("🏪 InfiniteScrollProducts - No region found for:", countryCode)
    return null
  }

  console.log("🏪 InfiniteScrollProducts - Region found:", {
    id: region.id,
    name: region.name
  })

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      limit: PRODUCT_LIMIT,
    },
    countryCode,
  })

  console.log("🏪 InfiniteScrollProducts - Products loaded:", {
    count: products?.length,
    totalCount: count,
    productIds: products?.map(p => p.id)
  })

  const sortedProducts = sortProducts(products, sortBy)

  console.log("🏪 InfiniteScrollProducts - Products sorted:", {
    sortBy,
    sortedCount: sortedProducts?.length
  })

  return (
    <InfiniteProducts
      initialProducts={sortedProducts}
      params={{
        countryCode,
        queryParams: {
          limit: PRODUCT_LIMIT,
        },
      }}
      totalCount={count}
    />
  )
}
