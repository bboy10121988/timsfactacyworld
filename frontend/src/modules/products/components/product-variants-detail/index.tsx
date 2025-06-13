"use client"

import { HttpTypes } from "@medusajs/types"
import { Heading, Text, Container, Accordion } from "@medusajs/ui"

type ProductVariantsDetailProps = {
  product: HttpTypes.StoreProduct
}

const ProductVariantsDetail = ({ product }: ProductVariantsDetailProps) => {
  if (!product.variants || product.variants.length === 0) {
    return null
  }

  return (
    <Container className="py-12">
      <Heading level="h3" className="text-xl mb-6">
        產品變體詳情
      </Heading>
      <Accordion type="multiple">
        {product.variants.map((variant) => (
          <Accordion.Item
            key={variant.id}
            title={variant.title}
            headingSize="small"
            value={variant.id}
          >
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <Text className="font-semibold">變體 ID</Text>
                <Text>{variant.id}</Text>
              </div>
              <div>
                <Text className="font-semibold">SKU</Text>
                <Text>{variant.sku || "-"}</Text>
              </div>
              <div>
                <Text className="font-semibold">庫存數量</Text>
                <Text>{variant.inventory_quantity !== undefined ? variant.inventory_quantity : "-"}</Text>
              </div>
              <div>
                <Text className="font-semibold">管理庫存</Text>
                <Text>{variant.manage_inventory !== undefined ? (variant.manage_inventory ? "是" : "否") : "-"}</Text>
              </div>
              <div>
                <Text className="font-semibold">允許缺貨訂購</Text>
                <Text>{variant.allow_backorder !== undefined ? (variant.allow_backorder ? "是" : "否") : "-"}</Text>
              </div>
              <div>
                <Text className="font-semibold">條碼</Text>
                <Text>{variant.barcode || "-"}</Text>
              </div>
              {variant.options && variant.options.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  <Text className="font-semibold mb-2">選項</Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {variant.options.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <Text className="mr-2">{option.option?.title || "選項"}:</Text>
                        <Text className="bg-gray-100 px-2 py-1 rounded">{option.value}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {variant.prices && variant.prices.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  <Text className="font-semibold mb-2">價格</Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {variant.prices.map((price) => (
                      <div key={price.id} className="bg-gray-50 p-2 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <Text className="font-medium">{price.currency_code.toUpperCase()}</Text>
                          <Text>{price.amount / 100} {price.currency_code.toUpperCase()}</Text>
                        </div>
                        {price.region_id && (
                          <Text className="text-xs text-gray-500">地區: {price.region_id}</Text>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  )
}

export default ProductVariantsDetail
