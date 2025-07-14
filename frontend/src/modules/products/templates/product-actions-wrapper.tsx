"use client"

import { ProductActionProvider } from "@lib/context/product-context"
import ProductActions from "@modules/products/components/product-actions"
import { HttpTypes } from "@medusajs/types"
import { getProduct } from "@lib/data/products"

type ProductActionsWrapperProps = {
  id: string
  region: HttpTypes.StoreRegion
}

const ProductActionsWrapper = async ({ id, region }: ProductActionsWrapperProps) => {
  try {
    // 從伺服器獲取完整產品資訊
    const product = await getProduct({
      handle: id,
      regionId: region.id
    })

    return (
      <ProductActionProvider>
        <ProductActions
          product={product}
          disabled={false}
        />
      </ProductActionProvider>
    )
  } catch (error) {
    console.error("無法載入產品:", error)
    return <div>無法載入產品資訊</div>
  }
}

export default ProductActionsWrapper
