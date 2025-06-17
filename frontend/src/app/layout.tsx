import { Metadata } from "next"
import { Noto_Sans_TC } from "next/font/google"
import "styles/globals.css"
import ClientArea from "@modules/layout/components/client-area"
import SanityFooter from "@modules/layout/templates/footer/sanity-footer"
import { getStoreName } from "@lib/store-name"

// 字體配置
const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  preload: true,
  display: 'swap',
  variable: '--font-noto-sans-tc',
})

// 獲取店名用於元數據
const getBaseMetadata = async (): Promise<Metadata> => {
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

// 靜態產生元數據，避免伺服器端的 fetch 操作
export const generateMetadata = async (): Promise<Metadata> => {
  return getBaseMetadata()
}

// 分割客戶端區域為單獨組件，避免 SSR 問題
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="zh-TW" data-mode="light" suppressHydrationWarning className={`${notoSansTC.variable}`}>
      <body suppressHydrationWarning className="font-sans">
        <ClientArea>
          {children}
        </ClientArea>
        <SanityFooter />
      </body>
    </html>
  )
}

export default RootLayout
