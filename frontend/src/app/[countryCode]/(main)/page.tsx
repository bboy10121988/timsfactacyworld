import { Metadata } from "next"

import HeroSection from "@modules/home/components/hero-section"
import BlogPosts from "@modules/blog/components/blog-posts"
import FeaturedProducts from "@modules/home/components/featured-products"
import ImageTextBlock from "@modules/home/components/image-text-block"
import YoutubeSection from "@modules/home/components/youtube-section"
import ServiceCardsSection from "@modules/home/components/service-cards-section"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getHomeBanners, getServiceSection } from "@lib/sanity";
import type { MainBanner } from '@lib/types/page-sections'
import type { ImageTextBlock as ImageTextBlockType } from '@lib/types/page-sections'
import type { FeaturedProductsSection } from '@lib/types/page-sections'
import type { BlogSection } from '@lib/types/page-sections'
import type { YoutubeSection as YoutubeSectionType } from '@lib/types/page-sections'
import type { ServiceCards } from '@lib/types/service-cards'
import { getStoreName } from "@lib/store-name"


export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getHomeBanners()
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
  const { mainSections } = await getHomeBanners()

  // 從後端獲取服務卡片資料，如果沒有則使用靜態資料作為 fallback
  const backendServiceCards = await getServiceSection()
  
  // 靜態服務卡片資料作為 fallback - 使用 Unsplash 隨機圖片
  const fallbackServiceCards: ServiceCards = {
    _type: "serviceCardSection",
    isActive: true,
    heading: "我們的服務",
    subheading: "專業髮型設計服務，由經驗豐富的造型師為您打造專屬風格",
    cardsPerRow: 3,
    cards: [
      {
        title: "剪髮造型",
        englishTitle: "Hair Cut & Style",
        stylists: [
          {
            levelName: "資深設計師",
            price: 1200,
            stylistName: "Tim",
            cardImage: {
              url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Tim - 剪髮造型"
            }
          },
          {
            levelName: "首席設計師", 
            price: 1500,
            stylistName: "Sarah",
            cardImage: {
              url: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Sarah - 剪髮造型"
            }
          },
          {
            levelName: "設計師",
            price: 800,
            stylistName: "Jenny",
            cardImage: {
              url: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Jenny - 剪髮造型"
            }
          }
        ],
        link: "#book-now"
      },
      {
        title: "染髮服務",
        englishTitle: "Hair Coloring",
        stylists: [
          {
            levelName: "色彩專家",
            price: 3500,
            stylistName: "Tim",
            cardImage: {
              url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Tim - 染髮專家"
            }
          },
          {
            levelName: "資深設計師",
            price: 2800,
            stylistName: "Sarah",
            cardImage: {
              url: "https://images.unsplash.com/photo-1526045478516-99145907023c?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Sarah - 染髮服務"
            }
          },
          {
            levelName: "設計師",
            price: 2000,
            stylistName: "Jenny",
            cardImage: {
              url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Jenny - 染髮服務"
            }
          }
        ],
        link: "#book-now"
      },
      {
        title: "燙髮造型",
        englishTitle: "Hair Perm",
        stylists: [
          {
            levelName: "燙髮專家",
            price: 2500,
            stylistName: "Tim",
            cardImage: {
              url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Tim - 燙髮專家"
            }
          },
          {
            levelName: "資深設計師",
            price: 2000,
            stylistName: "Sarah",
            cardImage: {
              url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Sarah - 燙髮服務"
            }
          },
          {
            levelName: "設計師",
            price: 1500,
            stylistName: "Jenny",
            cardImage: {
              url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=450&fit=crop&auto=format&q=80",
              alt: "Jenny - 燙髮服務"
            }
          }
        ],
        link: "#book-now"
      }
    ]
  }

  // 選擇要使用的服務卡片資料：優先使用後端資料，如果沒有或未啟用則使用 fallback
  const serviceCardsToUse = (backendServiceCards && backendServiceCards.isActive) 
    ? backendServiceCards 
    : fallbackServiceCards

  if (!region) {
    return null
  }

  // Debug用，完整列出所有sections
  console.log("Homepage - mainSections:", JSON.stringify(mainSections, null, 2))
  console.log("Homepage - serviceCards from backend:", backendServiceCards)
  console.log("Homepage - using serviceCards:", serviceCardsToUse === backendServiceCards ? 'backend' : 'fallback')

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
          return true;
        })
        .map((section: any, index: number) => {
          const sectionType = section._type;
          try {
            switch (sectionType) {
              case "serviceCardSection": {
                const serviceSection = section as ServiceCards;
                if (!serviceSection.isActive) {
                  return (
                    <ServiceCardsSection
                      key={index}
                      heading={fallbackServiceCards.heading}
                      subheading={fallbackServiceCards.subheading}
                      cardsPerRow={fallbackServiceCards.cardsPerRow}
                      cards={fallbackServiceCards.cards}
                    />
                  );
                }
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
                if (!bannerSection.isActive) return null
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
                if (!imageBlock.isActive) return null
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
                if (!featuredBlock.isActive) return null
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
                if (!blogSection.isActive) return null
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
                if (!youtubeBlock.isActive) return null
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
