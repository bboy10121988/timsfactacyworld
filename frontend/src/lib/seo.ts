import { Metadata } from "next"
import { client } from "@lib/sanity/client"

export const getDefaultSEOSettings = async (): Promise<Metadata> => {
  try {
    // 獲取 header 文件中的 SEO 設定
    const query = `*[_type == "header"][0] {
      storeName,
      seoSettings {
        metaTitle,
        metaDescription,
        canonicalUrl,
        "favicon": favicon.asset->url
      }
    }`
    
    const result = await client.fetch(query)
    console.log('Sanity SEO 查詢結果:', result)
    
    if (!result?.seoSettings) {
      console.warn('未找到 SEO 設定')
      return {
        title: '我的商店',
        description: undefined,
        icons: undefined,
      }
    }

    const { storeName, seoSettings: seo } = result
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    return {
      metadataBase: new URL(baseUrl),
      title: {
        absolute: seo.metaTitle || storeName,
        template: `%s | ${seo.metaTitle || storeName}`,
      },
      description: seo.metaDescription,
      icons: seo.favicon ? {
        icon: [{ url: seo.favicon }],
        shortcut: [{ url: seo.favicon }],
        apple: [{ url: seo.favicon }],
      } : undefined,
      openGraph: {
        type: "website",
        title: seo.metaTitle || storeName,
        description: seo.metaDescription,
        siteName: storeName,
        images: seo.favicon ? [{ url: seo.favicon }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: seo.metaTitle || storeName,
        description: seo.metaDescription,
        images: seo.favicon ? [{ url: seo.favicon }] : [],
      },
    }
  } catch (error) {
    console.error('獲取 SEO 設定時發生錯誤:', error)
    return {
      title: '我的商店',
      description: undefined,
      icons: undefined,
    }
  }
}

export const mergeSEOMetadata = (metadata: Metadata, defaultMetadata?: Metadata): Metadata => {
  const title = (metadata.title as string) || defaultMetadata?.title as string | undefined
  const description = metadata.description || defaultMetadata?.description
  
  return {
    ...defaultMetadata,
    ...metadata,
    title, 
    description,
    openGraph: {
      ...defaultMetadata?.openGraph,
      ...metadata.openGraph,
      title: (metadata.openGraph?.title as string) || title,
      description: metadata.openGraph?.description || description,
    },
    twitter: {
      ...defaultMetadata?.twitter,
      ...metadata.twitter,
      title: (metadata.twitter?.title as string) || title,
      description: metadata.twitter?.description || description,
    }
  }
}
