import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import { getReturnPolicy } from "@lib/data/return-policy"
import { notFound } from "next/navigation"
import { PortableText } from '@portabletext/react'

type Highlight = {
  title: string;
  description: any[];
}

type ReturnPolicy = {
  title: string;
  _updatedAt: string;
  highlights?: Highlight[];
  fullPolicy: any[];
}

type Props = {
  params: { countryCode: string }
}

export const metadata: Metadata = {
  title: "退換貨政策 | TIMS HAIR SALON",
  description: "了解我們的退換貨政策、流程及條款",
}

export default async function ReturnPolicyPage({ params }: Props) {
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  // 從Sanity CMS獲取退換貨政策
  const policy = await getReturnPolicy().catch(() => null) as ReturnPolicy | null

  // 如果沒有找到政策，顯示基本信息
  if (!policy) {
    return (
      <div className="content-container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-wide mb-8 text-center">退換貨政策</h1>
          <p className="text-center">目前無法載入退換貨政策，請稍後再試或聯繫客服。</p>
        </div>
      </div>
    )
  }

  // 格式化日期
  const formattedDate = policy._updatedAt 
    ? new Date(policy._updatedAt).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '2025年5月15日'

  return (
    <div className="content-container py-12">
      <div className="w-full px-4">
        <h1 className="text-2xl md:text-3xl font-light uppercase tracking-wide mb-8 text-center">{policy.title || "退換貨政策"}</h1>
        
        {/* 政策亮點 */}
        {policy.highlights && policy.highlights.length > 0 && (
          <div className={`grid grid-cols-1 gap-8 my-8 max-w-6xl mx-auto ${
            policy.highlights.length === 1 
              ? 'md:grid-cols-1' 
              : policy.highlights.length === 2 
                ? 'md:grid-cols-2' 
                : 'md:grid-cols-3'
          }`}>
            {policy.highlights.map((highlight: Highlight, index: number) => (
              <div key={index} className={`border border-gray-200 p-4 ${policy.highlights && policy.highlights.length === 1 ? 'max-w-3xl mx-auto w-full' : ''}`}>
                <h3 className="font-medium mb-4 text-sm uppercase tracking-wide">{highlight.title}</h3>
                <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                  {highlight.description && (
                    <PortableText value={highlight.description} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 完整退換貨政策內容 */}
        <div className="prose prose-sm md:prose mx-auto max-w-4xl">
          {policy.fullPolicy && (
            <PortableText value={policy.fullPolicy} />
          )}
          
          <div className="mt-12 text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p>最後更新日期：{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
