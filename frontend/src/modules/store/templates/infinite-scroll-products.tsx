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
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      limit: PRODUCT_LIMIT,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

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
