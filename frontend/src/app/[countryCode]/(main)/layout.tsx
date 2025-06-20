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
  
  // 精確計算：讓影片剛好接觸第二導覽列底部
  const marqueeHeight = 36 // h-9
  const mainNavHeight = 48 // h-12 (更合理的固定高度)
  const separatorHeight = 1 // border-t
  const categoryNavHeight = 30 // py-2 (16px) + text-sm (14px) = 30px
  
  // 小螢幕：跑馬燈 + 主導覽
  const smallScreenHeight = marqueeHeight + mainNavHeight
  // 大螢幕：跑馬燈 + 主導覽 + 分隔線 + 分類導覽
  const largeScreenHeight = marqueeHeight + mainNavHeight + separatorHeight + categoryNavHeight

  return (
    <>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {/* 內容無上間距 - 直接貼齊 sticky 導覽列底部 */}
      <main>
        {props.children}
      </main>
    </>
  )
}
