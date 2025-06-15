import { Metadata } from "next"
import { Noto_Sans_TC } from "next/font/google"
import "styles/globals.css"
import ClientArea from "@modules/layout/components/client-area"
import SanityFooter from "@modules/layout/templates/footer/sanity-footer"

// 字體配置
const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  preload: true,
  display: 'swap',
  variable: '--font-noto-sans-tc',
})

// 靜態產生元數據，避免伺服器端的 fetch 操作
export const metadata: Metadata = {
  title: {
    absolute: 'TIMS HAIR SALON',
    template: '%s | TIMS HAIR SALON',
  },
  description: '專業美髮沙龍與高級美髮產品',
  icons: {
    icon: [{ url: '/favicon.ico' }],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    type: "website",
    title: 'TIMS HAIR SALON',
    description: '專業美髮沙龍與高級美髮產品',
    siteName: 'TIMS HAIR SALON',
  },
  twitter: {
    card: "summary_large_image",
    title: 'TIMS HAIR SALON',
    description: '專業美髮沙龍與高級美髮產品',
  },
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
