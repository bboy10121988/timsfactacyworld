import { Metadata } from 'next'
import { generateStructuredData, mergeSEOMetadata } from '@/lib/seo'
import StructuredData from './structured-data'
import SEODebug from './seo-debug'
import GoogleServices from './google-services'

interface SEOHeadProps {
  pageData?: any
  sanityMeta?: any
  pageType?: 'homepage' | 'product' | 'article' | 'page'
  metadata?: Metadata
  defaultMetadata?: Metadata
  children?: React.ReactNode
}

export default function SEOHead({
  pageData,
  sanityMeta,
  pageType = 'page',
  metadata = {},
  defaultMetadata,
  children
}: SEOHeadProps) {
  // 合併 SEO metadata
  const finalMetadata = mergeSEOMetadata(metadata, defaultMetadata, sanityMeta)
  
  // 生成結構化資料
  const structuredData = generateStructuredData(pageData, sanityMeta, pageType)

  return (
    <>
      {/* 結構化資料 */}
      <StructuredData data={structuredData} />
      
      {/* Google 服務整合 */}
      <GoogleServices 
        debug={process.env.NODE_ENV === 'development'}
        enableWebVitals={true}
      />
      
      {/* 開發環境 SEO 除錯 */}
      <SEODebug 
        metadata={finalMetadata}
        pageData={pageData}
        sanityMeta={sanityMeta}
      />
      
      {/* 額外的 head 內容 */}
      {children}
      
      {/* 預載入關鍵資源 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://cdn.sanity.io" />
      
      {/* DNS 預取 */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* 效能優化 */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#ffffff" />
      
      {/* 安全性 */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
    </>
  )
}
