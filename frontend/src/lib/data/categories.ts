import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

type CacheOptions = {
  revalidate?: number
  tags?: string[]
}

const defaultCacheOptions: CacheOptions = {
  revalidate: 60, // 快取 60 秒
  tags: ["categories"],
}

export const listCategories = async (query?: Record<string, any>) => {
  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit: query?.limit || 100,
          ...query,
        },
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
        },
        next: defaultCacheOptions,
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
        },
        next: defaultCacheOptions,
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
