"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit

  const region = regionId
    ? await retrieveRegion(regionId)
    : countryCode
    ? await getRegion(countryCode)
    : null

  if (!region) {
    throw new Error("Could not find region")
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(`/store/products`, {
      method: "GET",
      query: {
        ...queryParams,
        limit,
        offset,
        region_id: region.id,
        fields: "*options.values,*variants.options.option,+variants.inventory_quantity,+metadata",
      },
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      next: { revalidate: 0 },
      cache: "no-store",
    })
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 * No caching is used to ensure data is always fresh.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * 獲取單一產品的詳細資訊，並確保包含庫存資訊
 */
export const getProduct = async ({
  handle,
  countryCode,
  regionId,
}: {
  handle: string
  countryCode?: string
  regionId?: string
}): Promise<HttpTypes.StoreProduct> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const region = regionId
    ? await retrieveRegion(regionId)
    : countryCode
    ? await getRegion(countryCode)
    : null

  if (!region) {
    throw new Error("Could not find region")
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      query: {
        handle,
        region_id: region.id,
        fields: "*options.values,*variants.options.option,+variants.inventory_quantity,+metadata",
      },
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      next: { revalidate: 0 },
      cache: "no-store",
    })
    .then(({ products }) => {
      if (products.length === 0) {
        throw new Error(`Product with handle: ${handle} was not found`);
      }
      return products[0];
    })
}
