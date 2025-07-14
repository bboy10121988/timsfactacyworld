"use client"

import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"

// 自定義連接器組件，實現ProductActions和變體選擇器的連接
export default function ProductActionsConnector({
  children,
  product,
}: {
  children: React.ReactNode
  product: HttpTypes.StoreProduct
}) {
  const searchParams = useSearchParams()
  const variantId = searchParams.get("variant")
  
  // 在這裡可以添加處理變體選擇的邏輯
  // 例如檢查URL中的變體參數並設置默認選中狀態
  
  return (
    <div className="product-actions-connector">
      {children}
    </div>
  )
}
