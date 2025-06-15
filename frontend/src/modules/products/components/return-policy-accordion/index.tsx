"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getReturnPolicyHighlights } from "@lib/data/return-policy"
import { PortableText } from '@portabletext/react'
import type { PortableTextReactComponents } from '@portabletext/react'

type HighlightType = {
  title: string
  description: any[] // Portable Text 格式
}

const ReturnPolicyAccordion = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [highlights, setHighlights] = useState<HighlightType[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPolicyHighlights = async () => {
      try {
        const data = await getReturnPolicyHighlights()
        setHighlights(data)
      } catch (error) {
        console.error("無法載入退換貨政策亮點:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolicyHighlights()
  }, [])

  // 默認亮點，當 CMS 資料不可用時顯示
  const defaultHighlights = [
    {
      title: "七天鑑賞期",
      description: [{ 
        _type: 'block',
        children: [{ _type: 'span', text: '收到商品後，您有7天的時間可以申請退換貨。' }]
      }]
    },
    {
      title: "品質保證",
      description: [{ 
        _type: 'block',
        children: [{ _type: 'span', text: '若收到商品有瑕疵，我們提供免費更換或全額退款。' }]
      }]
    },
    {
      title: "簡易流程",
      description: [{ 
        _type: 'block',
        children: [{ _type: 'span', text: '線上申請退換貨，無需繁瑣手續，快速處理您的需求。' }]
      }]
    }
  ]

  // 使用CMS數據或默認數據
  const displayHighlights = highlights || defaultHighlights

  // Portable Text 組件設定
  const myPortableTextComponents: Partial<PortableTextReactComponents> = {
    block: {
      normal: ({children}) => <p className="text-sm text-gray-600">{children}</p>
    }
  }

  return (
    <div className="border-t border-gray-200 mt-12">
      <div className="content-container max-w-6xl mx-auto py-8 px-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-xl font-medium">商品退換貨政策</h2>
          <div className="text-gray-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        
        {isLoading && !isExpanded && (
          <div className="mt-2 text-sm text-gray-500">
            載入中...
          </div>
        )}

        {isExpanded && (
          <div className="mt-6 transition-all duration-300 ease-in-out">
            <div className={`grid grid-cols-1 gap-8 w-full ${
              displayHighlights.length === 1 
                ? 'md:grid-cols-1' 
                : displayHighlights.length === 2 
                  ? 'md:grid-cols-2' 
                  : 'md:grid-cols-3'
            }`}>
              {displayHighlights.map((highlight, index) => (
                <div key={index} className={displayHighlights.length === 1 ? 'max-w-3xl mx-auto' : ''}>
                  <h3 className="font-medium mb-2 text-sm uppercase tracking-wide">{highlight.title}</h3>
                  <div className="text-sm prose prose-sm max-w-none">
                    <PortableText 
                      value={highlight.description} 
                      components={myPortableTextComponents}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link 
                href="/tw/policies/return-policy" 
                className="inline-block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                查看完整退換貨政策詳情 →
              </Link>
            </div>
          </div>
        )}
        
        {!isExpanded && !isLoading && (
          <div className="mt-2 text-sm text-gray-500">
            點擊展開查看我們的退換貨政策
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnPolicyAccordion
