"use client"

import { useEffect, useState } from "react"
import HeroSection from "@modules/home/components/hero-section"
import BlogPosts from "@modules/blog/components/blog-posts"
import FeaturedProducts from "@modules/home/components/featured-products"
import ImageTextBlock from "@modules/home/components/image-text-block"
import YoutubeSection from "@modules/home/components/youtube-section"
import ServiceCardsSection from "@modules/home/components/service-cards-section"
import ContactSection from "./contact-section"
import { useRegion } from "@lib/context/region-context"
import { listCollections } from "@lib/data/collections"
import ContentSection from "./content-section"

interface MainBanner {
  _type: "mainBanner"
  isActive: boolean
  slides?: any[]
}

type ImageConfig = string | {
  url: string
  alt?: string
}

interface SanityImageAsset {
  _ref: string
  _type: 'reference'
}

interface SanityImage {
  _type?: string
  asset?: SanityImageAsset
  url?: string
  alt?: string
}

interface ImageTextBlockType {
  _type: "imageTextBlock"
  isActive: boolean
  heading: string
  content: string
  image?: SanityImage
  layout: "imageLeft" | "imageRight" | "imageLeftImageRight" | "textLeftTextRight" | "centerText"
  leftImage?: SanityImage
  rightImage?: SanityImage
  leftContent?: string
  rightContent?: string
}

interface FeaturedProductsSection {
  _type: "featuredProducts"
  isActive: boolean
  collection_id: string
  heading: string
  showHeading: boolean
  showSubheading: boolean
}

interface BlogSection {
  _type: "blogSection"
  isActive: boolean
  title?: string
  category?: string
  limit: number
  postsPerRow?: number
}

interface YoutubeSectionType {
  _type: "youtubeSection"
  isActive: boolean
  videoUrl: string  // 改為 videoUrl 而不是 videoId
  heading?: string
  description?: string
  fullWidth?: boolean
}

interface ContentSection {
  _type: "contentSection"
  isActive: boolean
  title?: string
  content: string
  layout?: string
}

interface ServiceCards {
  _type: "serviceCardSection"
  isActive: boolean
  heading?: string
  subheading?: string
  cardsPerRow: number
  cards: Array<{
    title: string
    englishTitle: string
    mainPrice: number
    priceLabel: 'up' | 'fixed'
    cardImage?: {
      url: string
      alt?: string
    }
    stylists?: Array<{
      levelName: string
      levelOrder: number
      price: number
      stylistName?: string
    }>
    link?: string
  }>
}

interface ContactSection {
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

interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

interface PageData {
  title: string;
  seo?: SeoData;
  mainSections: Array<
    | MainBanner
    | ImageTextBlockType
    | FeaturedProductsSection
    | BlogSection
    | YoutubeSectionType
    | ContentSection
    | ServiceCards
    | ContactSection
  >
}

interface StoreRegion {
  id: string
  name: string
  currency_code: string
}

interface PageRendererProps {
  pageData: PageData
}

// Convert RegionContext to StoreRegion
const convertRegionToStoreRegion = (region: string | null): StoreRegion => {
  return {
    id: region || "default",
    name: region || "Default Region",
    currency_code: region || "TWD",
  }
}

export default function PageRenderer({ pageData }: PageRendererProps) {
  const { mainSections, title, seo } = pageData
  const regionContext = useRegion()
  const region = convertRegionToStoreRegion(regionContext?.region)
  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      const { collections: fetchedCollections } = await listCollections({})
      setCollections(fetchedCollections)
    }
    fetchCollections()
  }, [])

  if (!mainSections || !Array.isArray(mainSections)) {
    return null
  }

  return (
    <>
      <div className="content-container pt-16 pb-6">
        <h1 className="h1 mb-8 text-center" 
          dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      
      <div className="grid gap-8 md:gap-12">
        {mainSections.map((section, index) => {
          if (!section || typeof section !== "object" || !("_type" in section)) {
            console.error("Invalid section object:", section)
            return null
          }

          const sectionType = section._type
          console.log("Processing section:", sectionType, section)

          try {
            switch (sectionType) {
              case "mainBanner": {
                const bannerSection = section as MainBanner
                if (!bannerSection.isActive) {
                  return null
                }
                return (
                  <HeroSection
                    key={index}
                    banner={bannerSection}
                  />
                )
              }
              case "imageTextBlock": {
                const imageBlock = section as ImageTextBlockType
                if (!imageBlock.isActive) {
                  return null
                }
                
                return (
                  <div key={index} className="mb-8 md:mb-12">
                    <ImageTextBlock
                      heading={imageBlock.heading}
                      content={imageBlock.content}
                      image={imageBlock.image}
                      layout={imageBlock.layout}
                      leftImage={imageBlock.leftImage}
                      rightImage={imageBlock.rightImage}
                      leftContent={imageBlock.leftContent}
                      rightContent={imageBlock.rightContent}
                    />
                  </div>
                )
              }
              case "featuredProducts": {
                const featuredBlock = section as FeaturedProductsSection
                if (!featuredBlock.isActive || !featuredBlock.collection_id) {
                  return null
                }

                const featuredCollections = collections.filter(c =>
                  featuredBlock.collection_id === c.id
                )

                if (featuredCollections.length === 0) {
                  return null
                }

                return (
                  <FeaturedProducts
                    key={index}
                    collections={featuredCollections}
                    region={region}
                    settings={featuredBlock}
                  />
                )
              }
              case "blogSection": {
                const blogSection = section as BlogSection
                if (!blogSection.isActive) {
                  return null
                }
                
                return (
                  <div key={index} className="mb-12">
                    <BlogPosts 
                      title={blogSection.title || "最新文章"}
                      category={blogSection.category}
                      limit={blogSection.limit || 6}
                      postsPerRow={blogSection.postsPerRow || 3}
                    />
                  </div>
                )
              }
              case "youtubeSection": {
                const youtubeBlock = section as YoutubeSectionType
                if (!youtubeBlock.isActive || !youtubeBlock.videoUrl) {
                  return null
                }

                return (
                  <YoutubeSection
                    key={index}
                    _type="youtubeSection"
                    isActive={true}
                    heading={youtubeBlock.heading}
                    description={youtubeBlock.description}
                    videoUrl={youtubeBlock.videoUrl}
                    fullWidth={youtubeBlock.fullWidth}
                  />
                )
              }
              case "contactSection": {
                const contactSection = section as ContactSection
                if (!contactSection.isActive) {
                  return null
                }

                return (
                  <div key={index}>
                    <ContactSection
                      title={contactSection.title}
                      address={contactSection.address}
                      phone={contactSection.phone}
                      email={contactSection.email}
                      businessHours={contactSection.businessHours}
                      socialLinks={contactSection.socialLinks}
                      googleMapsUrl={contactSection.googleMapsUrl}
                    />
                  </div>
                )
              }
              case "contentSection": {
                const contentSection = section as ContentSection
                if (contentSection.isActive === false) {
                  return null
                }
                
                return (
                  <div key={index} className="content-container">
                    <ContentSection
                      title={contentSection.title}
                      content={contentSection.content}
                      layout={contentSection.layout}
                    />
                  </div>
                )
              }
              default:
                console.error("Unknown section type:", sectionType)
                return null
            }
          } catch (error) {
            console.error("Error rendering section:", sectionType, error)
            return null
          }
        })}
      </div>
    </>
  )
}
