"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { affiliateAPI } from '@/lib/affiliate-api'

const AffiliateTracker = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const refCode = searchParams?.get('ref')
    
    if (refCode) {
      console.log('檢測到聯盟推薦代碼:', refCode)
      
      // 追蹤聯盟點擊
      affiliateAPI.trackClick(refCode)
        .then(() => {
          console.log('聯盟點擊已追蹤:', refCode)
          // 將聯盟代碼存儲在 localStorage 中，以便後續購買時使用
          localStorage.setItem('affiliate_ref', refCode)
          
          // 可選：設置 cookie 用於較長期的追蹤
          document.cookie = `affiliate_ref=${refCode}; max-age=${30 * 24 * 60 * 60}; path=/` // 30 天
          
          // 顯示成功訊息（可選）
          console.log('聯盟代碼已保存，有效期 30 天')
        })
        .catch((error) => {
          console.error('聯盟追蹤失敗:', error)
        })
    }
  }, [searchParams])

  return null // 這個組件不渲染任何內容
}

export default AffiliateTracker
