import { Metadata } from "next"
import { Noto_Sans_TC } from "next/font/google"
import "styles/globals.css"
import ClientArea from "@modules/layout/components/client-area"
import SanityFooter from "@modules/layout/templates/footer/sanity-footer"
import { getStoreName } from "@lib/store-name"
import { getHeader } from "@lib/sanity"
import ToasterProvider from "@/providers/toast-provider"

// 字體配置
const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  preload: true,
  display: 'swap',
  variable: '--font-noto-sans-tc',
})

// 獲取店名和 Logo 用於元數據
const getBaseMetadata = async (): Promise<Metadata> => {
  try {
    const [storeName, headerData] = await Promise.all([
      getStoreName(),
      getHeader()
    ])
    
    // 準備 favicon 設定
    const faviconUrl = headerData?.logo?.url || '/favicon.ico'
    
    // 為 favicon 準備不同尺寸和格式
    const faviconIcons = []
    
    if (headerData?.logo?.url) {
      // 如果有 Sanity logo，生成不同尺寸
      faviconIcons.push(
        { url: `${headerData.logo.url}?w=32&h=32&fit=crop&auto=format`, sizes: '32x32', type: 'image/png' },
        { url: `${headerData.logo.url}?w=16&h=16&fit=crop&auto=format`, sizes: '16x16', type: 'image/png' },
        { url: `${headerData.logo.url}?w=48&h=48&fit=crop&auto=format`, sizes: '48x48', type: 'image/png' }
      )
    } else {
      // 使用預設 favicon
      faviconIcons.push({ url: '/favicon.ico' })
    }
    
    return {
      title: {
        absolute: storeName,
        template: `%s | ${storeName}`,
      },
      description: '專業美髮沙龍與高級美髮產品',
      icons: {
        icon: faviconIcons,
        shortcut: [{ url: faviconUrl }],
        apple: [{ 
          url: headerData?.logo?.url ? `${headerData.logo.url}?w=180&h=180&fit=crop&auto=format` : '/favicon.ico',
          sizes: '180x180'
        }],
      },
      openGraph: {
        type: "website",
        title: storeName,
        description: '專業美髮沙龍與高級美髮產品',
        siteName: storeName,
        images: headerData?.logo?.url ? [{ url: headerData.logo.url, alt: headerData.logo.alt || storeName }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: storeName,
        description: '專業美髮沙龍與高級美髮產品',
        images: headerData?.logo?.url ? [headerData.logo.url] : undefined,
      },
    }
  } catch (error) {
    console.error('獲取基本元數據時發生錯誤:', error)
    const storeName = await getStoreName()
    
    return {
      title: {
        absolute: storeName,
        template: `%s | ${storeName}`,
      },
      description: '專業美髮沙龍與高級美髮產品',
      icons: {
        icon: [{ url: '/favicon.ico' }],
        shortcut: [{ url: '/favicon.ico' }],
        apple: [{ url: '/favicon.ico' }],
      },
      openGraph: {
        type: "website",
        title: storeName,
        description: '專業美髮沙龍與高級美髮產品',
        siteName: storeName,
      },
      twitter: {
        card: "summary_large_image",
        title: storeName,
        description: '專業美髮沙龍與高級美髮產品',
      },
    }
  }
}

// 靜態產生元數據，避免伺服器端的 fetch 操作
export const generateMetadata = async (): Promise<Metadata> => {
  return getBaseMetadata()
}

// 分割客戶端區域為單獨組件，避免 SSR 問題
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="zh-TW" data-mode="light" suppressHydrationWarning className={`${notoSansTC.variable}`}>
      <body suppressHydrationWarning className="font-sans">
        <ToasterProvider />
        <ClientArea>
          {children}
        </ClientArea>
        <SanityFooter />
      </body>
    </html>
  )
}

export default RootLayout
