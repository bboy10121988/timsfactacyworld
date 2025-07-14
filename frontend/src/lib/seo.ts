import { Metadata } from "next"

interface SanitySEOMeta {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    asset: {
      url: string
    }
    alt: string
  }
}

interface ProductKeywordsConfig {
  presetKeywords: Record<string, string[]>
  extractFields: string[]
}

const defaultKeywordConfig: ProductKeywordsConfig = {
  presetKeywords: {
    'shampoo': ['洗髮精', '去屑', '頭皮護理'],
    'conditioner': ['潤髮乳', '護髮素']
  },
  extractFields: ['title', 'subtitle', 'description', 'tags', 'collection']
}

export function generateProductKeywords(
  product: any,
  config: ProductKeywordsConfig = defaultKeywordConfig
): string[] {
  const extracted = config.extractFields.flatMap(field => {
    const value = product[field]
    return typeof value === 'string' ? 
      value.split(/[,，、\s]+/) : 
      Array.isArray(value) ? value : []
  })

  const preset = product.type ? 
    (config.presetKeywords[product.type] || []) : 
    []

  return Array.from(new Set([...extracted, ...preset]))
}

type OGImage = {
  url: string
  alt?: string
}

export const getDefaultSEOSettings = async (): Promise<Metadata> => {
  try {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || ''
    
    return {
      title: {
        absolute: storeName,
        template: storeName ? `%s | ${storeName}` : '%s',
      },
      icons: {
        icon: [{ url: '/favicon.ico' }],
        shortcut: [{ url: '/favicon.ico' }],
        apple: [{ url: '/favicon.ico' }],
      },
      openGraph: {
        type: "website",
        siteName: storeName,
        images: [
          {
            url: '/default-og-image.jpg',
            alt: storeName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: ['/default-twitter-image.jpg']
      },
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tims-hair-salon.com'),
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

export const mergeSEOMetadata = (
  metadata: Metadata, 
  defaultMetadata?: Metadata,
  sanityMeta?: SanitySEOMeta
): Metadata => {
  const title = (metadata.title ? String(metadata.title) : null) 
    || sanityMeta?.seoTitle 
    || (defaultMetadata?.title ? String(defaultMetadata.title) : null)
    || undefined
  const description = metadata.description 
    || sanityMeta?.seoDescription 
    || defaultMetadata?.description 
    || undefined
  const keywords = Array.isArray(metadata.keywords) 
    ? metadata.keywords 
    : (Array.isArray(sanityMeta?.seoKeywords) 
      ? sanityMeta.seoKeywords 
      : (Array.isArray(defaultMetadata?.keywords) 
        ? defaultMetadata.keywords 
        : []))

  const ogTitle = sanityMeta?.ogTitle || (metadata.openGraph?.title as string) || title
  const ogDescription = sanityMeta?.ogDescription || metadata.openGraph?.description || description
  
  let ogImages: OGImage[] = []
  if (sanityMeta?.ogImage) {
    ogImages = [{
      url: sanityMeta.ogImage.asset.url,
      alt: sanityMeta.ogImage.alt
    }]
  } else if (metadata.openGraph?.images) {
    ogImages = Array.isArray(metadata.openGraph.images) 
      ? metadata.openGraph.images as OGImage[]
      : [metadata.openGraph.images as OGImage]
  } else if (defaultMetadata?.openGraph?.images) {
    ogImages = Array.isArray(defaultMetadata.openGraph.images)
      ? defaultMetadata.openGraph.images as OGImage[]
      : [defaultMetadata.openGraph.images as OGImage]
  }

  const keywordsMeta = keywords.length > 0 ? {
    keywords: keywords.join(', ')
  } : {}

  const otherMeta: Record<string, string> = {
    ...(sanityMeta?.noIndex ? { robots: 'noindex, nofollow' } : {}),
    ...(ogTitle ? { 'og:title': ogTitle } : {}),
    ...(ogDescription ? { 'og:description': ogDescription } : {})
  }

  if (ogImages.length > 0) {
    otherMeta['og:image'] = ogImages[0].url
    if (ogImages[0].alt) {
      otherMeta['og:image:alt'] = ogImages[0].alt
    }
  }

  if (sanityMeta?.canonicalUrl) {
    otherMeta['canonical'] = sanityMeta.canonicalUrl
  }

  return {
    ...defaultMetadata,
    ...metadata,
    title,
    description,
    ...keywordsMeta,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tims-hair-salon.com'),
    alternates: {
      canonical: sanityMeta?.canonicalUrl || metadata.alternates?.canonical
    },
    robots: sanityMeta?.noIndex ? 'noindex, nofollow' : metadata.robots,
    openGraph: {
      ...defaultMetadata?.openGraph,
      ...metadata.openGraph,
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
      url: sanityMeta?.canonicalUrl || metadata.openGraph?.url,
    },
    twitter: {
      ...defaultMetadata?.twitter,
      ...metadata.twitter,
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
      card: 'summary_large_image'
    },
    other: {
      ...metadata.other,
      ...otherMeta
    }
  }
}
