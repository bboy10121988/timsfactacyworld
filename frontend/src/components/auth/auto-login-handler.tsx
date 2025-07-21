'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AutoLoginHandler() {
  const router = useRouter()

  useEffect(() => {
    // 檢查是否剛完成註冊
    const urlParams = new URLSearchParams(window.location.search)
    const justRegistered = urlParams.get('registered') === 'true'
    
    if (justRegistered) {
      console.log('檢測到剛完成註冊，觸發自動登入檢查...')
      
      // 檢查 localStorage 備份 token
      const backupToken = localStorage.getItem('_medusa_jwt_backup')
      
      if (backupToken) {
        console.log('找到備份 token，重新設置 cookies')
        
        // 設置客戶端 cookie
        const maxAge = 60 * 60 * 24 * 7 // 7 天
        const expires = new Date(Date.now() + maxAge * 1000).toUTCString()
        
        document.cookie = `_medusa_jwt=${backupToken}; path=/; max-age=${maxAge}; expires=${expires}; SameSite=Lax`
        
        console.log('客戶端 cookie 重新設置完成')
        
        // 清除 URL 參數並刷新頁面
        window.history.replaceState({}, '', window.location.pathname)
        setTimeout(() => {
          console.log('刷新頁面以載入登入狀態...')
          window.location.reload()
        }, 500)
      } else {
        console.warn('未找到備份 token')
      }
    }
  }, [router])

  return null
}
