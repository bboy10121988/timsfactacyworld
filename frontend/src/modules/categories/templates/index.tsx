import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="flex flex-col pt-16 pb-6 content-container"
      data-testid="category-container"
    >
      {/* 分類麵包屑和標題 */}
      <div className="flex flex-col mb-8 text-center">
        <div className="flex flex-row justify-center">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle h1">
                <LocalizedClientLink
                  className="mr-4 hover:text-black"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
                /
              </span>
            ))}
          <h1 className="h1" data-testid="category-page-title">{category.name}</h1>
        </div>

        {category.description && (
          <div className="mt-2 text-content">
            <p>{category.description}</p>
          </div>
        )}
      </div>

      {/* 子分類 */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-4 flex-wrap">
            {category.category_children?.map((c) => (
              <LocalizedClientLink
                key={c.id}
                href={`/categories/${c.handle}`}
                className="inline-block px-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-full"
              >
                {c.name}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <Suspense
        fallback={
          <SkeletonProductGrid
            numberOfProducts={category.products?.length ?? 8}
          />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          categoryId={category.id}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}
