import { Metadata } from "next"
import { notFound } from "next/navigation"
import SearchResults from "@modules/search/templates/search-results"

export const metadata: Metadata = {
  title: "搜尋結果",
  description: "搜尋商品和部落格文章",
}

type Props = {
  params: {
    countryCode: string
  }
  searchParams: {
    q?: string
    type?: string
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { q, type } = resolvedSearchParams
  const { countryCode } = resolvedParams
  
  if (!q || q.length < 1) {
    notFound()
  }

  return <SearchResults query={q} initialType={type || "all"} />
}
