'use client'

import { useEffect } from 'react'
import { validateCoreWebVitals } from '@/lib/seo'

interface SEODebugProps {
  metadata: any
  pageData?: any
  sanityMeta?: any
}

export default function SEODebug({ metadata, pageData, sanityMeta }: SEODebugProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    console.group('🔍 SEO 檢查報告')
    
    // 基本 SEO 檢查
    console.log('📄 頁面標題:', metadata?.title || '❌ 未設定')
    console.log('📝 頁面描述:', metadata?.description || '❌ 未設定')
    console.log('🔑 關鍵字:', metadata?.keywords || '❌ 未設定')
    console.log('🖼️  OG 圖片:', metadata?.openGraph?.images?.[0]?.url || '❌ 未設定')
    console.log('🚫 Robots 設定:', metadata?.robots || '預設')
    console.log('🔗 Canonical URL:', metadata?.alternates?.canonical || '未設定')

    // 檢查標題和描述長度
    if (metadata?.title) {
      const titleLength = String(metadata.title).length
      if (titleLength > 60) {
        console.warn('⚠️ 標題過長:', titleLength, '字元 (建議 50-60 字元)')
      } else if (titleLength < 30) {
        console.warn('⚠️ 標題過短:', titleLength, '字元 (建議 30-60 字元)')
      }
    }

    if (metadata?.description) {
      const descLength = metadata.description.length
      if (descLength > 160) {
        console.warn('⚠️ 描述過長:', descLength, '字元 (建議 140-160 字元)')
      } else if (descLength < 120) {
        console.warn('⚠️ 描述過短:', descLength, '字元 (建議 120-160 字元)')
      }
    }

    // 檢查必要的 meta 標籤
    if (!metadata?.title) console.error('❌ 缺少頁面標題')
    if (!metadata?.description) console.error('❌ 缺少頁面描述')
    if (!metadata?.openGraph?.images?.[0]) console.warn('⚠️ 缺少 OG 圖片')

    // Sanity Meta 檢查
    if (sanityMeta) {
      console.log('🎯 目標關鍵字:', sanityMeta.focusKeyword || '未設定')
      console.log('📊 結構化資料類型:', sanityMeta.structuredDataType || '未設定')
      console.log('📈 優先級:', sanityMeta.priority || '預設')
      console.log('🔄 更新頻率:', sanityMeta.changeFrequency || '預設')
    }

    console.groupEnd()
  }, [metadata, pageData, sanityMeta])

  return null // 這個組件不渲染任何 UI
}

// 頁面效能監控 Hook
export function usePerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

    // 監控 Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime
          console.log('🎯 LCP (Largest Contentful Paint):', Math.round(lcp), 'ms')
          
          if (lcp > 2500) {
            console.warn('⚠️ LCP 超過建議值 2.5s')
          }
        }
        
        if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime
          console.log('⚡ FID (First Input Delay):', Math.round(fid), 'ms')
          
          if (fid > 100) {
            console.warn('⚠️ FID 超過建議值 100ms')
          }
        }
        
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          const cls = (entry as any).value
          console.log('📏 CLS (Cumulative Layout Shift):', cls.toFixed(4))
          
          if (cls > 0.1) {
            console.warn('⚠️ CLS 超過建議值 0.1')
          }
        }
      })
    })

    // 開始觀察
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.log('性能監控不被支援')
    }

    return () => observer.disconnect()
  }, [])
}
