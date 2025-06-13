export type ContentSection = {
  _type: "contentSection"
  isActive: boolean
  title?: string
  content: string
}

export type ContactSection = {
  _type: "contactSection"
  isActive: boolean
  title?: string
  address?: string
  phone?: string
  email?: string
  businessHours?: Array<{
    days: string
    hours: string
  }>
  socialLinks?: Array<{
    platform: string
    url: string
  }>
  googleMapsUrl?: string
}
