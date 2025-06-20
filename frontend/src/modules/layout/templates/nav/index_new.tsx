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

  // 從 Sanity 獲取跑馬燈資料 - 處理新的物件結構並記錄啟用狀態
  const enabledTexts = headerData?.marquee?.enabled 
    ? [
        // 收集啟用且有內容的文字及其原始位置
        ...(headerData.marquee.text1?.enabled && headerData.marquee.text1?.content?.trim() 
            ? [{content: headerData.marquee.text1.content, position: 1}] : []),
        ...(headerData.marquee.text2?.enabled && headerData.marquee.text2?.content?.trim() 
            ? [{content: headerData.marquee.text2.content, position: 2}] : []),
        ...(headerData.marquee.text3?.enabled && headerData.marquee.text3?.content?.trim() 
            ? [{content: headerData.marquee.text3.content, position: 3}] : [])
      ]
    : []

  // 根據開啟組合判斷顯示策略 - 確保只提取字串內容
  const marqueeTexts = enabledTexts.map(item => String(item.content)).filter(text => text.trim())
  const textCount = marqueeTexts.length

  // 固定文字停留時間為3秒，根據項目數量計算總動畫時間
  const textDisplayTime = 3 // 每個文字停留3秒
  const calculateAnimationDuration = (count: number) => {
    if (count === 1) return textDisplayTime * 2 // 單項目稍微慢一點
    return count * textDisplayTime // 多項目：項目數 × 3秒
  }
  
  const animationDuration = calculateAnimationDuration(textCount)
  const pauseOnHover = headerData?.marquee?.pauseOnHover !== false // 預設為 true

  // 根據啟用的文字數量決定動畫類別 - 分支結構處理
  const getMarqueeClass = (count: number) => {
    if (count === 0) return '' // 無文字
    if (count === 1) return 'animate-marquee-1' // 單項目靜止
    if (count === 2) return 'animate-marquee-2' // 雙項目循環：行1 → 行2 → 行1
    if (count === 3) return 'animate-marquee-3' // 三項目循環：行1 → 行2 → 行3 → 行1
    return 'animate-marquee' // 回退到原始動畫
  }

  // 原始的固定跑馬燈內容（當Sanity沒有設定時使用）
  const defaultAnnouncements = [
    "新會員首購享85折",
    "全館消費滿$2000免運",
    "會員點數最高30倍送"
  ]

  return (
    <>
      {/* 跑馬燈 - 只有在後台啟用且有文字時才顯示，否則顯示預設的 */}
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
                {/* 顯示所有啟用的文字 */}
                {marqueeTexts.map((text, index) => (
                  <div 
                    key={`marquee-link-${index}-${text.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`} 
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
                {/* 顯示所有啟用的文字 */}
                {marqueeTexts.map((text, index) => (
                  <div 
                    key={`marquee-nolink-${index}-${text.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`} 
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
              {/* 顯示預設公告，確保順序正確 */}
              <div key="default-1" className="flex-none h-9 flex items-center justify-center text-xs text-white">
                {defaultAnnouncements[0]}
              </div>
              <div key="default-2" className="flex-none h-9 flex items-center justify-center text-xs text-white">
                {defaultAnnouncements[1]}
              </div>
              <div key="default-3" className="flex-none h-9 flex items-center justify-center text-xs text-white">
                {defaultAnnouncements[2]}
              </div>
              {/* 重複第一個文字確保無縫滾動 */}
              <div key="default-1-repeat" className="flex-none h-9 flex items-center justify-center text-xs text-white">
                {defaultAnnouncements[0]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky 導覽列區塊 */}
      <div className="sticky top-0 inset-x-0 z-50 group transition-all duration-300">
        {/* 主導覽列 */}
        <header 
          className="relative mx-auto border-b bg-white/95 border-ui-border-base backdrop-blur transition-all duration-300 hover:bg-white h-12"
        >
          <nav className="px-6 md:px-12 h-full max-w-[1440px] mx-auto">
            <div className="flex justify-between items-center h-full animate-fade-in">
              {/* 左側區塊 */}
              <div className="flex items-center gap-x-8">
                <MobileMenu 
                  regions={regions} 
                  navigation={headerData?.navigation}
                  categories={categories}
                />
                <div className="hidden xsmall:flex items-center gap-x-6">
                  {headerData?.navigation?.map(({ name, href }: {name: string; href: string}, index: number) => {
                    // 確保 name 和 href 都是字串
                    if (typeof name !== 'string' || typeof href !== 'string') {
                      console.warn('Navigation item has invalid name or href:', { name, href })
                      return null
                    }

                    // 判斷是否為外部連結
                    const isExternal = /^(http|https|www)/.test(href);
                    // 判斷是否為首頁連結 (支援 / 和 /home)
                    const isHome = href === '/' || href === '/home';
                    // 處理連結
                    const processedHref = isExternal 
                      ? href 
                      : isHome 
                        ? '/' 
                        : href.startsWith('/') 
                          ? href 
                          : `/${href}`;

                    const uniqueKey = `nav-${index}-${name.replace(/[^a-zA-Z0-9]/g, '')}-${href.replace(/[^a-zA-Z0-9]/g, '')}`;

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
                    );
                  })}
                </div>
              </div>

              {/* 中間區塊 */}
              <div className="flex items-center justify-center">
                <LocalizedClientLink
                  href="/"
                  className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase xsmall:text-lg"
                  data-testid="nav-store-link"
                >
                  {headerData?.logo ? (
                    (() => {
                      const logoHeight = headerData?.logoHeight || 36
                      
                      return (
                        <Image
                          src={headerData.logo.url}
                          alt={headerData.logo.alt || "Store logo"}
                          width={200}
                          height={logoHeight}
                          className="w-auto object-contain transition-all duration-300"
                          style={{ 
                            height: `${logoHeight}px`,
                            width: 'auto'
                          }}
                        />
                      )
                    })()
                  ) : (
                    headerData?.storeName || "Medusa Store"
                  )}
                </LocalizedClientLink>
              </div>
              
              {/* 右側區塊 */}
              <div className="flex items-center justify-end gap-x-6">
                <div className="hidden xsmall:flex items-center gap-x-6">
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

        {/* 分類導覽列 - 在 sticky 容器內的第二層 */}
        <div className="hidden xsmall:block border-b border-ui-border-base bg-white/95 backdrop-blur transition-all duration-300 hover:bg-white">
          <div className="px-4 md:px-8 flex justify-between items-center py-2 text-sm text-neutral-600">
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
