"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import ProductInfoTab from "../product-info-tab"
import ImageGalleryTab from "../image-gallery-tab"
import ShippingInfoTab from "../shipping-info-tab"
import CategoriesAndTagsTab from "../categories-and-tags-tab"
import DetailedSpecsTab from "../detailed-specs-tab"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "產品資訊",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "詳細規格",
      component: <DetailedSpecsTab product={product} />,
    },
    {
      label: "商品相簿",
      component: <ImageGalleryTab product={product} />,
    },
    {
      label: "分類與標籤",
      component: <CategoriesAndTagsTab product={product} />,
    },
    {
      label: "運送與退貨",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="small"
            value={tab.label}
            className="border-b border-gray-200 last:border-b-0"
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default ProductTabs
