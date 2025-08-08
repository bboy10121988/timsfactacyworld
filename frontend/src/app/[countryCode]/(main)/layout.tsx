import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import { getHeader } from "@lib/sanity"
import { SanityHeader } from "../../../types/global"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  // 獲取 header 資料來計算動態高度
  const headerData = await getHeader() as SanityHeader
  
  // 整合後的導航高度計算：所有部分都在同一個 sticky 容器內
  const marqueeHeight = 36 // h-9 跑馬燈
  const mobileNavHeight = 48 // h-12 主導覽（手機）
  const desktopNavHeight = 64 // lg:h-16 主導覽（桌機）
  const categoryNavHeight = 38 // 分類導覽列（py-2 + 文字高度）
  
  // 整合容器的總高度
  // 手機：跑馬燈 + 主導覽（分類列隱藏）
  const mobileIntegratedHeight = marqueeHeight + mobileNavHeight
  // 桌機：跑馬燈 + 主導覽 + 分類導覽
  const desktopIntegratedHeight = marqueeHeight + desktopNavHeight + categoryNavHeight

  return (
    <>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {/* 暫時註釋免運費提示組件以修復 SSR 錯誤 */}
      {/* {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )} */}
      {/* 內容無上間距 - 直接貼齊 sticky 導覽列底部 */}
      <main>
        {props.children}
      </main>
    </>
  )
}
