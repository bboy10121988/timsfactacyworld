import { createClient } from "@sanity/client"
import { requestDeduplicator } from "./request-deduplicator"
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
  // 啟用 HTTP 快取
  requestTagPrefix: 'sanity',
  // 設定重試機制
  maxRetries: 3,
  retryDelay: (attemptNumber) => Math.min(300 * attemptNumber, 2000),
  // 移除無效的 token，只讀取公開數據
})

// 建立快取實例
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5分鐘
const MAX_CACHE_SIZE = 50 // 最大快取項目數

// 定期清理快取
let cleanupInterval: NodeJS.Timeout | null = null
if (typeof window === 'undefined') {
  // 僅在服務端設定清理
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    cache.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_TTL * 2) {
        cache.delete(key)
      }
    })
    
    // 如果快取太大，移除最舊的項目
    if (cache.size > MAX_CACHE_SIZE) {
      const entries: [string, any][] = []
      cache.forEach((entry, key) => {
        entries.push([key, entry])
      })
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE)
      toRemove.forEach(([key]) => cache.delete(key))
    }
  }, 60000) // 每分鐘清理一次
}

// 快取包裝函數 - 優化版，加入去重功能
function withCache<T>(key: string, fn: () => Promise<T>, ttl: number = CACHE_TTL): Promise<T> {
  return requestDeduplicator.dedupe(key, async () => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    try {
      const data = await fn()
      cache.set(key, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      // 如果有快取資料但已過期，在錯誤時仍返回舊資料
      if (cached) {
        console.warn(`API 調用失敗，使用快取資料: ${key}`, error)
        return cached.data
      }
      throw error
    }
  })
}

export async function getHomepage(): Promise<{ title: string; mainSections: MainSection[] }> {
  return withCache('homepage', async () => {
    const query = `*[_type == "homePage"][0] {
      title,
      "mainSections": mainSections[] {
        ...select(
          _type == "mainBanner" => {
            _type,
            isActive,
            "slides": slides[] {
              heading,
              "backgroundImage": backgroundImage.asset->url,
              "backgroundImageAlt": backgroundImage.alt,
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
        hideTitle,
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
        _type == "contentSection" => {
          _type,
          isActive,
          heading,
          "content": content[]{
            ...,
            markDefs[]{
              ...,
              _type == "internalLink" => {
                "slug": @.reference->slug.current
              }
            }
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
  })
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  return withCache('featured-products', async () => {
    const query = `*[_type == "featuredProducts" && isActive == true]{
      title,
      handle,
      collection_id,
      description,
      isActive
    }`
    return client.fetch(query)
  })
}

export async function getHeader() {
  return withCache('header', async () => {
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
  })
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
              "backgroundImage": backgroundImage.asset->url,
              "backgroundImageAlt": backgroundImage.alt,
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
            hideTitle,
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

    const posts = await client.fetch<BlogPost[]>(query)
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
              "backgroundImage": backgroundImage.asset->url,
              "backgroundImageAlt": backgroundImage.alt,
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
            hideTitle,
            content,
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
        }
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
