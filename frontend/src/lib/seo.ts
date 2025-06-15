import { Metadata } from "next"

export const getDefaultSEOSettings = async (): Promise<Metadata> => {
  try {
    // 使用靜態 SEO 設定避免在服務器端組件中進行動態獲取
    const storeName = "TIMS HAIR SALON"
    
    return {
      title: {
        absolute: storeName,
        template: `%s | ${storeName}`,
      },
      description: "專業美髮沙龍與高級美髮產品",
      icons: {
        icon: [{ url: '/favicon.ico' }],
        shortcut: [{ url: '/favicon.ico' }],
        apple: [{ url: '/favicon.ico' }],
      },
      openGraph: {
        type: "website",
        title: storeName,
        description: "專業美髮沙龍與高級美髮產品",
        siteName: storeName,
      },
      twitter: {
        card: "summary_large_image",
        title: storeName,
        description: "專業美髮沙龍與高級美髮產品",
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
