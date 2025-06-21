import { createClient } from "@sanity/client"
import type { ServiceCards } from './types/service-cards'
import type { Category } from './types/sanity'
import type { MainSection } from './types/page-sections'
import type { PageData } from './types/pages'
import type { Footer } from './types/footer'
import type { FeaturedProduct, BlogPost } from './types/global'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "m7o2mv1n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2022-03-25",
  useCdn: true,
  token: "skxPHbtETeuof6qw2oYMoST8kD2UCmM1UTWEjAqw03YETyws2ZhLtUlUGoPieCQQ9Y4SkaoLWXHZ8mOs34ZUmqFMPnr7tnoqY1HuLVnMTwZ0SVhDV2mOuk336ICH1h7JuzUnEyyYOiJljwvERUlw7GEelitairKw8gRMHs8HABPpZZT1TWzZ"
})

export async function getHomeBanners(): Promise<{ title: string; mainSections: MainSection[] }> {
  const query = `*[_type == "homePage"][0] {
    title,
    "mainSections": mainSections[] {
      ...select(
        _type == "mainBanner" => {
          _type,
          isActive,
          "slides": slides[] {
            heading,
            subheading,
            "backgroundImage": backgroundImage.asset->url,
            buttonText,
            buttonLink
          },
          "settings": settings {
            autoplay,
            autoplaySpeed,
            showArrows,
            showDots
          }
        },
    _type == "imageTextBlock" => {
      _type,
      isActive,
      heading,
      content,
      "image": image {
        "url": asset->url,
        "alt": alt
      },
      layout,
      "leftImage": leftImage {
        "url": asset->url,
        "alt": alt
      },
      "rightImage": rightImage {
        "url": asset->url,
        "alt": alt
      },
      leftContent,
      rightContent
    },
        _type == "featuredProducts" => {
          _type,
          heading,
          subheading,
          showHeading,
          showSubheading,
          collection_id,
          isActive
        },
        _type == "blogSection" => {
          _type,
          isActive,
          title,
          "category": category->title,
          limit,
          postsPerRow
        },
        _type == "youtubeSection" => {
          _type,
          isActive,
          heading,
          description,
          videoUrl,
          fullWidth
        },
        _type == "serviceCardSection" => {
          _type,
          isActive,
          heading,
          subheading,
          cardsPerRow,
          "cards": cards[] {
            title,
            englishTitle,
            "stylists": stylists[] {
              levelName,
              price,
              priceType,
              stylistName,
              isDefault,
              "cardImage": cardImage {
                "url": asset->url,
                "alt": alt
              }
            },
            link
          }
        },
        // Default case - 包含 _type 以便識別未處理的 section 類型
        {
          _type,
          "isUnknownType": true
        }
      )
    }
  }`

  const result = await client.fetch(query)
  
  // 過濾掉未知類型的 sections 並記錄警告
  if (result?.mainSections) {
    result.mainSections = result.mainSections.filter((section: any) => {
      if (section?.isUnknownType) {
        console.warn('Unknown section type detected and filtered:', section._type)
        return false
      }
      return section?._type // 只保留有 _type 的 sections
    })
  }
  
  return result as { title: string; mainSections: MainSection[] }
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const query = `*[_type == "featuredProducts" && isActive == true]{
    title,
    handle,
    collection_id,
    description,
    isActive
  }`
  return client.fetch(query)
}

export async function getHeader() {
  const query = `*[_type == "header"][0]{
    logo{
      "url": asset->url,
      alt
    },
    storeName,
    logoWidth,
    navigation[]{
      name,
      href
    },
    marquee {
      enabled,
      text1 {
        enabled,
        content
      },
      text2 {
        enabled,
        content
      },
      text3 {
        enabled,
        content
      },
      linkUrl,
      pauseOnHover
    }
  }`
  return client.fetch(query)
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  try {
    const query = `*[_type == "pages" && slug.current == $slug][0]{
      _type,
      title,
      "slug": slug.current,
      isActive,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      mainSections[] {
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            "slides": slides[] {
              heading,
              subheading,
              "backgroundImage": backgroundImage.asset->url,
              buttonText,
              buttonLink
            },
            "settings": settings {
              autoplay,
              autoplaySpeed,
              showArrows,
              showDots
            }
          },
          _type == "imageTextBlock" => {
            isActive,
            heading,
            content,
            "image": image {
              "url": asset->url,
              "alt": alt
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt
            },
            "rightImage": rightImage {
              "url": asset->url,
              "alt": alt
            },
            leftContent,
            rightContent
          },
          _type == "featuredProducts" => {
            isActive,
            heading,
            showHeading,
            showSubheading,
            collection_id
          },
          _type == "blogSection" => {
            isActive,
            title,
            category,
            limit
          },
          _type == "youtubeSection" => {
            isActive,
            videoUrl,
            heading,
            description,
            fullWidth
          },
          _type == "contentSection" => {
            isActive,
            title,
            content[] {
              ...,
              // 如果內容區塊包含參考類型，也展開它們
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "serviceCardSection" => {
            isActive,
            heading,
            subheading,
            cardsPerRow,
            "cards": cards[] {
              title,
              englishTitle,
              "stylists": stylists[] {
                levelName,
                price,
                priceType,
                stylistName,
                isDefault,
                "cardImage": cardImage {
                  "url": asset->url,
                  "alt": alt
                }
              },
              link
            }
          },
          _type == "contactSection" => {
            isActive,
            title,
            address,
            phone,
            email,
            businessHours[]{
              days,
              hours
            },
            socialLinks[]{
              platform,
              url
            },
            googleMapsUrl
          }
        )
      }
    }`

    const page = await client.fetch(query, { slug })
    return page
  } catch (error) {
    console.error('獲取頁面資料失敗:', error)
    return null
  }
}

