import EarningsPageClient from "./earnings-page-client"

interface EarningsPageProps {
  params: Promise<{ countryCode: string }>
}

export default async function EarningsPage({ params }: EarningsPageProps) {
  const { countryCode } = await params

  return <EarningsPageClient countryCode={countryCode} />
}
