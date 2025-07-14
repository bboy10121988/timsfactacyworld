import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import AccountButton from "@modules/layout/components/account-button"
import CountrySelect from "@modules/layout/components/country-select"
import { getHeader } from "@lib/sanity"
import { SanityHeader } from "../../../../types/global"
import MobileMenu from "../../components/mobile-menu"
import SearchBarClient from "../../components/search-bar-client"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const collections = await listCollections().then((res) => res.collections)
  const categories = await listCategories()
  const headerData = await getHeader() as SanityHeader

  // 從 Sanity 獲取跑馬燈資料
  const enabledTexts = headerData?.marquee?.enabled 
    ? [
        ...(headerData.marquee.text1?.enabled && headerData.marquee.text1?.content?.trim() 
            ? [{content: headerData.marquee.text1.content}] : []),
        ...(headerData.marquee.text2?.enabled && headerData.marquee.text2?.content?.trim() 
            ? [{content: headerData.marquee.text2.content}] : []),
        ...(headerData.marquee.text3?.enabled && headerData.marquee.text3?.content?.trim() 
            ? [{content: headerData.marquee.text3.content}] : [])
      ]
    : []

  const marqueeTexts = enabledTexts.map(item => String(item.content)).filter(text => text.trim())
  const textCount = marqueeTexts.length

  const textDisplayTime = 3
  const calculateAnimationDuration = (count: number) => {
    if (count === 1) return textDisplayTime * 2
    return count * textDisplayTime
  }
  
  const animationDuration = calculateAnimationDuration(textCount)
  const pauseOnHover = headerData?.marquee?.pauseOnHover !== false

  const getMarqueeClass = (count: number) => {
    if (count === 0) return ''
    if (count === 1) return 'animate-marquee-1'
    if (count === 2) return 'animate-marquee-2'
    if (count === 3) return 'animate-marquee-3'
    return 'animate-marquee'
  }

  const defaultAnnouncements = [
    "新會員首購享85折",
    "全館消費滿$2000免運",
    "會員點數最高30倍送"
  ]

  // 計算主導覽列高度
  const mainNavHeight = Math.max(48, (headerData?.logoHeight || 36) + 24)

  return (
    <>
      {/* 整合的導航容器：跑馬燈 + 主選單 + 分類列 */}
      <div className="sticky top-0 inset-x-0 z-[100] group transition-all duration-300">
        {/* 1. 跑馬燈部分 */}
        {(headerData?.marquee?.enabled && textCount > 0) ? (
          <div className="bg-gray-900 text-white overflow-hidden h-9">
            <div className="relative h-full">
              {headerData?.marquee?.linkUrl ? (
                <a 
                  href={headerData.marquee.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full h-full"
                >
                  <div 
                    className={`absolute inset-x-0 flex flex-col ${getMarqueeClass(textCount)} ${pauseOnHover ? 'hover:animation-paused' : ''}`}
                    style={{ 
                      '--marquee-duration': `${animationDuration}s`
                    } as React.CSSProperties}
                  >
                    {marqueeTexts.map((text, index) => (
                      <div 
                        key={`marquee-link-${index}`} 
                        className="flex-none h-9 flex items-center justify-center text-xs text-white hover:underline"
                      >
                        {text}
                      </div>
                    ))}
                  </div>
                </a>
              ) : (
                <div 
                  className={`absolute inset-x-0 flex flex-col ${getMarqueeClass(textCount)} ${pauseOnHover ? 'hover:animation-paused' : ''}`}
                  style={{ 
                    '--marquee-duration': `${animationDuration}s`
                  } as React.CSSProperties}
                >
                  {marqueeTexts.map((text, index) => (
                    <div 
                      key={`marquee-nolink-${index}`} 
                      className="flex-none h-9 flex items-center justify-center text-xs text-white"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 text-white overflow-hidden h-9">
            <div className="relative h-full">
              <div className="absolute inset-x-0 flex flex-col animate-marquee">
                {defaultAnnouncements.map((text, index) => (
                  <div key={`default-${index}`} className="flex-none h-9 flex items-center justify-center text-xs text-white">
                    {text}
                  </div>
                ))}
                <div key="default-repeat" className="flex-none h-9 flex items-center justify-center text-xs text-white">
                  {defaultAnnouncements[0]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 主選單導覽列 */}
        <header 
          className="relative mx-auto border-b bg-white border-ui-border-base shadow-sm"
          style={{
            height: `${mainNavHeight}px`
          }}
        >
          <nav 
            className="px-6 md:px-12 max-w-[1440px] mx-auto h-full flex items-center"
          >
            {/* 三等份布局容器 */}
            <div className="w-full grid grid-cols-3 items-center">
              {/* 左側區塊 - 1/3 */}
              <div className="flex items-center justify-start gap-x-6">
                <MobileMenu 
                  regions={regions} 
                  navigation={headerData?.navigation}
                  categories={categories}
                  headerData={headerData}
                />
                <div className="hidden xsmall:flex items-center gap-x-6">
                  {headerData?.navigation?.filter((item: {name: string; href: string}, index: number) => {
                    // 擴展的左側項目關鍵字：首頁、商品、Blog、關於我們等
                    const leftSideItems = [
                      'home', 'homes', '首頁', '主頁',
                      'product', 'products', 'shop', 'shopping', '商品', '產品', '購物',
                      'blog', 'blogs', 'article', 'articles', 'news', '部落格', '文章', '新聞', '資訊',
                      'about', 'about-us', 'aboutus', '關於', '關於我們', '公司簡介'
                    ];
                    
                    const name = item.name.toLowerCase();
                    const href = item.href.toLowerCase();
                    
                    return leftSideItems.some(keyword => 
                      name.includes(keyword.toLowerCase()) ||
                      href.includes(keyword.toLowerCase())
                    );
                  }).map(({ name, href }: {name: string; href: string}, index: number) => {
                    if (typeof name !== 'string' || typeof href !== 'string') {
                      return null
                    }

                    const isExternal = /^(http|https|www)/.test(href)
                    const isHome = href === '/' || href === '/home'
                    const processedHref = isExternal 
                      ? href 
                      : isHome 
                        ? '/' 
                        : href.startsWith('/') 
                          ? href 
                          : `/${href}`

                    const uniqueKey = `nav-left-${index}-${name.replace(/[^a-zA-Z0-9]/g, '')}`

                    return isExternal ? (
                      <a
                        key={uniqueKey}
                        href={processedHref}
                        className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="!text-[13px] !font-medium !leading-none">{name}</span>
                      </a>
                    ) : (
                      <LocalizedClientLink
                        key={uniqueKey}
                        href={processedHref}
                        className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                        data-testid={`${name.toLowerCase()}-link`}
                      >
                        <span className="!text-[13px] !font-medium !leading-none">{name}</span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>

              {/* 中間區塊 - Logo 完全居中 - 1/3 */}
              <div className="flex items-center justify-center">
                <LocalizedClientLink
                  href="/"
                  className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase xsmall:text-lg"
                  data-testid="nav-store-link"
                >
                  {headerData?.logo ? (
                    <Image
                      src={headerData.logo.url}
                      alt={headerData.logo.alt || "Store logo"}
                      width={200}
                      height={headerData?.logoHeight || 36}
                      className="w-auto object-contain transition-all duration-300"
                      style={{ 
                        height: `${headerData?.logoHeight || 36}px`,
                        width: 'auto'
                      }}
                    />
                  ) : (
                    headerData?.storeName || "Medusa Store"
                  )}
                </LocalizedClientLink>
              </div>
              
              {/* 右側區塊 - 1/3 */}
              <div className="flex items-center justify-end gap-x-6">
                <div className="hidden xsmall:flex items-center gap-x-4">
                  {/* 剩餘的導航項目 - 右側項目 */}
                  {headerData?.navigation?.filter((item: {name: string; href: string}, index: number) => {
                    // 擴展的左側項目關鍵字（需要與上面保持一致）
                    const leftSideItems = [
                      'home', 'homes', '首頁', '主頁',
                      'product', 'products', 'shop', 'shopping', '商品', '產品', '購物',
                      'blog', 'blogs', 'article', 'articles', 'news', '部落格', '文章', '新聞', '資訊',
                      'about', 'about-us', 'aboutus', '關於', '關於我們', '公司簡介'
                    ];
                    
                    // 右側項目關鍵字：服務、聯絡、幫助等
                    const rightSideItems = [
                      'service', 'services', '服務', '服務項目',
                      'contact', 'contact-us', 'contactus', '聯絡', '聯絡我們', '聯繫',
                      'help', 'support', 'faq', '幫助', '支援', '客服', '常見問題'
                    ];
                    
                    const name = item.name.toLowerCase();
                    const href = item.href.toLowerCase();
                    
                    // 檢查是否為左側項目
                    const isLeftSideItem = leftSideItems.some(keyword => 
                      name.includes(keyword.toLowerCase()) ||
                      href.includes(keyword.toLowerCase())
                    );
                    
                    // 檢查是否為明確的右側項目
                    const isRightSideItem = rightSideItems.some(keyword => 
                      name.includes(keyword.toLowerCase()) ||
                      href.includes(keyword.toLowerCase())
                    );
                    
                    // 返回右側項目：明確的右側項目，或者不是左側項目的其他項目
                    return isRightSideItem || (!isLeftSideItem && !isRightSideItem);
                  }).map(({ name, href }: {name: string; href: string}, index: number) => {
                    if (typeof name !== 'string' || typeof href !== 'string') {
                      return null
                    }

                    const isExternal = /^(http|https|www)/.test(href)
                    const isHome = href === '/' || href === '/home'
                    const processedHref = isExternal 
                      ? href 
                      : isHome 
                        ? '/' 
                        : href.startsWith('/') 
                          ? href 
                          : `/${href}`

                    const uniqueKey = `nav-right-${index}-${name.replace(/[^a-zA-Z0-9]/g, '')}`

                    return isExternal ? (
                      <a
                        key={uniqueKey}
                        href={processedHref}
                        className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="!text-[13px] !font-medium !leading-none">{name}</span>
                      </a>
                    ) : (
                      <LocalizedClientLink
                        key={uniqueKey}
                        href={processedHref}
                        className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                        data-testid={`${name.toLowerCase()}-link`}
                      >
                        <span className="!text-[13px] !font-medium !leading-none">{name}</span>
                      </LocalizedClientLink>
                    )
                  })}
                  
                  {/* 功能按鈕 */}
                  {regions && <CountrySelect regions={regions} />}
                  <AccountButton />
                  <Suspense
                    fallback={
                      <LocalizedClientLink
                        className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center gap-2"
                        href="/cart"
                        data-testid="nav-cart-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span className="!text-[13px] !font-medium !leading-none">購物車 (0)</span>
                      </LocalizedClientLink>
                    }
                  >
                    <CartButton />
                  </Suspense>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* 3. 分類導覽列 */}
        <div className="hidden xsmall:block border-b border-ui-border-base bg-white shadow-sm">
          <div className="px-6 md:px-12 max-w-[1440px] mx-auto flex justify-between items-center py-2 text-sm text-neutral-600">
            <div className="flex items-center gap-x-6">
              {categories?.map((category: {id: string; handle: string; name: string}) => (
                <LocalizedClientLink
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                >
                  <span className="!text-[13px] !font-medium !leading-none">{category.name}</span>
                </LocalizedClientLink>
              ))}
            </div>
            <div className="relative group flex items-center">
              <SearchBarClient />
            </div>
          </div>
        </div>
      </div>

      {/* LINE 懸浮按鈕 */}
      <a
        href="https://line.me/ti/p/~YOUR_LINE_ID"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-800 text-white border border-white/20 rounded-full px-6 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 z-[9999] flex items-center gap-3"
        aria-label="加入 LINE 好友"
      >
        <svg 
          className="w-5 h-5"
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M2 6.25c0-2.208 1.792-4 4-4h8c2.208 0 4 1.792 4 4v5.5c0 2.208-1.792 4-4 4h-2.646L8 18.938V15.75H6c-2.208 0-4-1.792-4-4v-5.5z"/>
        </svg>
        <span className="text-white text-sm font-medium tracking-wide">幫助</span>
      </a>
    </>
  )
}
