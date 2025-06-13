import fs from 'fs'
import path from 'path'
import { createClient } from '@sanity/client'

// 定義頁面類型
interface PageData {
  _type: string
  title: string
  slug: { current: string }
  isActive: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    shareImage?: {
      asset: {
        _ref: string
        url: string
      }
    }
  }
  mainSections?: Array<{
    _type: string
    title: string
    layout: 'text' | 'imageText' | 'gallery'
    content?: any[]
    images?: Array<{
      _type: string
      asset: {
        _ref: string
        url: string
      }
      alt?: string
      caption?: string
    }>
  }>
}

function generatePageContent(page: PageData): string {
  return `import { Metadata } from "next"
import { notFound } from "next/navigation"
import { SanityContent } from "@modules/common/components/sanity-content"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "${page.seo?.metaTitle || page.title}",
    description: "${page.seo?.metaDescription || ''}",
  }
}

export default function Page() {
  return (
    <div className="content-container py-6 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">${page.title}</h1>
        ${page.mainSections?.map(section => {
          switch(section.layout) {
            case 'text':
              return `{/* Text Section */}
              <div className="prose max-w-none mb-8">
                <SanityContent content={${JSON.stringify(section.content)}} />
              </div>`
            case 'imageText':
              return `{/* Image + Text Section */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="prose max-w-none">
                  <SanityContent content={${JSON.stringify(section.content)}} />
                </div>
                ${section.images?.map(image => `
                  <img src="${image.asset.url}" alt="${image.alt || ''}" className="w-full h-auto" />
                `).join('\n')}
              </div>`
            case 'gallery':
              return `{/* Gallery Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                ${section.images?.map(image => `
                  <img src="${image.asset.url}" alt="${image.alt || ''}" className="w-full h-auto" />
                `).join('\n')}
              </div>`
            default:
              return ''
          }
        }).join('\n        ')}
      </div>
    </div>
  )
}`
}

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
})

const PAGES_PATH = path.join(process.cwd(), 'src/app/[countryCode]/(main)')

async function generatePages() {
  console.log('📂 開始檢查並生成頁面...')
  
  try {
    // 確保目標目錄存在
    if (!fs.existsSync(PAGES_PATH)) {
      fs.mkdirSync(PAGES_PATH, { recursive: true })
    }

    // 從 Sanity 獲取所有頁面
    const sanityPages = await client.fetch<PageData[]>(`
      *[_type == "pages" && isActive == true] {
        _type,
        title,
        slug,
        isActive,
        seo,
        mainSections
      }
    `)

    // 處理每個頁面
    for (const page of sanityPages) {
      if (!page.slug?.current) continue

      const pagePath = path.join(PAGES_PATH, page.slug.current)
      
      // 創建頁面目錄
      if (!fs.existsSync(pagePath)) {
        fs.mkdirSync(pagePath, { recursive: true })
      }

      // 生成頁面內容
      const pageContent = generatePageContent(page)
      
      // 寫入 page.tsx 檔案
      fs.writeFileSync(
        path.join(pagePath, 'page.tsx'),
        pageContent,
        'utf-8'
      )

      console.log(`✅ 已生成頁面: ${page.slug.current}`)
    }

    console.log('🎉 所有頁面生成完成!')
  } catch (error) {
    console.error('❌ 生成頁面時發生錯誤:', error)
    process.exit(1)
  }
}

// 執行生成頁面
generatePages()
