"use client"

import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import { useEffect, useState } from "react"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const [products, setProducts] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      const queryParams: PaginatedProductsParams = {
        limit: 12,
      }

      if (collectionId) {
        queryParams["collection_id"] = [collectionId]
      }

      if (categoryId) {
        queryParams["category_id"] = [categoryId]
      }

      if (productsIds) {
        queryParams["id"] = productsIds
      }

      if (sortBy === "created_at") {
        queryParams["order"] = "created_at"
      }

      const region = await getRegion(countryCode)

      if (!region) {
        return
      }

      const {
        response: { products: fetchedProducts, count },
      } = await listProductsWithSort({
        page,
        queryParams,
        sortBy,
        countryCode,
      })

      setProducts(fetchedProducts)
      setTotalPages(Math.ceil(count / PRODUCT_LIMIT))
    }

    fetchProducts()
  }, [collectionId, categoryId, productsIds, sortBy, page, countryCode])

  return (
    <div className="flex flex-col">
      <div className="mb-8 px-4 md:px-8 lg:px-12 flex justify-center">
        <RefinementList sortBy={sortBy || "created_at"} />
      </div>
      <div>
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-4 bg-white"
          data-testid="products-list"
        >
          {products.map((p) => {
            return (
              <li key={p.id} className="bg-white">
                <ProductPreview product={p} countryCode={countryCode} />
              </li>
            )
          })}
        </ul>
        {totalPages > 1 && (
          <div className="mt-8 px-4 md:px-8 lg:px-12 flex justify-center">
            <Pagination
              data-testid="product-pagination"
              page={page}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}
