import { Metadata } from "next"

import HeroSection from "@modules/home/components/hero-section"
import BlogPosts from "@modules/blog/components/blog-posts"
import FeaturedProducts from "@modules/home/components/featured-products"
import ImageTextBlock from "@modules/home/components/image-text-block"
import YoutubeSection from "@modules/home/components/youtube-section"
import ServiceCardsSection from "@modules/home/components/service-cards-section"
import ContentSection from "@modules/home/components/content-section"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getHomepage } from "@lib/sanity"; // 使用 getHomepage 並移除 getServiceSection
import type { MainBanner } from '@lib/types/page-sections'
import type { ImageTextBlock as ImageTextBlockType } from '@lib/types/page-sections'
import type { FeaturedProductsSection } from '@lib/types/page-sections'
import type { BlogSection } from '@lib/types/page-sections'
import type { YoutubeSection as YoutubeSectionType } from '@lib/types/page-sections'
import type { ServiceCards } from '@lib/types/service-cards'
import type { ContentSection as ContentSectionType } from '@lib/types/page-sections'
import { getStoreName } from "@lib/store-name"


export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getHomepage() // 使用 getHomepage
  const storeName = await getStoreName()
  
  return {
    title: title || storeName,
    description: '專業美髮沙龍與高級美髮產品',
    openGraph: {
      title: title || storeName,
      description: '專業美髮沙龍與高級美髮產品',
    }
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  const { collections } = await listCollections({})
  const { mainSections } = await getHomepage() // 一次性獲取所有區塊

  // 移除舊的 service cards 邏輯

  if (!region) {
    return null
  }

  // 簡化日誌
  console.log("Homepage - mainSections from Sanity:", JSON.stringify(mainSections, null, 2))

  return (
    <>
      {/* 動態區塊（如果存在） */}
      {mainSections && mainSections
        .filter((section: any, index: number) => {
          // 過濾掉空物件或無效的 section
          if (!section || typeof section !== "object" || !("_type" in section) || !section._type) {
            console.warn(`Filtering out invalid section at index ${index}:`, section);
            return false;
          }
          // 過濾掉非作用中的 section
          if (section.isActive === false) {
            return false;
          }
          return true;
        })
        .map((section: any, index: number) => {
          const sectionType = section._type;
          try {
            switch (sectionType) {
              case "serviceCardSection": {
                const serviceSection = section as ServiceCards;
                // 直接渲染從 Sanity 獲取的資料
                return (
                  <ServiceCardsSection
                    key={index}
                    heading={serviceSection.heading}
                    subheading={serviceSection.subheading}
                    cardsPerRow={serviceSection.cardsPerRow}
                    cards={serviceSection.cards}
                  />
                );
              }
              case "mainBanner": {
                const bannerSection = section as MainBanner
                if (!bannerSection.slides || !Array.isArray(bannerSection.slides)) {
                  console.error("Invalid mainBanner section:", bannerSection)
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
                return (
                  <ImageTextBlock
                    key={index}
                    heading={imageBlock.heading}
                    content={imageBlock.content}
                    image={imageBlock.image}
                    layout={imageBlock.layout}
                    leftImage={imageBlock.leftImage}
                    rightImage={imageBlock.rightImage}
                    leftContent={imageBlock.leftContent}
                    rightContent={imageBlock.rightContent}
                  />
                )
              }
              case "featuredProducts": {
                const featuredBlock = section as FeaturedProductsSection
                if (!featuredBlock.collection_id) {
                  console.error("Invalid featuredProducts section:", featuredBlock)
                  return null
                }

                const featuredCollections = collections.filter(c =>
                  featuredBlock.collection_id === c.id
                )

                if (featuredCollections.length === 0) return null

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
                return (
                  <BlogPosts 
                    key={index}
                    title={blogSection.title || "最新文章"}
                    category={blogSection.category}
                    limit={blogSection.limit || 6}
                    postsPerRow={blogSection.postsPerRow || 3}
                  />
                )
              }
              case "youtubeSection": {
                const youtubeBlock = section as YoutubeSectionType
                if (!youtubeBlock.videoUrl) {
                  console.error("Invalid YouTube section (missing video URL):", youtubeBlock)
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
              case "contentSection": {
                const contentBlock = section as ContentSectionType
                return (
                  <ContentSection
                    key={index}
                    heading={contentBlock.heading}
                    content={contentBlock.content}
                  />
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
        }) || null}

      {/* 添加 Google Maps iframe */}
      <div style={{ marginTop: "2rem" }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9025.597972804986!2d121.51735723134998!3d25.031793426603716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a9446e13fa69%3A0x3e9b9e89bc90f145!2zVGlt4oCZcyBmYW50YXN5IFdvcmxkIOeUt-Wjq-eQhumrruW7sw!5e0!3m2!1szh-TW!2stw!4v1749469703866!5m2!1szh-TW!2stw"
          width="100%"
          height="450"
          style={{ border: "0" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </>
  )
}
