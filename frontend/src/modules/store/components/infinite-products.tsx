"use client"

import { useEffect, useState } from "react"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"

const LIMIT = 12

type InfiniteProductsProps = {
  initialProducts: HttpTypes.StoreProduct[]
  params: {
    countryCode: string
    queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  }
  totalCount: number
}

export default function InfiniteProducts({
  initialProducts,
  params,
  totalCount,
}: InfiniteProductsProps) {
  const [products, setProducts] = useState(initialProducts)
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount)
  const [isLoading, setIsLoading] = useState(false)
  const [pageParam, setPageParam] = useState(2) // 從第2頁開始，因為第1頁已經載入

  // 簡單的 intersection observer
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!observerTarget) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget)
    return () => observer.disconnect()
  }, [observerTarget, hasMore, isLoading])

  const fetchMoreProducts = async () => {
    setIsLoading(true)
    try {
      const { response } = await listProducts({
        pageParam,
        countryCode: params.countryCode,
        queryParams: {
          ...params.queryParams,
          limit: LIMIT,
        },
      })

      setProducts((prev) => [...prev, ...response.products])
      setPageParam((prev) => prev + 1)
      setHasMore(products.length + response.products.length < totalCount)
    } catch (error) {
      console.error("載入更多商品時出錯:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 content-container">
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-0">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div
          className="py-16 flex items-center justify-center"
          ref={setObserverTarget}
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          )}
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <div className="py-16 text-center text-gray-500">
          已顯示所有商品
        </div>
      )}
    </div>
  )
}
