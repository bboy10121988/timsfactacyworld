import { Metadata } from "next"
import { getPageBySlug, getAllPages } from "@lib/sanity"
import { notFound } from "next/navigation"
import { PortableText } from "@portabletext/react"
import { createClient } from "@sanity/client"
import { listRegions } from "@lib/data/regions"
import type { HttpTypes } from "@medusajs/types"
import PageRenderer from "@modules/pages/components/page-renderer"

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true
})

type SanityPage = {
  slug: string
}

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateStaticParams() {
  // 為了解決在Vercel上無法連接到Medusa API的問題
  // 返回一個簡單的靜態路徑集合
  return [
    { countryCode: "us", slug: "about" },
    { countryCode: "tw", slug: "about" }
  ]
  
  /*
  // 獲取所有啟用的頁面
  const pages = await client.fetch<SanityPage[]>(`*[_type == "pages" && isActive == true]{
    "slug": slug.current
  }`)

  // 獲取所有國家代碼
  const countryCodes = await listRegions().then(
    (regions: HttpTypes.StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  // 生成所有可能的頁面路徑
  const paths = countryCodes.flatMap((countryCode) =>
    pages.map((page: SanityPage) => ({
      countryCode,
      slug: page.slug,
    }))
  )
  */

  return paths
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { slug } = params
  const pageData = await getPageBySlug(slug)

  if (!pageData) {
    return {
      title: '找不到頁面',
      description: '很抱歉，找不到您請求的頁面'
    }
  }

  const { seo, title } = pageData

  return {
    title: seo?.metaTitle || title,
    description: seo?.metaDescription || '',
    alternates: seo?.canonicalUrl ? {
      canonical: seo.canonicalUrl
    } : undefined
  }
}

export default async function DynamicPage(props: Props) {
  const params = await props.params
  const { slug } = params
  const pageData = await getPageBySlug(slug)

  if (!pageData || !pageData.isActive) {
    return notFound()
  }

  return <PageRenderer pageData={pageData} />
}
