export type ServiceStyleLevel = {
  levelName: string
  price: number
  priceType?: 'up' | 'fixed'
  stylistName?: string
  isDefault?: boolean
  cardImage?: {
    url: string
    alt?: string
  }
}

export type ServiceCard = {
  title: string
  englishTitle: string
  stylists: ServiceStyleLevel[]
  link?: string
}

export type ServiceCards = {
  _type: "serviceCardSection"
  isActive: boolean
  heading?: string
  subheading?: string
  cardsPerRow: number
  cards: ServiceCard[]
}
