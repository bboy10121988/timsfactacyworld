import { Metadata } from 'next'
import { getDefaultSEOSettings, mergeSEOMetadata } from '@/lib/seo'
import SEOHead from '@/components/seo/seo-head'

// 範例：部落格文章頁面
interface BlogPostPageProps {
  params: { slug: string }
}

// 從 Sanity 獲取文章資料和 SEO 設定
async function getBlogPost(slug: string) {
  // 這裡應該是您的 Sanity 查詢
  return {
    title: '如何選擇適合的洗髮精',
    content: '文章內容...',
    publishedAt: '2025-01-15T10:00:00Z',
    author: { name: '專業髮型師' },
    category: '護髮知識',
    seo: {
      seoTitle: '2025年最完整洗髮精選購指南 | 專業髮型師推薦',
      seoDescription: '學會如何根據髮質選擇最適合的洗髮精，解決頭皮出油、乾燥、敏感等問題。專業髮型師分享選購秘訣與產品推薦。',
      focusKeyword: '洗髮精推薦',
      seoKeywords: ['洗髮精', '護髮', '頭皮護理', '髮質', '專業推薦'],
      ogTitle: '髮型師教你選洗髮精｜解決所有頭髮問題',
      ogDescription: '告別髮質困擾！專業髮型師親授選購秘訣',
      ogImage: {
        asset: { url: 'https://example.com/blog-hero-image.jpg' },
        alt: '專業髮型師示範洗髮精使用方法'
      },
      structuredDataType: 'article',
      articleType: 'blog',
      priority: 0.7,
      changeFrequency: 'monthly' as const
    }
  }
}

// 生成頁面 metadata
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  const defaultMeta = await getDefaultSEOSettings()
  
  const metadata: Metadata = {
    title: post.title,
    description: post.content.slice(0, 160) + '...',
  }
  
  return mergeSEOMetadata(metadata, defaultMeta, post.seo)
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)
  
  return (
    <>
      {/* SEO Head 包含結構化資料和所有 SEO 元素 */}
      <SEOHead
        pageData={post}
        sanityMeta={post.seo}
        pageType="article"
      />
      
      <main>
        <article>
          <header>
            <h1>{post.title}</h1>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('zh-TW')}
            </time>
            <p>作者：{post.author.name}</p>
          </header>
          
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}

// 範例：產品頁面
export async function ProductPageExample() {
  const productData = {
    id: 'product-123',
    title: '專業修護洗髮精 500ml',
    description: '深層修護受損髮質，恢復髮絲光澤與彈性',
    price: 890,
    images: ['/product-hero.jpg'],
    seo: {
      seoTitle: '專業修護洗髮精 500ml - 深層修護受損髮質 | Tim\'s Hair',
      seoDescription: '台灣製造專業修護洗髮精，溫和清潔同時深層修護，適合受損、染燙髮質。30天滿意保證，全台免運。',
      focusKeyword: '修護洗髮精',
      seoKeywords: ['修護洗髮精', '受損髮質', '深層修護', '專業護髮', 'Tims Hair'],
      structuredDataType: 'product',
      priority: 0.9,
      changeFrequency: 'weekly' as const
    }
  }
  
  const defaultMeta = await getDefaultSEOSettings()
  const metadata = mergeSEOMetadata(
    {
      title: productData.title,
      description: productData.description,
    },
    defaultMeta,
    productData.seo
  )
  
  return (
    <>
      <SEOHead
        pageData={productData}
        sanityMeta={productData.seo}
        pageType="product"
      />
      
      <main>
        <div>
          <h1>{productData.title}</h1>
          <p>{productData.description}</p>
          <p>價格: ${productData.price}</p>
          {/* 產品內容 */}
        </div>
      </main>
    </>
  )
}
