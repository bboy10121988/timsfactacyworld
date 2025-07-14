// 全域型別定義

export interface FeaturedProduct {
  title: string
  handle: string
  collection_id: string
  description?: string
  isActive: boolean
}

export interface BlogPost {
  _id: string
  _type: string
  title: string
  slug: {
    current: string
  }
  mainImage?: {
    asset?: {
      url: string
    }
  }
  publishedAt: string
  excerpt?: string
  categories?: Array<{
    _id: string
    title: string
  }>
  author?: {
    name: string
    image?: any
  }
  status: string
  body?: any[]
}

export interface BaseSection {
  _type: string
  isActive?: boolean
}

export interface MainBannerSlide {
  heading?: string
  backgroundImage?: string
  backgroundImageAlt?: string
  buttonText?: string
  buttonLink?: string
}

export interface MainBannerSettings {
  autoplay?: boolean
  autoplaySpeed?: number
  showArrows?: boolean
  showDots?: boolean
}

export interface MainBannerSection extends BaseSection {
  _type: "mainBanner"
  slides?: MainBannerSlide[]
  settings?: MainBannerSettings
}

export interface ImageTextBlockSection extends BaseSection {
  _type: "imageTextBlock"
  heading?: string
  hideTitle?: boolean
  content?: any
  image?: {
    url: string
    alt: string
  }
  layout?: string
  leftImage?: {
    url: string
    alt: string
  }
  rightImage?: {
    url: string
    alt: string
  }
  leftContent?: any
  rightContent?: any
}

export interface FeaturedProductsSection extends BaseSection {
  _type: "featuredProducts"
  heading?: string
  showHeading?: boolean
  showSubheading?: boolean
  collection_id?: string
}

export interface BlogSection extends BaseSection {
  _type: "blogSection"
  title?: string
  category?: string
  limit?: number
  postsPerRow?: number
}

export interface YoutubeSection extends BaseSection {
  _type: "youtubeSection"
  heading?: string
  description?: string
  videoUrl?: string
  fullWidth?: boolean
}

export interface ServiceCardStylist {
  levelName: string
  price: number
  priceType: string
  stylistName: string
  isDefault: boolean
  cardImage?: {
    url: string
    alt: string
  }
}

export interface ServiceCard {
  title: string
  englishTitle: string
  stylists: ServiceCardStylist[]
  link?: string
}

export interface ServiceCardSection extends BaseSection {
  _type: "serviceCardSection"
  heading?: string
  cardsPerRow?: number
  cards?: ServiceCard[]
}

export interface ContentSection extends BaseSection {
  _type: "contentSection"
  heading?: string
  content?: any[]
}
