import AffiliatePageClient from "./affiliate-page-client"

interface AffiliatePageProps {
  params: Promise<{ countryCode: string }>
}

export default async function AffiliatePage({ params }: AffiliatePageProps) {
  const { countryCode } = await params

  return <AffiliatePageClient countryCode={countryCode} />
}
