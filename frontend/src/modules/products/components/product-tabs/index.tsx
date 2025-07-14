"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import CategoriesAndTagsTab from "../categories-and-tags-tab"
import ShippingInfoTab from "../shipping-info-tab"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "分類與標籤",
      component: <CategoriesAndTagsTab product={product} />,
    },
    {
      label: "運送與退貨",
      component: <ShippingInfoTab product={product} />,
    },
  ]

  return (
    <Accordion type="multiple">
      {tabs.map((tab, i) => (
        <Accordion.Item
          title={tab.label}
          value={i.toString()}
          key={i}
        >
          {tab.component}
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

export default ProductTabs
