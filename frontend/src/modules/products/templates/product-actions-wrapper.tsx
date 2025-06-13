"use client"

import { ProductActionProvider } from "@lib/context/product-context"
import ProductActions from "@modules/products/components/product-actions"
import { HttpTypes } from "@medusajs/types"

type ProductActionsWrapperProps = {
  id: string
  region: HttpTypes.StoreRegion
}

const ProductActionsWrapper = ({ id, region }: ProductActionsWrapperProps) => {
  // Get full product from server using id
  // ... (server call would go here)

  return (
    <ProductActionProvider>
      <ProductActions
        product={product}
        disabled={true}
      />
    </ProductActionProvider>
  )
}

export default ProductActionsWrapper
