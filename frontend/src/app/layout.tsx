import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { getDefaultSEOSettings } from "@lib/seo"
import { Noto_Sans_TC } from "next/font/google"
import { RegionProvider } from "@lib/context/region-context"
import "styles/globals.css"
import Footer from "@modules/layout/templates/footer"

const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  preload: true,
  display: 'swap',
  variable: '--font-noto-sans-tc',
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    const defaultSEO = await getDefaultSEOSettings()
    
    // 保留預設配置，但允許覆蓋
    return {
      ...defaultSEO,
      icons: defaultSEO.icons || {
        icon: [{ url: '/favicon.ico' }],
        shortcut: [{ url: '/favicon.ico' }],
        apple: [{ url: '/favicon.ico' }],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: '我的商店',
      icons: {
        icon: [{ url: '/favicon.ico' }],
      },
    }
  }
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" data-mode="light" suppressHydrationWarning className={`${notoSansTC.variable}`}>
      <body suppressHydrationWarning className="font-sans">
        <RegionProvider>
          <main className="relative">{props.children}</main>
          <Footer />
        </RegionProvider>
      </body>
    </html>
  )
}
