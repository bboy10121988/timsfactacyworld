"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Download, Eye, Link as LinkIcon, Plus, ExternalLink } from "lucide-react"
import { UnifiedButton } from "@/components/common/unified-button"
import { affiliateAPI, AffiliatePartner } from "@/lib/affiliate-api"

interface ToolsPageClientProps {
  countryCode: string
}

export default function ToolsPageClient({ countryCode }: ToolsPageClientProps) {
  const [partner, setPartner] = useState<AffiliatePartner | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  
  // 自定義連結生成器狀態
  const [customUrl, setCustomUrl] = useState("")
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [urlError, setUrlError] = useState("")

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    try {
      // 模擬獲取合作夥伴資料
      const partnerData = {
        id: 'partner-123',
        name: '王小明',
        email: 'affiliate@example.com',
        phone: '0912345678',
        company: '個人工作室',
        affiliate_code: 'AFFILIATE123',
        referral_link: 'https://example.com?ref=AFFILIATE123',
        status: 'approved' as const,
        commission_rate: 0.08,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-15T00:00:00.000Z'
      }
      setPartner(partnerData)
    } catch (error) {
      console.error('載入合作夥伴資料失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('複製失敗:', error)
    }
  }

  const generateAffiliateUrl = () => {
    setUrlError("")
    setGeneratedUrl("")
    
    if (!customUrl.trim()) {
      setUrlError("請輸入網址")
      return
    }

    try {
      let url: URL
      
      // 檢查是否為完整 URL
      if (customUrl.startsWith('http://') || customUrl.startsWith('https://')) {
        url = new URL(customUrl)
      } else {
        // 如果是相對路徑，添加當前網站域名
        const baseUrl = window.location.origin
        const cleanPath = customUrl.startsWith('/') ? customUrl : '/' + customUrl
        url = new URL(baseUrl + cleanPath)
      }
      
      // 檢查是否為本站網址
      const currentDomain = window.location.hostname
      if (url.hostname !== currentDomain && !customUrl.startsWith('/')) {
        setUrlError("請輸入本站網址或相對路徑")
        return
      }
      
      // 添加或更新 ref 參數
      url.searchParams.set('ref', partner?.affiliate_code || 'AFFILIATE123')
      
      setGeneratedUrl(url.toString())
      
    } catch (error) {
      setUrlError("請輸入有效的網址格式")
    }
  }

  const downloadBanner = (size: string) => {
    // 模擬下載橫幅圖片
    const link = document.createElement('a')
    link.href = `/images/banner-${size}.png`
    link.download = `affiliate-banner-${size}.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">請先登入聯盟系統</p>
          <Link href={`/${countryCode}/affiliate`}>
            <UnifiedButton className="mt-4">
              前往登入
            </UnifiedButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁首區域 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <Link 
              href={`/${countryCode}/affiliate`}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">推廣工具</h1>
              <p className="text-gray-600">獲取各種推廣素材來提升您的推薦效果</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 自定義推薦連結生成器 - 放在最前面 */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Plus className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">自定義推薦連結生成器</h3>
          </div>
          <p className="text-gray-600 mb-6">輸入站內任何網址，自動生成帶有您專屬推薦代碼的連結</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                輸入網址
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value)
                    setUrlError("")
                    setGeneratedUrl("")
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：/products/green-tea 或 https://example.com/products"
                />
                <UnifiedButton
                  onClick={generateAffiliateUrl}
                  className="px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  生成連結
                </UnifiedButton>
              </div>
              {urlError && (
                <p className="mt-2 text-sm text-red-600">{urlError}</p>
              )}
            </div>
            
            {generatedUrl && (
              <div className="bg-green-50 rounded-md p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <ExternalLink className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">生成的推薦連結：</span>
                    </div>
                    <div className="bg-white rounded border p-3 mb-3">
                      <code className="text-sm text-gray-800 break-all">
                        {generatedUrl}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <UnifiedButton
                        onClick={() => copyToClipboard(generatedUrl, 'generated')}
                        variant="secondary"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copySuccess === 'generated' ? '已複製！' : '複製連結'}
                      </UnifiedButton>
                      <UnifiedButton
                        onClick={() => window.open(generatedUrl, '_blank')}
                        variant="secondary"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        預覽連結
                      </UnifiedButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">使用說明：</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>相對路徑</strong>：直接輸入 <code>/products/item-name</code></li>
                <li>• <strong>完整網址</strong>：輸入 <code>https://yourdomain.com/page</code></li>
                <li>• <strong>自動添加</strong>：系統會自動添加您的推薦代碼 <code>?ref={partner?.affiliate_code}</code></li>
                <li>• <strong>追蹤功能</strong>：通過此連結的訪問和購買都會計入您的推薦統計</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 推薦連結 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <LinkIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">推薦連結</h3>
            </div>
            <p className="text-gray-600 mb-4">分享這個連結來推薦新客戶</p>
            
            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <code className="text-sm text-gray-800 break-all">
                {partner.referral_link}
              </code>
            </div>
            
            <UnifiedButton
              onClick={() => copyToClipboard(partner.referral_link, 'link')}
              className="w-full"
              variant="secondary"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copySuccess === 'link' ? '已複製！' : '複製連結'}
            </UnifiedButton>
          </div>

          {/* 推薦代碼 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">推薦代碼</h3>
            </div>
            <p className="text-gray-600 mb-4">客戶可在結帳時輸入此代碼</p>
            
            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <code className="text-xl font-mono text-center block">
                {partner.affiliate_code}
              </code>
            </div>
            
            <UnifiedButton
              onClick={() => copyToClipboard(partner.affiliate_code, 'code')}
              className="w-full"
              variant="secondary"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copySuccess === 'code' ? '已複製！' : '複製代碼'}
            </UnifiedButton>
          </div>

          {/* 社群媒體文案 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Copy className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold">社群文案</h3>
            </div>
            <p className="text-gray-600 mb-4">適合社群媒體分享的文案</p>
            
            <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
              🌟 發現了超棒的產品！使用我的專屬連結購買還能享優惠：
              <br /><br />
              {partner.referral_link}
              <br /><br />
              #推薦 #優質商品
            </div>
            
            <UnifiedButton
              onClick={() => copyToClipboard(
                `🌟 發現了超棒的產品！使用我的專屬連結購買還能享優惠：\n\n${partner.referral_link}\n\n#推薦 #優質商品`,
                'social'
              )}
              className="w-full"
              variant="secondary"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copySuccess === 'social' ? '已複製！' : '複製文案'}
            </UnifiedButton>
          </div>

          {/* 橫幅廣告 - 大 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold">大型橫幅</h3>
            </div>
            <p className="text-gray-600 mb-4">適合網站首頁使用 (728x90px)</p>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-md p-4 mb-4 text-white text-center">
              <div className="text-sm font-medium">Tim's Fantasy World</div>
              <div className="text-xs mt-1">使用代碼: {partner.affiliate_code}</div>
            </div>
            
            <UnifiedButton
              onClick={() => downloadBanner('large')}
              className="w-full"
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              下載橫幅
            </UnifiedButton>
          </div>

          {/* 方形廣告 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold">方形廣告</h3>
            </div>
            <p className="text-gray-600 mb-4">適合社群媒體貼文 (300x300px)</p>
            
            <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-md p-4 mb-4 text-white text-center aspect-square flex flex-col justify-center">
              <div className="text-sm font-medium">Tim's Fantasy</div>
              <div className="text-xs mt-1">推薦代碼</div>
              <div className="text-xs font-mono">{partner.affiliate_code}</div>
            </div>
            
            <UnifiedButton
              onClick={() => downloadBanner('square')}
              className="w-full"
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              下載廣告
            </UnifiedButton>
          </div>

          {/* 小型橫幅 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-teal-600 mr-2" />
              <h3 className="text-lg font-semibold">小型橫幅</h3>
            </div>
            <p className="text-gray-600 mb-4">適合部落格側邊欄 (300x250px)</p>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-md p-3 mb-4 text-white text-center">
              <div className="text-xs font-medium">Tim's Fantasy World</div>
              <div className="text-xs mt-1">優惠代碼: {partner.affiliate_code}</div>
              <div className="text-xs mt-1">立即購買 →</div>
            </div>
            
            <UnifiedButton
              onClick={() => downloadBanner('small')}
              className="w-full"
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              下載橫幅
            </UnifiedButton>
          </div>

        </div>

        {/* 使用說明 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold mb-4">使用說明</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">推廣連結使用方式：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 直接分享連結給朋友或客戶</li>
                <li>• 在社群媒體上發布</li>
                <li>• 加入部落格文章中</li>
                <li>• 透過 Email 發送給聯絡人</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">廣告素材使用建議：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 確保遵守平台的廣告政策</li>
                <li>• 在明顯位置標示這是推薦連結</li>
                <li>• 定期更換素材保持新鮮感</li>
                <li>• 搭配優質內容效果更好</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
