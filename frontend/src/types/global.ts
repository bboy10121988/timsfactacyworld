import { StorePrice } from "@medusajs/types"

export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

export type SanityHeader = {
  logo?: {
    url: string
    alt: string
  }
  storeName?: string
  navigation?: {
    name: string
    href: string
  }[]
  marquee?: {
    enabled?: boolean
    text1?: {
      enabled?: boolean
      content?: string
    }
    text2?: {
      enabled?: boolean
      content?: string
    }
    text3?: {
      enabled?: boolean
      content?: string
    }
    linkUrl?: string
    pauseOnHover?: boolean
  }
}