export async function getAllPosts(category?: string, limit: number = 50): Promise<BlogPost[]> {
  try {
    // 建立基本查詢
    const baseQuery = `*[_type == "post"`
    const categoryFilter = category ? ` && "${category}" in categories[]->title` : ""
    const query = `${baseQuery}${categoryFilter}] | order(publishedAt desc) [0...${limit}] {
      _id,
      _type,
      title,
      slug,
      mainImage {
        asset->{
          url
        }
      },
      publishedAt,
      excerpt,
      categories[]->{
        _id,
        title
      },
      author->{
        name,
        image
      },
      status,
      body // 添加內文欄位
    }`

    const posts = await client.fetch<BlogPost>(query)
    return posts || []
  } catch (error) {
    console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const query = `*[_type == "category"] {
      _id,
      _type,
      title
    }`
    
    const categories = await client.fetch<Category[]>(query)
    return categories || []
  } catch (error) {
    console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {    const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    body,
    "author": author->{name, bio, "image": image.asset->url},
    "mainImage": mainImage.asset->url,
    "categories": categories[]->{title}
  }`
  
  return client.fetch(query, { slug })
}

export async function getAllPages(): Promise<PageData[]> {
  try {
    const query = `*[_type == "pages" && isActive == true] {
      _type,
      title,
      "slug": slug.current,
      isActive,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      mainSections[] {
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            "slides": slides[] {
              heading,
              subheading,
              "backgroundImage": backgroundImage.asset->url,
              buttonText,
              buttonLink
            },
            "settings": settings {
              autoplay,
              autoplaySpeed,
              showArrows,
              showDots
            }
          },
          _type == "imageTextBlock" => {
            isActive,
            heading,
            content,
            "image": image {
              "url": asset->url,
              "alt": alt
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt
            },
            "rightImage": rightImage {
              "url": asset->url,
              "alt": alt
            },
            leftContent,
            rightContent
          },
          _type == "featuredProducts" => {
            isActive,
            heading,
            showHeading,
            showSubheading,
            collection_id
          },
          _type == "blogSection" => {
            isActive,
            title,
            "category": category->title,
            limit,
            postsPerRow
          },
          _type == "youtubeSection" => {
            isActive,
            videoUrl,
            heading,
            description,
            fullWidth
          },
          _type == "contentSection" => {
            isActive,
            title,
            content[] {
              ...,
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "serviceCardSection" => {
            isActive,
            heading,
            subheading,
            cardsPerRow,
            "cards": cards[] {
              title,
              englishTitle,
              "stylists": stylists[] {
                levelName,
                price,
                priceType,
                stylistName,
                isDefault,
                "cardImage": cardImage {
                  "url": asset->url,
                  "alt": alt
                }
              },
              link
            }
          },
              link {
                text,
                url
              }
            }
          },
          _type == "contactSection" => {
            isActive,
            title,
            address,
            phone,
            email,
            businessHours[]{
              days,
              hours
            },
            socialLinks[]{
              platform,
              url
            },
            googleMapsUrl
          }
        )
      }
    }`

    const pages = await client.fetch<PageData[]>(query)
    return pages || []
  } catch (error) {
    console.error('[getAllPages] 從 Sanity 獲取頁面時發生錯誤:', error)
    return []
  }
}

export async function getServiceSection(): Promise<ServiceCards | null> {
  try {
    const query = `*[_type == "homePage"][0].mainSections[_type == "serviceCardSection" && isActive == true][0] {
      _type,
      isActive,
      heading,
      subheading,
      cardsPerRow,
      "cards": cards[] {
        title,
        englishTitle,
        "stylists": stylists[] {
          levelName,
          price,
          priceType,
          stylistName,
          isDefault,
          "cardImage": cardImage {
            "url": asset->url,
            "alt": alt
          }
        },
        link
      }
    }`

    const result = await client.fetch(query)
    
    // 添加 _type 如果不存在
    if (result && !result._type) {
      result._type = "serviceCardSection"
    }
    
    console.log('[getServiceSection] 查詢結果:', result)
    return result || null
  } catch (error) {
    console.error('[getServiceSection] 從 Sanity 獲取服務區塊時發生錯誤:', error)
    return null
  }
}

export async function getFooter(): Promise<Footer | null> {
  // 只獲取已發布的最新頁尾版本
  const query = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc)[0] {
    title,
    logo {
      "url": asset->url,
      alt
    },
    logoWidth,
    sections[] {
      title,
      links[] {
        text,
        url
      }
    },
    contactInfo {
      phone,
      email
    },
    socialMedia {
      facebook {
        enabled,
        url
      },
      instagram {
        enabled,
        url
      },
      line {
        enabled,
        url
      },
      youtube {
        enabled,
        url
      },
      twitter {
        enabled,
        url
      }
    },
    copyright
  }`
  
  return client.fetch(query)
}

export async function getAllFooters(): Promise<Footer[]> {
  // 獲取所有已發布的頁尾版本
  const query = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc) {
    title,
    _id,
    _updatedAt,
    _createdAt
  }`
  
  return client.fetch(query)
}

export default client
