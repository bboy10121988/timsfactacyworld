"use client"

import { useState, useEffect } from "react"
import { UnifiedButton } from "@/components/common/unified-button"
import { 
  Link as LinkIcon, 
  Copy, 
  QrCode, 
  Share2, 
  Download,
  ExternalLink,
  TrendingUp,
  Target,
  Calendar
} from "lucide-react"

interface LinkVariation {
  id: string
  name: string
  description: string
  url: string
  clicks: number
  conversions: number
  isActive: boolean
}

export default function AffiliateToolsPage() {
  const [partner, setPartner] = useState<any>(null)
  const [linkVariations, setLinkVariations] = useState<LinkVariation[]>([])
  const [newLinkName, setNewLinkName] = useState("")
  const [newLinkDescription, setNewLinkDescription] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const savedPartner = localStorage.getItem("affiliate_partner")
    if (savedPartner) {
      setPartner(JSON.parse(savedPartner))
      loadLinkVariations()
    }
  }, [])

  const loadLinkVariations = () => {
    // 模擬已創建的連結變化
    setLinkVariations([
      {
        id: "1",
        name: "首頁推廣",
        description: "主要推廣連結",
        url: `${window.location.origin}?ref=AFF12345678`,
        clicks: 125,
        conversions: 8,
        isActive: true
      },
      {
        id: "2", 
        name: "產品頁面推廣",
        description: "特定產品推廣",
        url: `${window.location.origin}/products/special-offer?ref=AFF12345678`,
        clicks: 89,
        conversions: 12,
        isActive: true
      },
      {
        id: "3",
        name: "社群媒體推廣",
        description: "適用於 Facebook、Instagram",
        url: `${window.location.origin}?ref=AFF12345678&utm_source=social&utm_medium=affiliate`,
        clicks: 234,
        conversions: 15,
        isActive: true
      }
    ])
  }

  const generateNewLink = () => {
    if (!newLinkName.trim()) {
      alert("請輸入連結名稱")
      return
    }

    const baseUrl = window.location.origin
    const affiliateCode = partner?.affiliate_code || "AFF12345678"
    
    let url = `${baseUrl}?ref=${affiliateCode}`
    
    // 如果選擇了特定產品，添加產品路徑
    if (selectedProduct) {
      url = `${baseUrl}/products/${selectedProduct}?ref=${affiliateCode}`
    }
    
    // 添加 UTM 參數用於追蹤
    const timestamp = Date.now()
    url += `&utm_source=affiliate&utm_medium=partner&utm_campaign=${encodeURIComponent(newLinkName)}&utm_term=${timestamp}`

    const newLink: LinkVariation = {
      id: timestamp.toString(),
      name: newLinkName,
      description: newLinkDescription,
      url,
      clicks: 0,
      conversions: 0,
      isActive: true
    }

    setLinkVariations([...linkVariations, newLink])
    setNewLinkName("")
    setNewLinkDescription("")
    setSelectedProduct("")
    setSuccess("新的推廣連結已創建！")
    setTimeout(() => setSuccess(""), 3000)
  }

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setSuccess("連結已複製到剪貼板！")
    setTimeout(() => setSuccess(""), 3000)
  }

  const generateQRCode = (url: string) => {
    // 這裡可以整合 QR code 生成庫
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    window.open(qrUrl, '_blank')
  }

  const toggleLinkStatus = (id: string) => {
    setLinkVariations(links => 
      links.map(link => 
        link.id === id ? { ...link, isActive: !link.isActive } : link
      )
    )
  }

  const shareLink = (url: string, title: string) => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - 推薦連結`,
        url: url
      })
    } else {
      copyLink(url)
    }
  }

  const getConversionRate = (clicks: number, conversions: number) => {
    if (clicks === 0) return "0.00"
    return ((conversions / clicks) * 100).toFixed(2)
  }

  if (!partner) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600">請先登入聯盟夥伴帳號</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">推廣工具</h1>
        <p className="text-gray-600 mt-2">創建和管理您的推薦連結，追蹤推廣效果</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* 創建新連結 */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-xl font-semibold mb-4">創建新的推廣連結</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              連結名稱 *
            </label>
            <input
              type="text"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="例如：春季促銷推廣"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目標產品（可選）
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">首頁推廣</option>
              <option value="special-offer">特價商品</option>
              <option value="new-arrivals">新品上市</option>
              <option value="bestsellers">熱銷商品</option>
              <option value="seasonal">季節商品</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            連結描述
          </label>
          <textarea
            value={newLinkDescription}
            onChange={(e) => setNewLinkDescription(e.target.value)}
            placeholder="簡短描述這個連結的用途..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <UnifiedButton onClick={generateNewLink}>
          創建推廣連結
        </UnifiedButton>
      </div>

      {/* 現有連結列表 */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">我的推廣連結</h2>
        </div>

        <div className="divide-y">
          {linkVariations.map((link) => (
            <div key={link.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      link.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {link.isActive ? "啟用" : "停用"}
                    </span>
                  </div>
                  {link.description && (
                    <p className="text-gray-600 text-sm mb-2">{link.description}</p>
                  )}
                </div>

                <button
                  onClick={() => toggleLinkStatus(link.id)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {link.isActive ? "停用" : "啟用"}
                </button>
              </div>

              {/* 連結 URL */}
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={link.url}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border-0 bg-transparent focus:outline-none"
                  />
                  <UnifiedButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => copyLink(link.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </UnifiedButton>
                </div>
              </div>

              {/* 統計數據 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">點擊數</span>
                  </div>
                  <div className="text-xl font-bold">{link.clicks}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">轉換數</span>
                  </div>
                  <div className="text-xl font-bold">{link.conversions}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">轉換率</span>
                  </div>
                  <div className="text-xl font-bold">{getConversionRate(link.clicks, link.conversions)}%</div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex flex-wrap gap-2">
                <UnifiedButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => copyLink(link.url)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  複製
                </UnifiedButton>
                
                <UnifiedButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => generateQRCode(link.url)}
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  QR碼
                </UnifiedButton>
                
                <UnifiedButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => shareLink(link.url, link.name)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  分享
                </UnifiedButton>
                
                <UnifiedButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  預覽
                </UnifiedButton>
              </div>
            </div>
          ))}
        </div>

        {linkVariations.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>尚未創建任何推廣連結</p>
            <p className="text-sm">點擊上方「創建推廣連結」開始建立您的第一個推廣連結</p>
          </div>
        )}
      </div>
    </div>
  )
}
